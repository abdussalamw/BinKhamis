<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeacherProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    /**
     * Display a listing of the staff members.
     */
    public function index()
    {
        $staff = User::whereIn('role', ['owner', 'admin', 'teacher', 'manager', 'supervisor'])
            ->with('teacherProfile')
            ->latest()
            ->get();
            
        return response()->json($staff);
    }

    /**
     * Store a newly created staff member in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone',
            'role' => 'required|in:admin,teacher,manager,supervisor',
            'password' => 'nullable|string|min:8', // Allow null for imported/activation flow
            'bank_account_number' => 'nullable|string',
            'specialization' => 'nullable|string',
            'qualification' => 'nullable|string',
        ]);

        // Security Check: Only Owner can create Admin
        if ($validated['role'] === 'admin' && $request->user()->role !== 'owner') {
            return response()->json(['message' => 'عذراً، المالك فقط يمكنه منح صلاحية مدير النظام.'], 403);
        }

        return DB::transaction(function() use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'role' => $validated['role'],
                'password' => $validated['password'] ? bcrypt($validated['password']) : null,
                'is_active' => true,
            ]);

            $user->teacherProfile()->create([
                'bank_account_number' => $validated['bank_account_number'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'metadata' => ['qualification' => $validated['qualification'] ?? null],
            ]);

            // Assign Spatie Role
            $user->assignRole($validated['role']);

            return response()->json($user->load('teacherProfile'), 201);
        });
    }

    /**
     * Display the specified staff member.
     */
    public function show(string $id)
    {
        $member = User::whereIn('role', ['admin', 'teacher', 'manager'])
            ->with('teacherProfile')
            ->findOrFail($id);
            
        return response()->json($member);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, string $id)
    {
        $user = User::whereIn('role', ['admin', 'teacher', 'manager'])->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$user->id,
            'phone' => 'sometimes|required|string',
            'role' => 'sometimes|required|in:admin,teacher,manager',
            'is_active' => 'sometimes|boolean',
            'bank_account_number' => 'nullable|string',
            'specialization' => 'nullable|string',
            'qualification' => 'nullable|string',
        ]);

        DB::transaction(function() use ($user, $validated) {
            $user->update(array_intersect_key($validated, array_flip(['name', 'email', 'phone', 'role', 'is_active'])));
            
            $profileData = array_intersect_key($validated, array_flip([
                'bank_account_number', 'specialization', 'qualification'
            ]));
            
            if ($user->teacherProfile) {
                $user->teacherProfile->update($profileData);
            } else {
                $user->teacherProfile()->create($profileData);
            }
        });

        return response()->json($user->load('teacherProfile'));
    }

    /**
     * Toggle staff member status.
     */
    public function toggleStatus(string $id)
    {
        $member = User::whereIn('role', ['admin', 'teacher', 'manager'])->findOrFail($id);
        $member->is_active = !$member->is_active;
        $member->save();

        return response()->json(['message' => 'تم تحديث حالة العضو بنجاح', 'is_active' => $member->is_active]);
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(string $id)
    {
        $user = User::whereIn('role', ['admin', 'teacher', 'manager'])->findOrFail($id);
        
        // FIX C3: Prevent deletion if the teacher has active circles
        if ($user->role === 'teacher' && $user->circles()->exists()) {
            return response()->json(['message' => 'لا يمكن حذف المعلم لأنه مرتبط بحلقة نشطة. يرجى تغيير معلم الحلقة أولاً.'], 422);
        }

        $user->teacherProfile()->delete();
        $user->delete();

        return response()->json(['message' => 'تم حذف العضو بنجاح']);
    }
}

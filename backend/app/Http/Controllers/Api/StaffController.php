<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    /**
     * Display a listing of the staff members.
     */
    public function index()
    {
        $staff = User::whereIn('role', ['admin', 'teacher', 'manager'])
            ->with('profile')
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
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string',
            'role' => 'required|in:admin,teacher,manager',
            'password' => 'required|string|min:8',
            'bank_account_number' => 'nullable|string',
            'specialization' => 'nullable|string',
            'qualification' => 'nullable|string',
        ]);

        return DB::transaction(function() use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'role' => $validated['role'],
                'password' => bcrypt($validated['password']),
                'is_active' => true,
            ]);

            $user->profile()->create([
                'type' => $validated['role'],
                'bank_account_number' => $validated['bank_account_number'],
                'specialization' => $validated['specialization'],
                'qualification' => $validated['qualification'],
            ]);

            return response()->json($user->load('profile'), 201);
        });
    }

    /**
     * Display the specified staff member.
     */
    public function show(string $id)
    {
        $member = User::whereIn('role', ['admin', 'teacher', 'manager'])
            ->with('profile')
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
            
            if ($user->profile) {
                $user->profile->update($profileData);
            } else {
                $user->profile()->create(array_merge($profileData, ['type' => $user->role]));
            }
        });

        return response()->json($user->load('profile'));
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
        
        // Prevent deletion if the teacher is assigned to a circle
        if ($user->role === 'teacher' && $user->circle) {
             return response()->json(['message' => 'لا يمكن حذف المعلم لأنه مرتبط بحلقة نشطة. يرجى تغيير معلم الحلقة أولاً.'], 422);
        }

        $user->profile()->delete();
        $user->delete();

        return response()->json(['message' => 'تم حذف العضو بنجاح']);
    }
}

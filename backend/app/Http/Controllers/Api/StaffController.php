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
        // FIX: added pagination for scalability (D1 was only applied to students)
        $staff = User::whereIn('role', ['owner', 'admin', 'teacher', 'manager', 'supervisor'])
            ->latest()
            ->paginate(50);
            
        return response()->json($staff);
    }

    /**
     * Store a newly created staff member in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
            'role' => 'required|in:admin,teacher,manager,supervisor',
            'password' => 'nullable|string|min:8', // Allow null for imported/activation flow
            'bank_account_number' => 'nullable|string',
            'specialization' => 'nullable|string',
            'qualification' => 'nullable|string',
        ]);

        // Phone protection per role: Ensure same role doesn't duplicate same phone
        $existingStaff = User::where('phone', $validated['phone'])
            ->where('role', $validated['role'])
            ->exists();

        if ($existingStaff) {
            return response()->json(['message' => 'رقم الجوال مسجل بالفعل لعضو آخر بنفس هذا الدور الوظيفي.'], 422);
        }

        // Security Check: Only superadmin can create Admin
        if ($validated['role'] === 'admin' && $request->user()->role !== 'owner') {
            return response()->json(['message' => 'عذراً، superadmin فقط يمكنه منح صلاحية مدير النظام.'], 403);
        }

        return DB::transaction(function() use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'role' => $validated['role'],
                'password' => $validated['password'] ? bcrypt($validated['password']) : null,
                'is_active' => true,
                'bank_account_number' => $validated['bank_account_number'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'academic_qualification' => $validated['qualification'] ?? null,
            ]);

            // Assign Spatie Role
            $user->assignRole($validated['role']);

            return response()->json($user, 201);
        });
    }

    /**
     * Display the specified staff member.
     */
    public function show(string $id)
    {
        // FIX: only owner can bypass school scope, maintaining tenant isolation
        $currentUser = auth()->user();
        $query = User::whereIn('role', ['admin', 'teacher', 'manager', 'supervisor', 'owner']);
        
        if ($currentUser && $currentUser->role === 'owner') {
            $query->withoutGlobalScope('school');
        }

        $member = $query->find($id);

        if (!$member) {
            return response()->json(['message' => 'عذراً، العضو غير موجود'], 404);
        }
            
        return response()->json($member);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, string $id)
    {
        // FIX: only owner can bypass school scope, maintaining tenant isolation
        $currentUser = auth()->user();
        $query = User::whereIn('role', ['admin', 'teacher', 'manager', 'supervisor', 'owner']);
        
        if ($currentUser && $currentUser->role === 'owner') {
            $query->withoutGlobalScope('school');
        }

        $user = $query->find($id);

        if (!$user) {
            return response()->json(['message' => 'عذراً، العضو غير موجود'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$user->id,
            'phone' => 'sometimes|required|string',
            'role' => 'sometimes|required|in:admin,teacher,manager,supervisor',
            'is_active' => 'sometimes|boolean',
            'bank_account_number' => 'nullable|string',
            'specialization' => 'nullable|string',
            'qualification' => 'nullable|string',
        ]);

        DB::transaction(function() use ($user, $validated) {
            $updateData = array_intersect_key($validated, array_flip([
                'name', 'email', 'phone', 'role', 'is_active', 'bank_account_number', 'specialization'
            ]));
            if (isset($validated['qualification'])) {
                $updateData['academic_qualification'] = $validated['qualification'];
            }
            $user->update($updateData);

            if (isset($validated['role'])) {
                $user->syncRoles([$validated['role']]);
            }
        });

        return response()->json($user);
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

        // FIX: teacherProfile() relation removed after profiles merge into users table
        // Delete related evaluations and leaves before deleting the user
        \App\Models\Evaluation::where('teacher_id', $user->id)->delete();
        \App\Models\TeacherLeave::where('teacher_id', $user->id)->delete();
        $user->delete();

        return response()->json(['message' => 'تم حذف العضو بنجاح']);
    }
}

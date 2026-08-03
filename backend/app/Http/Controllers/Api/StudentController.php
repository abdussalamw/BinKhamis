<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 50), 100);
        $currentUser = auth()->user();
        
        $query = User::where('role', 'student')
            ->with(['guardian', 'secondaryGuardian', 'enrollments.circle'])
            ->withCount(['enrollments' => function($q) {
                $q->where('status', 'active');
            }])
            ->latest();

        // FIX: only owner can bypass school scope, maintaining tenant isolation
        if ($currentUser && $currentUser->role === 'owner') {
            $query->withoutGlobalScope('school');
        }

        $students = $query->paginate($perPage);
            
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'identity_number' => 'nullable|string',
            'identity_type' => 'nullable|string',
            'passport_number' => 'nullable|string',
            'place_of_birth' => 'nullable|string',
            'status' => 'nullable|string',
            'academic_stage' => 'nullable|string',
            'grade_level' => 'nullable|string',
            'school_name' => 'nullable|string',
            'neighborhood' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'memorization_amount' => 'nullable|string',
            'guardian_name' => 'nullable|string',
            'guardian_phone' => 'nullable|string',
            'guardian_relation' => 'nullable|string',
            'secondary_guardian_name' => 'nullable|string',
            'secondary_guardian_phone' => 'nullable|string',
            'secondary_guardian_relation' => 'nullable|string',
        ]);

        return DB::transaction(function() use ($validated) {
            $currentUser = auth()->user();
            $schoolId = $currentUser ? $currentUser->school_id : null;

            $guardianId = null;
            if (!empty($validated['guardian_phone'])) {
                $guardian = \App\Models\Guardian::firstOrCreate(
                    ['phone_number' => $validated['guardian_phone']],
                    [
                        'full_name' => $validated['guardian_name'] ?? ('ولي أمر ' . $validated['name']),
                        'relation' => $validated['guardian_relation'] ?? 'أب',
                    ]
                );
                $guardianId = $guardian->id;
            }

            $secondaryGuardianId = null;
            if (!empty($validated['secondary_guardian_phone'])) {
                $secGuardian = \App\Models\Guardian::firstOrCreate(
                    ['phone_number' => $validated['secondary_guardian_phone']],
                    [
                        'full_name' => $validated['secondary_guardian_name'] ?? ('ولي أمر 2 لـ ' . $validated['name']),
                        'relation' => $validated['secondary_guardian_relation'] ?? 'أم',
                    ]
                );
                $secondaryGuardianId = $secGuardian->id;
            }

            $user = User::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? ($validated['phone'] . '@hpro.com'),
                'role' => 'student',
                'password' => bcrypt('student123'),
                'is_active' => true,
                'school_id' => $schoolId,
                'national_id' => $validated['identity_number'] ?? null,
                'identity_type' => $validated['identity_type'] ?? 'national_id',
                'passport_number' => $validated['passport_number'] ?? null,
                'place_of_birth' => $validated['place_of_birth'] ?? null,
                'status' => $validated['status'] ?? 'active',
                'academic_stage' => $validated['academic_stage'] ?? null,
                'grade_level' => $validated['grade_level'] ?? null,
                'neighborhood' => $validated['neighborhood'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'memorization_amount' => $validated['memorization_amount'] ?? null,
                'guardian_id' => $guardianId,
                'secondary_guardian_id' => $secondaryGuardianId,
            ]);

            return response()->json($user->load(['guardian', 'secondaryGuardian', 'enrollments.circle']), 201);
        });
    }

    public function show($id)
    {
        // FIX: only owner can bypass school scope, maintaining tenant isolation
        // Removed the fallback withoutGlobalScope that allowed cross-tenant access
        $currentUser = auth()->user();
        $query = User::where('role', 'student')
            ->with(['guardian', 'secondaryGuardian', 'enrollments' => function($q) {
                $q->where('status', 'active')->with('circle');
            }]);

        if ($currentUser && $currentUser->role === 'owner') {
            $query->withoutGlobalScope('school');
        }

        $student = $query->find($id);

        if (!$student) {
            return response()->json(['message' => 'عذراً، الطالب غير موجود'], 404);
        }
            
        return response()->json($student);
    }

    public function update(Request $request, $id)
    {
        // FIX: only owner can bypass school scope, maintaining tenant isolation
        // Removed the fallback withoutGlobalScope that allowed cross-tenant access
        $currentUser = auth()->user();
        $query = User::where('role', 'student');
        if ($currentUser && $currentUser->role === 'owner') {
            $query->withoutGlobalScope('school');
        }

        $user = $query->find($id);

        if (!$user) {
            return response()->json(['message' => 'عذراً، الطالب غير موجود'], 404);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string',
            'email' => 'nullable|email',
            'identity_number' => 'nullable|string',
            'identity_type' => 'nullable|string',
            'passport_number' => 'nullable|string',
            'place_of_birth' => 'nullable|string',
            'status' => 'nullable|string',
            'academic_stage' => 'nullable|string',
            'grade_level' => 'nullable|string',
            'school_name' => 'nullable|string',
            'neighborhood' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'memorization_amount' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'guardian_name' => 'nullable|string',
            'guardian_phone' => 'nullable|string',
            'guardian_relation' => 'nullable|string',
            'secondary_guardian_name' => 'nullable|string',
            'secondary_guardian_phone' => 'nullable|string',
            'secondary_guardian_relation' => 'nullable|string',
        ]);

        DB::transaction(function() use ($user, $validated) {
            $guardianId = $user->guardian_id;
            if (!empty($validated['guardian_phone'])) {
                $guardian = \App\Models\Guardian::updateOrCreate(
                    ['phone_number' => $validated['guardian_phone']],
                    [
                        'full_name' => $validated['guardian_name'] ?? ('ولي أمر ' . $user->name),
                        'relation' => $validated['guardian_relation'] ?? 'أب',
                    ]
                );
                $guardianId = $guardian->id;
            }

            $secondaryGuardianId = $user->secondary_guardian_id;
            if (!empty($validated['secondary_guardian_phone'])) {
                $secGuardian = \App\Models\Guardian::updateOrCreate(
                    ['phone_number' => $validated['secondary_guardian_phone']],
                    [
                        'full_name' => $validated['secondary_guardian_name'] ?? ('ولي أمر 2 لـ ' . $user->name),
                        'relation' => $validated['secondary_guardian_relation'] ?? 'أم',
                    ]
                );
                $secondaryGuardianId = $secGuardian->id;
            }

            $updateData = array_intersect_key($validated, array_flip([
                'name', 'phone', 'email', 'is_active', 'identity_type', 'passport_number',
                'place_of_birth', 'status', 'academic_stage', 'grade_level', 'school_name',
                'neighborhood', 'birth_date', 'memorization_amount'
            ]));

            if (isset($validated['identity_number'])) {
                $updateData['national_id'] = $validated['identity_number'];
            }

            $updateData['guardian_id'] = $guardianId;
            $updateData['secondary_guardian_id'] = $secondaryGuardianId;

            $user->update(array_filter($updateData, function($val) { return !is_null($val); }));
        });

        return response()->json($user->load(['guardian', 'secondaryGuardian', 'enrollments.circle']));
    }

    public function destroy($id)
    {
        $user = User::where('role', 'student')->findOrFail($id);
        
        // D6: Clean up all related records before deleting
        // FIX: studentProfile() relation removed after profiles merge into users table
        DB::transaction(function () use ($user) {
            $enrollmentIds = \App\Models\Enrollment::where('student_id', $user->id)->pluck('id');
            
            // Delete attendance records for this student's enrollments
            \App\Models\Attendance::whereIn('enrollment_id', $enrollmentIds)->delete();
            
            // Delete enrollments
            \App\Models\Enrollment::where('student_id', $user->id)->delete();
            
            // Delete progress tracking
            \App\Models\ProgressTracking::where('student_id', $user->id)->delete();
            
            // Delete enrollment histories
            \App\Models\EnrollmentHistory::where('student_id', $user->id)->delete();
            
            // Delete the user (profile fields are now on the users table itself)
            $user->delete();
        });

        return response()->json(['message' => 'تم حذف الطالب وجميع بياناته المرتبطة بنجاح']);
    }
}

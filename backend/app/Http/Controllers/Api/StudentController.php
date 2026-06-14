<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 50), 100);
        $students = User::where('role', 'student')
            ->with('studentProfile')
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'active');
            }])
            ->latest()
            ->paginate($perPage);
            
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone',
            'email' => 'nullable|email',
            'identity_number' => 'nullable|string',
            'academic_stage' => 'nullable|string',
            'grade_level' => 'nullable|string',
            'school_name' => 'nullable|string',
            'neighborhood' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'memorization_amount' => 'nullable|string',
        ]);

        return DB::transaction(function() use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? ($validated['phone'] . '@binkhamis.com'),
                'role' => 'student',
                'password' => bcrypt('student123'),
                'is_active' => true,
            ]);

            $user->studentProfile()->create([
                'identity_number' => $validated['identity_number'],
                'academic_stage' => $validated['academic_stage'],
                'grade_level' => $validated['grade_level'],
                'school_name' => $validated['school_name'],
                'neighborhood' => $validated['neighborhood'],
                'birth_date' => $validated['birth_date'],
                'current_level' => $validated['memorization_amount'],
            ]);

            return response()->json($user->load('studentProfile'), 201);
        });
    }

    public function show($id)
    {
        $student = User::where('role', 'student')
            ->with(['studentProfile', 'enrollments' => function($query) {
                $query->where('status', 'active')->with('circle');
            }])
            ->findOrFail($id);
            
        return response()->json($student);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role', 'student')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string',
            'email' => 'nullable|email',
            'identity_number' => 'nullable|string',
            'academic_stage' => 'nullable|string',
            'grade_level' => 'nullable|string',
            'school_name' => 'nullable|string',
            'neighborhood' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'memorization_amount' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        DB::transaction(function() use ($user, $validated) {
            $user->update(array_intersect_key($validated, array_flip(['name', 'phone', 'email', 'is_active'])));
            
            $profileData = array_intersect_key($validated, array_flip([
                'identity_number', 'academic_stage', 'grade_level', 
                'school_name', 'neighborhood', 'birth_date', 'memorization_amount'
            ]));
            
            if ($user->studentProfile) {
                $user->studentProfile->update($profileData);
            } else {
                $user->studentProfile()->create($profileData);
            }
        });

        return response()->json($user->load('studentProfile'));
    }

    public function destroy($id)
    {
        $user = User::where('role', 'student')->findOrFail($id);
        
        // D6: Clean up all related records before deleting
        DB::transaction(function () use ($user) {
            $enrollmentIds = \App\Models\Enrollment::where('student_id', $user->id)->pluck('id');
            
            // Delete attendance records for this student's enrollments
            \App\Models\Attendance::whereIn('enrollment_id', $enrollmentIds)->delete();
            
            // Delete enrollments
            \App\Models\Enrollment::where('student_id', $user->id)->delete();
            
            // Delete progress tracking
            \App\Models\ProgressTracking::where('student_id', $user->id)->delete();
            
            // Delete profile and user
            $user->studentProfile()->delete();
            $user->delete();
        });

        return response()->json(['message' => 'تم حذف الطالب وجميع بياناته المرتبطة بنجاح']);
    }
}

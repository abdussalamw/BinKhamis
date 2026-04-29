<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index()
    {
        $students = User::where('role', 'student')
            ->with('profile')
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'active');
            }])
            ->latest()
            ->get();
            
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
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

            $user->profile()->create([
                'type' => 'student',
                'identity_number' => $validated['identity_number'],
                'academic_stage' => $validated['academic_stage'],
                'grade_level' => $validated['grade_level'],
                'school_name' => $validated['school_name'],
                'neighborhood' => $validated['neighborhood'],
                'birth_date' => $validated['birth_date'],
                'memorization_amount' => $validated['memorization_amount'],
            ]);

            return response()->json($user->load('profile'), 201);
        });
    }

    public function show($id)
    {
        $student = User::where('role', 'student')
            ->with(['profile', 'enrollments' => function($query) {
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
            
            if ($user->profile) {
                $user->profile->update($profileData);
            } else {
                $user->profile()->create(array_merge($profileData, ['type' => 'student']));
            }
        });

        return response()->json($user->load('profile'));
    }

    public function destroy($id)
    {
        $user = User::where('role', 'student')->findOrFail($id);
        
        // Delete profile and user
        $user->profile()->delete();
        $user->delete();

        return response()->json(['message' => 'تم حذف الطالب بنجاح']);
    }
}

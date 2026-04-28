<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teachers = User::where('role', 'teacher')
            ->with('profile')
            ->latest()
            ->paginate(15);
            
        return response()->json($teachers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'birth_date' => 'nullable|date',
            'gender' => 'required|in:M,F',
            'specialization' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'bio' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'] ?? null,
                    'phone' => $validated['phone'],
                    'password' => Hash::make(Str::random(12)),
                    'role' => 'teacher',
                    'is_active' => true,
                ]);

                $user->profile()->create([
                    'type' => 'teacher',
                    'birth_date' => $validated['birth_date'] ?? null,
                    'gender' => $validated['gender'],
                    'specialization' => $validated['specialization'] ?? null,
                    'hire_date' => $validated['hire_date'] ?? null,
                    'bio' => $validated['bio'] ?? null,
                ]);

                return response()->json($user->load('profile'), 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'فشل إضافة المعلم', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $teacher = User::where('role', 'teacher')
            ->with(['profile', 'circles'])
            ->findOrFail($id);
            
        return response()->json($teacher);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $id,
            'phone' => 'sometimes|required|string|unique:users,phone,' . $id,
            'birth_date' => 'nullable|date',
            'gender' => 'sometimes|required|in:M,F',
            'specialization' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'bio' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($teacher, $validated) {
                $teacher->update(collect($validated)->only(['name', 'email', 'phone'])->toArray());

                $teacher->profile()->update(collect($validated)->only([
                    'birth_date', 'gender', 'specialization', 'hire_date', 'bio'
                ])->toArray());
            });

            return response()->json($teacher->load('profile'));
        } catch (\Exception $e) {
            return response()->json(['message' => 'فشل تحديث بيانات المعلم', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        $teacher->delete();
        
        return response()->json(['message' => 'تم حذف المعلم بنجاح']);
    }
}

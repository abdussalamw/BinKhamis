<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $students = User::where('role', 'student')
            ->with('profile')
            ->latest()
            ->paginate(15);
            
        return response()->json($students);
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
            'address' => 'nullable|string',
            'current_level' => 'nullable|string',
            'memorization_method' => 'nullable|string',
            'parent_id' => 'nullable|uuid|exists:users,id',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'] ?? null,
                    'phone' => $validated['phone'],
                    'password' => Hash::make(Str::random(12)), // Password not needed yet
                    'role' => 'student',
                    'is_active' => true,
                ]);

                $user->profile()->create([
                    'type' => 'student',
                    'birth_date' => $validated['birth_date'] ?? null,
                    'gender' => $validated['gender'],
                    'address' => $validated['address'] ?? null,
                    'current_level' => $validated['current_level'] ?? null,
                    'memorization_method' => $validated['memorization_method'] ?? null,
                    'parent_id' => $validated['parent_id'] ?? null,
                ]);

                return response()->json($user->load('profile'), 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'فشل إنشاء الطالب', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = User::where('role', 'student')
            ->with('profile')
            ->findOrFail($id);
            
        return response()->json($student);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $id,
            'phone' => 'sometimes|required|string|unique:users,phone,' . $id,
            'birth_date' => 'nullable|date',
            'gender' => 'sometimes|required|in:M,F',
            'address' => 'nullable|string',
            'current_level' => 'nullable|string',
            'memorization_method' => 'nullable|string',
            'parent_id' => 'nullable|uuid|exists:users,id',
        ]);

        try {
            DB::transaction(function () use ($student, $validated) {
                $student->update(collect($validated)->only(['name', 'email', 'phone'])->toArray());

                $student->profile()->update(collect($validated)->only([
                    'birth_date', 'gender', 'address', 'current_level', 'memorization_method', 'parent_id'
                ])->toArray());
            });

            return response()->json($student->load('profile'));
        } catch (\Exception $e) {
            return response()->json(['message' => 'فشل تحديث بيانات الطالب', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->delete();
        
        return response()->json(['message' => 'تم حذف الطالب بنجاح']);
    }
}

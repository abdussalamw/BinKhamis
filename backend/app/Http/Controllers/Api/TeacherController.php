<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeacherProfile;
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
            ->with('teacherProfile')
            ->latest()
            ->get(); // Changed to get() to match frontend expectations
            
        return response()->json($teachers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
            'email' => 'nullable|email|unique:users,email',
            'specialization' => 'nullable|string|max:100',
            'national_id' => 'nullable|string',
            'identity_type' => 'nullable|string',
            'status' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'academic_qualification' => 'nullable|string',
            'graduation_year' => 'nullable|string',
            'university' => 'nullable|string',
            'quran_ijazat' => 'nullable|array',
            'basic_salary' => 'nullable|numeric',
        ]);

        // Phone protection for teacher role
        if (User::where('phone', $validated['phone'])->where('role', 'teacher')->exists()) {
            return response()->json(['message' => 'رقم الجوال مسجل بالفعل لمعلم آخر.'], 422);
        }

        try {
            return DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'] ?? null,
                    'phone' => $validated['phone'],
                    'password' => Hash::make(Str::random(12)),
                    'role' => 'teacher',
                    'is_active' => true,
                    'specialization' => $validated['specialization'] ?? null,
                    'national_id' => $validated['national_id'] ?? null,
                    'identity_type' => $validated['identity_type'] ?? 'national_id',
                    'status' => $validated['status'] ?? 'active',
                    'bank_name' => $validated['bank_name'] ?? null,
                    'bank_account_number' => $validated['bank_account_number'] ?? null,
                    'academic_qualification' => $validated['academic_qualification'] ?? null,
                    'graduation_year' => $validated['graduation_year'] ?? null,
                    'university' => $validated['university'] ?? null,
                    'quran_ijazat' => $validated['quran_ijazat'] ?? null,
                    'basic_salary' => $validated['basic_salary'] ?? null,
                ]);

                return response()->json($user->load('circles'), 201);
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
        $teacher = User::withoutGlobalScope('school')
            ->where('role', 'teacher')
            ->with(['circles'])
            ->find($id);

        if (!$teacher) {
            return response()->json(['message' => 'عذراً، المعلم غير موجود'], 404);
        }
            
        return response()->json($teacher);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $teacher = User::withoutGlobalScope('school')->where('role', 'teacher')->find($id);

        if (!$teacher) {
            return response()->json(['message' => 'عذراً، المعلم غير موجود'], 404);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|unique:users,phone,' . $id,
            'specialization' => 'nullable|string',
            'national_id' => 'nullable|string',
            'identity_type' => 'nullable|string',
            'status' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'academic_qualification' => 'nullable|string',
            'graduation_year' => 'nullable|string',
            'university' => 'nullable|string',
            'quran_ijazat' => 'nullable|array',
            'basic_salary' => 'nullable|numeric',
        ]);

        try {
            DB::transaction(function () use ($teacher, $validated) {
                $teacher->update($validated);
            });

            return response()->json($teacher->load('circles'));
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

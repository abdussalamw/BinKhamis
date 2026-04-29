<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circle;
use Illuminate\Http\Request;

class CircleController extends Controller
{
    /**
     * Display a listing of the circles.
     */
    public function index()
    {
        $circles = Circle::with('teacher')
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'active');
            }])
            ->get();
            
        return response()->json($circles);
    }

    /**
     * Store a newly created circle.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'teacher_id' => 'required|exists:users,id',
            'capacity' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'schedule' => 'nullable|array',
        ]);

        $circle = Circle::create($validated);

        return response()->json($circle->load('teacher'), 201);
    }

    /**
     * Display the specified circle with enrollments.
     */
    public function show(string $id)
    {
        $circle = Circle::with(['teacher', 'enrollments' => function($query) {
                $query->where('status', 'active')->with('student.profile');
            }])
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'active');
            }])
            ->findOrFail($id);
            
        return response()->json($circle);
    }

    /**
     * Update the specified circle.
     */
    public function update(Request $request, string $id)
    {
        $circle = Circle::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'teacher_id' => 'sometimes|required|exists:users,id',
            'capacity' => 'sometimes|required|integer|min:1',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'schedule' => 'nullable|array',
        ]);

        $circle->update($validated);

        return response()->json($circle->load('teacher'));
    }

    /**
     * Remove the specified circle.
     */
    public function destroy(string $id)
    {
        $circle = Circle::findOrFail($id);
        
        // Prevent deletion if there are students enrolled
        if ($circle->enrollments()->count() > 0) {
            return response()->json([
                'message' => 'لا يمكن حذف الحلقة لوجود طلاب مسجلين بها. يرجى نقل الطلاب أولاً.'
            ], 422);
        }

        $circle->delete();

        return response()->json(['message' => 'تم حذف الحلقة بنجاح']);
    }
}

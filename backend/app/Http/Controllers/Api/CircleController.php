<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circle;
use Illuminate\Http\Request;

class CircleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $circles = Circle::with('teacher')
            ->latest()
            ->paginate(15);
            
        return response()->json($circles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'location' => 'required|string',
            'schedule' => 'required|array',
            'capacity' => 'required|integer|min:1',
            'teacher_id' => 'required|uuid|exists:users,id',
            'is_active' => 'boolean',
        ]);

        $circle = Circle::create($validated);

        return response()->json($circle->load('teacher'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $circle = Circle::with(['teacher', 'enrollments.student'])->findOrFail($id);
        return response()->json($circle);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $circle = Circle::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'location' => 'sometimes|required|string',
            'schedule' => 'sometimes|required|array',
            'capacity' => 'sometimes|required|integer|min:1',
            'teacher_id' => 'sometimes|required|uuid|exists:users,id',
            'is_active' => 'boolean',
        ]);

        $circle->update($validated);

        return response()->json($circle->load('teacher'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $circle = Circle::findOrFail($id);
        $circle->delete();
        
        return response()->json(['message' => 'تم حذف الحلقة بنجاح']);
    }
}

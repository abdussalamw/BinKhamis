<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circle;
use App\Models\AcademicTerm;
use Illuminate\Http\Request;

class CircleController extends Controller
{
    /**
     * Display a listing of the circles.
     */
    public function index()
    {
        $user = auth()->user();
        $query = Circle::with(['teacher', 'term'])
            ->withCount(['enrollments' => function($q) {
                $q->where('status', 'active');
            }]);

        if ($user) {
            if (!$user->school_id || $user->role === 'owner') {
                $query->withoutGlobalScope('school');
            } else {
                $query->withoutGlobalScope('school')
                      ->where(function($q) use ($user) {
                          $q->where('school_id', $user->school_id)
                            ->orWhereNull('school_id');
                      });
            }
        }

        $circles = $query->get();
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
            'term_id' => 'nullable|exists:academic_terms,id',
            'period' => 'nullable|string',
        ]);

        if (!isset($validated['term_id']) || empty($validated['term_id'])) {
            $currentTerm = AcademicTerm::where('is_current', true)->first();
            if ($currentTerm) {
                $validated['term_id'] = $currentTerm->id;
            }
        }

        $circle = Circle::create($validated);

        return response()->json($circle->load(['teacher', 'term']), 201);
    }

    /**
     * Display the specified circle with enrollments.
     */
    public function show(string $id)
    {
        $user = auth()->user();
        $query = Circle::with([
                'teacher',
                'term',
                'enrollments' => function($q) {
                    $q->where('status', 'active')
                      ->with(['student' => function($sq) {
                          $sq->with(['guardian'])
                             ->select('id', 'name', 'phone', 'academic_stage', 'grade_level',
                                      'memorization_amount', 'status', 'school_id', 'guardian_id');
                      }]);
                }
            ])
            ->withCount(['enrollments' => function($q) {
                $q->where('status', 'active');
            }]);

        if ($user && $user->role === 'owner') {
            $query->withoutGlobalScope('school');
        }

        $circle = $query->find($id);

        if (!$circle) {
            return response()->json(['message' => 'عذراً، الحلقة غير موجودة'], 404);
        }
            
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
            'term_id' => 'nullable|exists:academic_terms,id',
            'period' => 'nullable|string',
        ]);

        $circle->update($validated);

        return response()->json($circle->load(['teacher', 'term']));
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

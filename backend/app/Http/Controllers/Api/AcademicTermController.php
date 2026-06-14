<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicTerm;
use Illuminate\Http\Request;

class AcademicTermController extends Controller
{
    /**
     * Display a listing of the academic terms.
     */
    public function index()
    {
        return response()->json(AcademicTerm::latest()->get());
    }

    /**
     * Store a newly created academic term in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean',
        ]);

        if ($validated['is_current'] ?? false) {
            AcademicTerm::where('is_current', true)->update(['is_current' => false]);
        }

        $term = AcademicTerm::create($validated);

        return response()->json($term, 201);
    }

    /**
     * Update the specified academic term in storage.
     */
    public function update(Request $request, string $id)
    {
        $term = AcademicTerm::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'is_current' => 'boolean',
        ]);

        if ($validated['is_current'] ?? false) {
            AcademicTerm::where('id', '!=', $id)->update(['is_current' => false]);
        }

        $term->update($validated);

        return response()->json($term);
    }

    /**
     * Remove the specified academic term from storage.
     */
    public function destroy(string $id)
    {
        $term = AcademicTerm::findOrFail($id);
        
        if ($term->is_current) {
            return response()->json(['message' => 'لا يمكن حذف الفصل الدراسي الحالي.'], 422);
        }

        $term->delete();

        return response()->json(['message' => 'تم حذف الفصل الدراسي بنجاح.']);
    }
}

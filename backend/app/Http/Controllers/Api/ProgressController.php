<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ProgressTracking;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function index($studentId)
    {
        $student = User::where('role', 'student')->findOrFail($studentId);
        
        $records = ProgressTracking::where('student_id', $studentId)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'surah_name' => $record->surah,
                    'start_verse' => $record->from_verse,
                    'end_verse' => $record->to_verse,
                    'date' => $record->date,
                    'quality_rating' => $record->grade,
                    'notes' => $record->note,
                ];
            });
            
        return response()->json($records);
    }

    public function store(Request $request, $studentId)
    {
        $student = User::where('role', 'student')->findOrFail($studentId);
        
        $validated = $request->validate([
            'surah_name' => 'required|string',
            'start_verse' => 'required|integer',
            'end_verse' => 'required|integer',
            'quality_rating' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $progress = ProgressTracking::create([
            'student_id' => $studentId,
            'circle_id' => $student->enrollments()->where('status', 'active')->first()?->circle_id, // Get active circle
            'date' => now()->toDateString(),
            'surah' => $validated['surah_name'],
            'from_verse' => $validated['start_verse'],
            'to_verse' => $validated['end_verse'],
            'pages_count' => 1,
            'grade' => $validated['quality_rating'],
            'note' => $validated['notes'],
        ]);

        return response()->json([
            'id' => $progress->id,
            'surah_name' => $progress->surah,
            'start_verse' => $progress->from_verse,
            'end_verse' => $progress->to_verse,
            'date' => $progress->date,
            'quality_rating' => $progress->grade,
            'notes' => $progress->note,
        ], 201);
    }
}

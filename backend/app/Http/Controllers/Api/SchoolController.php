<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    /**
     * Get current user's school info
     */
    public function show(Request $request)
    {
        $user = $request->user();
        if (!$user->school_id) {
            return response()->json(['message' => 'User not assigned to a school'], 404);
        }

        $school = School::find($user->school_id);
        return response()->json($school);
    }

    /**
     * Update school info (Supervisor only)
     */
    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user->school_id) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $school = School::findOrFail($user->school_id);
        
        $request->validate([
            'name' => 'required|string|max:200',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $school->update($request->only(['name', 'phone', 'email', 'address', 'settings']));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المجمع بنجاح',
            'school' => $school
        ]);
    }
}

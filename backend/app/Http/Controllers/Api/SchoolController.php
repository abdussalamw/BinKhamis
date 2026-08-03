<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    /**
     * Get current user's school info with fallbacks
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $school = null;
        if ($user->school_id) {
            $school = School::find($user->school_id);
        }
        
        if (!$school) {
            $school = School::first();
            if (!$school) {
                $school = School::create([
                    'name' => 'مجمع بن خميس المطور',
                    'phone' => '0500000000',
                    'email' => 'info@binkhamis.com',
                    'address' => 'الرياض - حي الملز',
                    'settings' => [
                        'mosques' => [
                            ['id' => '1', 'name' => 'جامع بن خميس الكبير', 'address' => 'المقر الرئيسي']
                        ],
                        'periods' => ['فجر', 'عصر', 'مغرب', 'عشاء'],
                        'logo' => null
                    ]
                ]);
            }
            $user->update(['school_id' => $school->id]);
        }

        // Load supervisor relation or info
        $supervisor = User::withoutGlobalScope('school')
            ->where('school_id', $school->id)
            ->whereIn('role', ['supervisor', 'manager', 'admin'])
            ->first();

        $schoolData = $school->toArray();
        $schoolData['supervisor'] = $supervisor ? [
            'id' => $supervisor->id,
            'name' => $supervisor->name,
            'phone' => $supervisor->phone,
            'email' => $supervisor->email
        ] : null;

        return response()->json($schoolData);
    }

    /**
     * Update school info
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $school = School::find($user->school_id) ?? School::first();

        if (!$school) {
            return response()->json(['message' => 'المجمع غير موجود'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'logo' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $settings = $validated['settings'] ?? ($school->settings ?? []);
        if (isset($validated['logo'])) {
            $settings['logo'] = $validated['logo'];
        }

        $school->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? $school->phone,
            'email' => $validated['email'] ?? $school->email,
            'address' => $validated['address'] ?? $school->address,
            'settings' => $settings,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المجمع بنجاح',
            'school' => $school
        ]);
    }
}

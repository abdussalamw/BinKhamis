<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    protected $whatsapp;

    public function __construct(WhatsAppService $whatsapp)
    {
        $this->whatsapp = $whatsapp;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'circle_id' => 'required|uuid|exists:circles,id',
            'date' => 'required|date',
            'records' => 'required|array',
            'records.*.student_id' => 'required|uuid|exists:users,id',
            'records.*.status' => 'required|in:present,absent,late,excused',
            'send_notifications' => 'boolean'
        ]);

        $results = [];

        try {
            return DB::transaction(function () use ($validated) {
                foreach ($validated['records'] as $record) {
                    // Find the enrollment for this student in this circle
                    $enrollment = Enrollment::where('student_id', $record['student_id'])
                        ->where('circle_id', $validated['circle_id'])
                        ->first();

                    if (!$enrollment) {
                        continue; // Skip if student not enrolled in this circle
                    }

                    $attendance = Attendance::updateOrCreate(
                        [
                            'enrollment_id' => $enrollment->id,
                            'date' => $validated['date'],
                        ],
                        [
                            'status' => $record['status'],
                            'recorded_by' => auth()->id() ?? User::where('role', 'admin')->first()->id,
                        ]
                    );

                    // Send notification if requested and status is not 'present'
                    if ($validated['send_notifications'] && in_array($record['status'], ['absent', 'late'])) {
                        $student = User::with('profile')->find($record['student_id']);
                        if ($student && $student->profile && $student->profile->phone) {
                            $this->whatsapp->sendAttendanceNotification(
                                $student->name,
                                $student->phone, // Use student's phone or parent phone if available
                                $record['status'],
                                $validated['date']
                            );
                        }
                    }

                    $results[] = $attendance;
                }

                return response()->json([
                    'message' => 'تم حفظ التحضير بنجاح',
                    'data' => $results
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'فشل حفظ التحضير', 'error' => $e->getMessage()], 500);
        }
    }

    public function getByCircle(Request $request, $circleId)
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        
        $attendance = Attendance::whereHas('enrollment', function($query) use ($circleId) {
            $query->where('circle_id', $circleId);
        })
        ->whereDate('date', $date)
        ->with('enrollment')
        ->get();
        
        // Map to a more friendly format for frontend
        $mapped = $attendance->map(function($item) {
            return [
                'student_id' => $item->enrollment->student_id,
                'status' => $item->status,
                'date' => $item->date->toDateString()
            ];
        });
            
        return response()->json($mapped);
    }
}

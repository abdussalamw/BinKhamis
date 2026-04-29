<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Circle;
use App\Models\Attendance;
use App\Models\ProgressTracking;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatsController extends Controller
{
    public function overview()
    {
        $totalStudents = User::where('role', 'student')->count();
        $activeCircles = Circle::where('is_active', true)->count();
        
        // Attendance percentage for today
        $today = Carbon::today();
        $presentToday = Attendance::whereDate('date', $today)->where('status', 'present')->count();
        $totalAttendanceRecordsToday = Attendance::whereDate('date', $today)->count();
        $attendanceRate = $totalAttendanceRecordsToday > 0 
            ? round(($presentToday / $totalAttendanceRecordsToday) * 100, 1) 
            : 0;

        $totalProgress = ProgressTracking::count();

        return response()->json([
            'overview' => [
                'total_students' => $totalStudents,
                'active_circles' => $activeCircles,
                'attendance_rate' => $attendanceRate,
                'total_progress' => $totalProgress,
            ]
        ]);
    }

    public function attendanceChart()
    {
        $data = [];
        $days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $present = Attendance::whereDate('date', $date)->where('status', 'present')->count();
            $total = Attendance::whereDate('date', $date)->count();
            
            $rate = $total > 0 ? round(($present / $total) * 100) : 0;
            
            $data[] = [
                'name' => $days[$date->dayOfWeek],
                'attendance' => $rate,
                'progress' => rand(60, 95), 
            ];
        }

        return response()->json($data);
    }

    public function circleDistribution()
    {
        // 1. Distribution by Circles
        $circles = Circle::withCount('enrollments')->get();
        
        $circleData = $circles->map(function($circle) {
            return [
                'name' => $circle->name,
                'value' => $circle->enrollments_count
            ];
        });

        // 2. Distribution by Academic Stage (from the newly added Excel fields)
        $stageDistribution = Profile::where('type', 'student')
            ->whereNotNull('academic_stage')
            ->select('academic_stage as name', DB::raw('count(*) as value'))
            ->groupBy('academic_stage')
            ->get();

        return response()->json([
            'circles' => $circleData,
            'stages' => $stageDistribution
        ]);
    }
}

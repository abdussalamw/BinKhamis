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
        $attendanceStats = Attendance::whereDate('date', $today)
            ->select(DB::raw('count(*) as total'), DB::raw("count(case when status='present' then 1 else null end) as present"))
            ->first();
            
        $attendanceRate = ($attendanceStats->total > 0) 
            ? round(($attendanceStats->present / $attendanceStats->total) * 100, 1) 
            : 0;

        $totalProgress = ProgressTracking::sum('pages_count') ?? 0;

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
        $days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        $startDate = Carbon::today()->subDays(6);
        $endDate = Carbon::today();
        
        // D5: Single query for all attendance stats grouped by date
        $attendanceByDate = Attendance::whereBetween('date', [$startDate, $endDate])
            ->selectRaw("date::date, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'present') as present")
            ->groupByRaw('date::date')
            ->get()
            ->keyBy(function ($item) {
                return $item->date instanceof \Carbon\Carbon 
                    ? $item->date->toDateString() 
                    : date('Y-m-d', strtotime($item->date));
            });

        // Single query for all progress Sum grouped by date
        $progressByDate = ProgressTracking::whereBetween('date', [$startDate, $endDate])
            ->selectRaw("date::date, SUM(pages_count) as pages")
            ->groupByRaw('date::date')
            ->get()
            ->keyBy(function ($item) {
                return $item->date instanceof \Carbon\Carbon 
                    ? $item->date->toDateString() 
                    : date('Y-m-d', strtotime($item->date));
            });

        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->toDateString();
            
            $attendanceStats = $attendanceByDate->get($dateStr);
            $total = $attendanceStats ? (int) $attendanceStats->total : 0;
            $present = $attendanceStats ? (int) $attendanceStats->present : 0;
            $rate = $total > 0 ? round(($present / $total) * 100) : 0;
            
            $progress = $progressByDate->get($dateStr);
            $pages = $progress ? (int) $progress->pages : 0;
            
            $data[] = [
                'name' => $days[$date->dayOfWeek],
                'attendance' => $rate,
                'progress' => $pages,
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

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Circle;
use App\Models\Attendance;
use App\Models\ProgressTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function dashboardOverview(Request $request)
    {
        Carbon::setLocale('ar');
        
        // 1. Core KPIs
        $totalStudents = User::where('role', 'student')->count();
        $activeCircles = Circle::count();
        $totalAttendance = Attendance::count();
        
        $attendanceRate = $totalAttendance > 0 
            ? round((Attendance::where('status', 'present')->count() / $totalAttendance) * 100, 1)
            : 0;

        $totalProgress = ProgressTracking::count();
        $avgProgress = $totalStudents > 0 ? round($totalProgress / $totalStudents, 1) : 0;

        $monthlyProgress = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            
            $monthlyProgress[] = [
                'name' => $date->translatedFormat('F'),
                'achievements' => ProgressTracking::whereRaw("EXTRACT(MONTH FROM date::date) = ?", [$month])
                    ->whereRaw("EXTRACT(YEAR FROM date::date) = ?", [$year])
                    ->count(),
                'attendance' => $this->getAttendanceRateForMonth($date),
                'students' => User::where('role', 'student')
                    ->whereRaw("created_at::date <= ?", [$date->endOfMonth()->toDateString()])
                    ->count()
            ];
        }

        // 3. Distribution
        $programDistribution = DB::table('profiles')
            ->select('memorization_method as name', DB::raw('count(*) as value'))
            ->whereNotNull('memorization_method')
            ->groupBy('memorization_method')
            ->get();

        // 4. Rankings
        $circleRankings = Circle::withCount('enrollments')
            ->with('teacher')
            ->get()
            ->map(function($circle) {
                $ids = $circle->enrollments->pluck('id');
                $att = $ids->count() > 0 ? Attendance::whereIn('enrollment_id', $ids)->avg(DB::raw("CASE WHEN status='present' THEN 100 ELSE 0 END")) ?? 0 : 0;
                return [
                    'id' => $circle->id,
                    'name' => $circle->name,
                    'teacher' => $circle->teacher->name ?? 'غير معين',
                    'students' => $circle->enrollments_count,
                    'attendance' => round($att, 1)
                ];
            })->sortByDesc('attendance')->values()->take(10);

        // 5. Stage Breakdown
        $stageBreakdown = DB::table('profiles')
            ->select('current_level as name', DB::raw('count(*) as students'))
            ->whereNotNull('current_level')
            ->groupBy('current_level')
            ->get()
            ->map(function($stage) {
                $studentIds = DB::table('profiles')->where('current_level', $stage->name)->pluck('user_id');
                $enrollmentIds = DB::table('enrollments')->whereIn('student_id', $studentIds)->pluck('id');
                
                $att = $enrollmentIds->count() > 0 
                    ? Attendance::whereIn('enrollment_id', $enrollmentIds)->avg(DB::raw("CASE WHEN status='present' THEN 100 ELSE 0 END")) ?? 0 
                    : 0;

                return [
                    'name' => $stage->name,
                    'students' => $stage->students,
                    'attendance' => round($att, 1)
                ];
            });

        return response()->json([
            'kpis' => [
                'total_students' => $totalStudents,
                'active_circles' => $activeCircles,
                'attendance_rate' => $attendanceRate,
                'avg_progress' => $avgProgress
            ],
            'monthlyProgress' => $monthlyProgress,
            'programDistribution' => $programDistribution,
            'circleRankings' => $circleRankings,
            'stageBreakdown' => $stageBreakdown,
            'insights' => [
                "إجمالي الطلاب المسجلين حالياً هو $totalStudents طالباً.",
                "متوسط الإنجاز لكل طالب هو $avgProgress عملية تسميع.",
                "نسبة الانضباط العام في المجمع هي $attendanceRate%."
            ]
        ]);
    }

    public function studentReport($id)
    {
        Carbon::setLocale('ar');
        $student = User::with('profile')->findOrFail($id);
        
        $enrollmentIds = DB::table('enrollments')->where('student_id', $id)->pluck('id');

        $attendance = Attendance::whereIn('enrollment_id', $enrollmentIds)
            ->select('date', 'status')
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        $progressCount = ProgressTracking::where('student_id', $id)->count();

        return response()->json([
            'student' => $student,
            'attendance' => $attendance,
            'summary' => [
                'attendance_rate' => $attendance->count() > 0 ? round(($attendance->where('status', 'present')->count() / $attendance->count()) * 100, 1) : 0,
                'total_achievements' => $progressCount
            ]
        ]);
    }

    public function circleReport($id)
    {
        Carbon::setLocale('ar');
        $circle = Circle::with('teacher')->findOrFail($id);
        $enrollmentIds = DB::table('enrollments')->where('circle_id', $id)->pluck('id');

        $recentAttendance = Attendance::whereIn('enrollment_id', $enrollmentIds)
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'circle' => $circle,
            'stats' => [
                'total_students' => $enrollmentIds->count(),
                'attendance_rate' => Attendance::whereIn('enrollment_id', $enrollmentIds)->count() > 0 
                    ? round((Attendance::whereIn('enrollment_id', $enrollmentIds)->where('status', 'present')->count() / Attendance::whereIn('enrollment_id', $enrollmentIds)->count()) * 100, 1)
                    : 0,
            ],
            'recent_attendance' => $recentAttendance
        ]);
    }

    private function getAttendanceRateForMonth($date)
    {
        $month = $date->month;
        $year = $date->year;
        
        $total = Attendance::whereRaw("EXTRACT(MONTH FROM date::date) = ?", [$month])
            ->whereRaw("EXTRACT(YEAR FROM date::date) = ?", [$year])
            ->count();
            
        if ($total == 0) return 0;
        
        $present = Attendance::whereRaw("EXTRACT(MONTH FROM date::date) = ?", [$month])
            ->whereRaw("EXTRACT(YEAR FROM date::date) = ?", [$year])
            ->where('status', 'present')
            ->count();
            
        return round(($present / $total) * 100, 1);
    }
}

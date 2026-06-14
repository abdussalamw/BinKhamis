<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Circle;
use App\Models\Attendance;
use App\Models\ProgressTracking;
use App\Models\AcademicTerm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function dashboardOverview(Request $request)
    {
        Carbon::setLocale('ar');
        $currentTerm = AcademicTerm::where('is_current', true)->first();
        $termId = $currentTerm ? $currentTerm->id : null;
        
        // 1. Core KPIs
        $totalStudentsQuery = User::where('role', 'student');
        if ($termId) {
            $totalStudentsQuery->whereHas('enrollments', function($q) use ($termId) {
                $q->where('term_id', $termId)->where('status', 'active');
            });
        }
        $totalStudents = $totalStudentsQuery->count();

        $activeCirclesQuery = Circle::query();
        if ($termId) {
            $activeCirclesQuery->where('term_id', $termId);
        }
        $activeCircles = $activeCirclesQuery->count();
        
        $attendanceQuery = Attendance::query();
        if ($termId) {
            $attendanceQuery->where('term_id', $termId);
        }
        $totalAttendance = (clone $attendanceQuery)->count();
        
        $presentCount = (clone $attendanceQuery)->where('status', 'present')->count();
        $lateCount = (clone $attendanceQuery)->where('status', 'late')->count();
        $excusedCount = (clone $attendanceQuery)->where('status', 'excused')->count();
        $absentCount = (clone $attendanceQuery)->where('status', 'absent')->count();

        $attendanceRate = $totalAttendance > 0 
            ? round(($presentCount / $totalAttendance) * 100, 1)
            : 0;
        
        $lateRate = $totalAttendance > 0 
            ? round(($lateCount / $totalAttendance) * 100, 1)
            : 0;

        $totalProgress = ProgressTracking::count();
        $avgProgress = $totalStudents > 0 ? round($totalProgress / $totalStudents, 1) : 0;

        $monthlyProgress = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            
            $baseQuery = Attendance::whereRaw("EXTRACT(MONTH FROM date::date) = ?", [$month])
                ->whereRaw("EXTRACT(YEAR FROM date::date) = ?", [$year]);

            $monthlyProgress[] = [
                'name' => $date->translatedFormat('F'),
                'achievements' => ProgressTracking::whereRaw("EXTRACT(MONTH FROM date::date) = ?", [$month])
                    ->whereRaw("EXTRACT(YEAR FROM date::date) = ?", [$year])
                    ->count(),
                'present' => (clone $baseQuery)->where('status', 'present')->count(),
                'late' => (clone $baseQuery)->where('status', 'late')->count(),
                'absent' => (clone $baseQuery)->where('status', 'absent')->count(),
                'excused' => (clone $baseQuery)->where('status', 'excused')->count(),
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
                $totalAtt = $ids->count() > 0 ? Attendance::whereIn('enrollment_id', $ids)->count() : 0;
                $presentAtt = $ids->count() > 0 ? Attendance::whereIn('enrollment_id', $ids)->where('status', 'present')->count() : 0;
                $att = $totalAtt > 0 ? ($presentAtt / $totalAtt) * 100 : 0;
                
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
                
                $totalAtt = $enrollmentIds->count() > 0 ? Attendance::whereIn('enrollment_id', $enrollmentIds)->count() : 0;
                $presentAtt = $enrollmentIds->count() > 0 ? Attendance::whereIn('enrollment_id', $enrollmentIds)->where('status', 'present')->count() : 0;
                $att = $totalAtt > 0 ? ($presentAtt / $totalAtt) * 100 : 0;

                return [
                    'name' => $stage->name,
                    'students' => $stage->students,
                    'attendance' => round($att, 1)
                ];
            });

        // 6. Top Students
        $topStudents = User::where('role', 'student')
            ->with('profile')
            ->get()
            ->map(function($student) {
                $enrollmentIds = DB::table('enrollments')->where('student_id', $student->id)->pluck('id');
                $totalAtt = $enrollmentIds->count() > 0 ? Attendance::whereIn('enrollment_id', $enrollmentIds)->count() : 0;
                $presentAtt = $enrollmentIds->count() > 0 ? Attendance::whereIn('enrollment_id', $enrollmentIds)->where('status', 'present')->count() : 0;
                $lateAtt = $enrollmentIds->count() > 0 ? Attendance::whereIn('enrollment_id', $enrollmentIds)->where('status', 'late')->count() : 0;
                
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'level' => $student->profile->current_level ?? 'غير محدد',
                    'presence' => $presentAtt,
                    'late' => $lateAtt,
                    'rate' => $totalAtt > 0 ? round(($presentAtt / $totalAtt) * 100, 1) : 0
                ];
            })->sortByDesc('rate')->values()->take(5);

        $bestCircle = $circleRankings->first();
        $insights = [
            "الفصل الدراسي الحالي: " . ($currentTerm->name ?? 'غير محدد'),
            "إجمالي سجلات الحضور لهذا الفصل: $totalAttendance سجلاً.",
            "نسبة الانضباط العام (الحضور بدون تأخير): $attendanceRate%.",
            "نسبة التأخر الإجمالية: $lateRate%."
        ];

        if ($bestCircle) {
            $insights[] = "الحلقة الأكثر انضباطاً هي حلقة ({$bestCircle['name']}) بنسبة {$bestCircle['attendance']}% (معلمها: {$bestCircle['teacher']}).";
        }

        if ($lateRate > 20) {
            $insights[] = "تنبيه: هناك ارتفاع ملحوظ في نسبة التأخر ($lateRate%)، يوصى بالتواصل مع أولياء الأمور.";
        }

        return response()->json([
            'term' => $currentTerm,
            'kpis' => [
                'total_students' => $totalStudents,
                'active_circles' => $activeCircles,
                'attendance_rate' => $attendanceRate,
                'late_rate' => $lateRate,
                'avg_progress' => $avgProgress,
                'counts' => [
                    'present' => $presentCount,
                    'late' => $lateCount,
                    'absent' => $absentCount,
                    'excused' => $excusedCount
                ]
            ],
            'monthlyProgress' => $monthlyProgress,
            'programDistribution' => $programDistribution,
            'circleRankings' => $circleRankings,
            'stageBreakdown' => $stageBreakdown,
            'topStudents' => $topStudents,
            'insights' => $insights
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
            ->limit(20)
            ->get();

        $allAttendance = Attendance::whereIn('enrollment_id', $enrollmentIds)->get();
        $total = $allAttendance->count();

        $progressCount = ProgressTracking::where('student_id', $id)->count();

        return response()->json([
            'student' => $student,
            'attendance' => $attendance,
            'summary' => [
                'attendance_rate' => $total > 0 ? round(($allAttendance->where('status', 'present')->count() / $total) * 100, 1) : 0,
                'late_rate' => $total > 0 ? round(($allAttendance->where('status', 'late')->count() / $total) * 100, 1) : 0,
                'total_achievements' => $progressCount,
                'counts' => [
                    'present' => $allAttendance->where('status', 'present')->count(),
                    'late' => $allAttendance->where('status', 'late')->count(),
                    'absent' => $allAttendance->where('status', 'absent')->count(),
                    'excused' => $allAttendance->where('status', 'excused')->count(),
                ]
            ]
        ]);
    }

    public function circleReport($id)
    {
        Carbon::setLocale('ar');
        $circle = Circle::with('teacher')->findOrFail($id);
        $enrollmentIds = DB::table('enrollments')->where('circle_id', $id)->pluck('id');

        $allAttendance = Attendance::whereIn('enrollment_id', $enrollmentIds)->get();
        $total = $allAttendance->count();

        $recentAttendance = Attendance::whereIn('enrollment_id', $enrollmentIds)
            ->orderBy('date', 'desc')
            ->limit(15)
            ->get();

        return response()->json([
            'circle' => $circle,
            'stats' => [
                'total_students' => $enrollmentIds->count(),
                'attendance_rate' => $total > 0 ? round(($allAttendance->where('status', 'present')->count() / $total) * 100, 1) : 0,
                'late_rate' => $total > 0 ? round(($allAttendance->where('status', 'late')->count() / $total) * 100, 1) : 0,
                'counts' => [
                    'present' => $allAttendance->where('status', 'present')->count(),
                    'late' => $allAttendance->where('status', 'late')->count(),
                    'absent' => $allAttendance->where('status', 'absent')->count(),
                    'excused' => $allAttendance->where('status', 'excused')->count(),
                ]
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

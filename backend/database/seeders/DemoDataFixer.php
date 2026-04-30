<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use App\Models\Circle;
use App\Models\Enrollment;
use App\Models\Attendance;
use App\Models\ProgressTracking;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DemoDataFixer extends Seeder
{
    public function run()
    {
        // 1. Get or Create Demo Users
        $admin = User::where('phone', '966500000000')->first();
        $supervisor = User::where('phone', '966533333333')->first();
        $teacher = User::where('phone', '966522222222')->first();
        $student = User::where('phone', '966511111111')->first();

        // 2. Fix Teacher-Circle Link
        if ($teacher) {
            Circle::query()->update(['teacher_id' => $teacher->id]);
        }

        // 3. Ensure Student has a Profile
        if ($student) {
            Profile::updateOrCreate(
                ['user_id' => $student->id],
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'student',
                    'academic_stage' => 'المتوسطة',
                    'grade_level' => 'الثاني متوسط',
                    'program' => 'حفظ المصحف كاملاً',
                    'current_level' => 'الجزء الخامس',
                    'gender' => 'M'
                ]
            );

            // 4. Enroll Student in a Circle
            $circle = Circle::first();
            $enrollment = null;
            if ($circle) {
                $enrollment = Enrollment::updateOrCreate(
                    ['student_id' => $student->id, 'circle_id' => $circle->id],
                    ['id' => (string) Str::uuid(), 'status' => 'active', 'enrolled_at' => now()]
                );
            }

            // 5. Add some Dummy Attendance for the student
            if ($enrollment) {
                for ($i = 0; $i < 10; $i++) {
                    Attendance::updateOrCreate(
                        ['enrollment_id' => $enrollment->id, 'date' => Carbon::today()->subDays($i)],
                        [
                            'id' => (string) Str::uuid(),
                            'status' => rand(0, 5) > 0 ? 'present' : 'absent', 
                            'recorded_by' => $teacher?->id ?? $admin?->id
                        ]
                    );
                }
            }

            // 6. Add some Dummy Progress
            for ($i = 0; $i < 5; $i++) {
                ProgressTracking::updateOrCreate(
                    ['student_id' => $student->id, 'surah_name' => 'البقرة', 'surah_number' => 2, 'start_verse' => 1, 'end_verse' => 10 + $i],
                    [
                        'id' => (string) Str::uuid(),
                        'pages_count' => rand(1, 5),
                        'completion_date' => Carbon::today()->subDays($i*2),
                        'quality_rating' => 'excellent',
                        'notes' => 'ممتاز ومجتهد',
                        'teacher_id' => $teacher?->id ?? $admin?->id
                    ]
                );
            }
        }

        // 7. Create Profiles for other demo roles if missing
        foreach ([$admin, $supervisor, $teacher] as $u) {
            if ($u) {
                Profile::updateOrCreate(
                    ['user_id' => $u->id],
                    ['id' => (string) Str::uuid(), 'type' => $u->role === 'teacher' ? 'teacher' : 'student']
                );
            }
        }
    }
}

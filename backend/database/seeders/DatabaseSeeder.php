<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Circle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $jsonPath = base_path('../scratch/extracted_data.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("JSON file not found at $jsonPath");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);
        $studentsData = $data['students_from_csv'] ?? [];

        if (empty($studentsData)) {
            $this->command->error("No student data found in JSON");
            return;
        }

        $teachers = [];
        $circles = [];

        foreach ($studentsData as $item) {
            $studentName = $item['name'];
            $teacherName = $item['teacher'];
            $circleName = $item['circle'] ?: "حلقة " . $teacherName;

            if ($studentName === 'nan' || str_contains($studentName, 'إجمالي')) continue;

            // Create Teacher if not exists
            if (!isset($teachers[$teacherName]) && $teacherName !== 'nan') {
                $teacherId = (string) Str::uuid();
                $teacherUser = User::create([
                    'id' => $teacherId,
                    'name' => $teacherName,
                    'phone' => 'T-' . Str::random(8), // Placeholder phone
                    'password' => Hash::make('password'),
                    'role' => 'teacher',
                    'is_active' => true,
                ]);

                $teacherUser->profile()->create([
                    'id' => (string) Str::uuid(),
                    'type' => 'teacher',
                    'gender' => 'M',
                ]);

                $teachers[$teacherName] = $teacherUser;

                // Create Circle for this teacher
                $circleId = (string) Str::uuid();
                \Illuminate\Support\Facades\DB::table('circles')->insert([
                    'id' => $circleId,
                    'name' => $circleName,
                    'description' => 'حلقة تعليم القرآن الكريم',
                    'location' => 'المسجد',
                    'schedule' => json_encode(['days' => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], 'time' => '16:00']),
                    'capacity' => 20,
                    'teacher_id' => $teacherId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $circles[$teacherName] = $circleId;
            }

            // Create Student
            $studentId = (string) Str::uuid();
            $studentUser = User::create([
                'id' => $studentId,
                'name' => $studentName,
                'phone' => 'S-' . Str::random(8), // Placeholder phone
                'password' => Hash::make('password'),
                'role' => 'student',
                'is_active' => true,
            ]);

            $studentUser->profile()->create([
                'id' => (string) Str::uuid(),
                'type' => 'student',
                'gender' => 'M',
            ]);

            // Enroll in circle
            if (isset($circles[$teacherName])) {
                \Illuminate\Support\Facades\DB::table('enrollments')->insert([
                    'id' => (string) Str::uuid(),
                    'student_id' => $studentId,
                    'circle_id' => $circles[$teacherName],
                    'enrolled_at' => now(),
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed Main School
        $school = \App\Models\School::create([
            'name' => 'مجمع بن خميس المطور',
            'is_active' => true
        ]);

        \App\Models\User::withoutGlobalScope('school')->whereNull('school_id')->where('role', '!=', 'owner')->update(['school_id' => $school->id]);
        \App\Models\Circle::withoutGlobalScope('school')->whereNull('school_id')->update(['school_id' => $school->id]);

        $this->command->info("Seeded " . count($studentsData) . " entries from Excel and created school {$school->name}.");
    }
}

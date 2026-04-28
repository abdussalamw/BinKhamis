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
                $teacherUser = User::create([
                    'name' => $teacherName,
                    'phone' => 'T-' . Str::random(8), // Placeholder phone
                    'password' => Hash::make('password'),
                    'role' => 'teacher',
                    'is_active' => true,
                ]);

                $teacherUser->profile()->create([
                    'type' => 'teacher',
                    'gender' => 'M',
                ]);

                $teachers[$teacherName] = $teacherUser;

                // Create Circle for this teacher
                $circle = Circle::create([
                    'name' => $circleName,
                    'description' => 'حلقة تعليم القرآن الكريم',
                    'location' => 'المسجد',
                    'schedule' => ['days' => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], 'time' => '16:00'],
                    'capacity' => 20,
                    'teacher_id' => $teacherUser->id,
                    'is_active' => true,
                ]);
                $circles[$teacherName] = $circle;
            }

            // Create Student
            $studentUser = User::create([
                'name' => $studentName,
                'phone' => 'S-' . Str::random(8), // Placeholder phone
                'password' => Hash::make('password'),
                'role' => 'student',
                'is_active' => true,
            ]);

            $studentUser->profile()->create([
                'type' => 'student',
                'gender' => 'M',
            ]);

            // Enroll in circle
            if (isset($circles[$teacherName])) {
                $studentUser->enrollments()->create([
                    'circle_id' => $circles[$teacherName]->id,
                    'enrolled_at' => now(),
                    'status' => 'active',
                ]);
            }
        }

        $this->command->info("Seeded " . count($studentsData) . " entries from Excel.");
    }
}

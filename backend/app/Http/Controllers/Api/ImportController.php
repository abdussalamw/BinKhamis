<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Models\Circle;
use App\Models\Enrollment;
use App\Models\AcademicTerm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ImportController extends Controller
{
    public function importFromJSON(Request $request)
    {
        // Force clean the input content to be valid UTF-8
        $content = $request->getContent();
        // Convert to UTF-8 and ignore/replace invalid characters
        $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
        $payload = json_decode($content, true);
        
        $data = $payload['data'] ?? null;
        $termName = $payload['term_name'] ?? 'الفصل الثاني 1447';
        
        if (!$data || !is_array($data)) {
            return response()->json(['status' => 'error', 'message' => 'بيانات فارغة أو معطوبة'], 400);
        }

        $term = AcademicTerm::firstOrCreate(['name' => $termName], [
            'start_date' => now()->startOfQuarter(),
            'end_date' => now()->addMonths(4),
            'is_current' => true
        ]);

        $importedCount = 0;
        $errors = [];
        $teacher = User::where('role', 'teacher')->first() ?? User::where('role', 'super_admin')->first();

        foreach ($data as $index => $row) {
            try {
                DB::transaction(function () use ($row, $term, $teacher, &$importedCount) {
                    $fullName = $row['اسم الطالب'] ?? null;
                    if (!$fullName) return;

                    // Clean all strings in the row
                    foreach ($row as $key => $val) {
                        if (is_string($val)) {
                            $row[$key] = mb_convert_encoding($val, 'UTF-8', 'UTF-8');
                        }
                    }

                    $phone = (string)($row['جوال الطالب'] ?? $row['جوال ولي الأمر1'] ?? '05' . rand(10000000, 99999999));
                    
                    $user = User::updateOrCreate(
                        ['name' => $fullName],
                        [
                            'phone' => substr($phone, 0, 20),
                            'password' => Hash::make('password123'),
                            'role' => 'student',
                            'is_active' => true
                        ]
                    );

                    Profile::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'type' => 'student',
                            'short_name' => $row['الاسم المختصر'] ?? null,
                            'national_id' => $row['رقم الإثبات'] ?? null,
                            'nationality' => $row['الجنسية'] ?? null,
                            'neighborhood' => $row['الحي'] ?? null,
                            'grade_level' => $row['الصف'] ?? null,
                            'academic_stage' => $row['المرحلة'] ?? null,
                            'program' => $row['البرنامج'] ?? null,
                            'parent_phone_1' => $row['جوال ولي الأمر1'] ?? null,
                            'parent_relation_1' => $row['القرابة1'] ?? null,
                            'parent_phone_2' => $row['جوال ولي الأمر 2'] ?? null,
                            'parent_relation_2' => $row['القرابة2'] ?? null,
                            'student_phone' => $row['جوال الطالب'] ?? null,
                            'enrollment_semester' => $row['فصل القبول'] ?? null,
                            'studied_semesters' => intval($row['فصول الدراسة'] ?? 0),
                            'completion_year' => $row['سنة الختمة'] ?? null,
                            'end_semester' => $row['فصل الانتهاء'] ?? null,
                            'end_reason' => $row['سبب الانتهاء'] ?? null,
                        ]
                    );

                    $circleName = $row['الحلقة'] ?? 'غير مصنف';
                    $circle = Circle::firstOrCreate(['name' => $circleName], [
                        'location' => 'المسجد',
                        'schedule' => ['days' => ['sun', 'tue'], 'time_start' => '16:00', 'time_end' => '18:00'],
                        'capacity' => 20,
                        'teacher_id' => $teacher->id ?? $user->id
                    ]);

                    Enrollment::updateOrCreate(
                        ['student_id' => $user->id, 'circle_id' => $circle->id, 'term_id' => $term->id],
                        ['status' => 'active', 'enrolled_at' => now()]
                    );

                    $importedCount++;
                });
            } catch (\Exception $e) {
                $errors[] = "Row $index: " . $e->getMessage();
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "تمت العملية بنجاح. استيراد $importedCount طالباً.",
            'errors' => array_slice($errors, 0, 5)
        ]);
    }
}

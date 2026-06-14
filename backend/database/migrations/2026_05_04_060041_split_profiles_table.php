<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create student_profiles table
        Schema::create('student_profiles', function (Blueprint $blueprint) {
            $blueprint->uuid('id')->primary();
            $blueprint->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $blueprint->string('short_name')->nullable();
            $blueprint->string('national_id')->nullable();
            $blueprint->string('nationality')->nullable();
            $blueprint->date('birth_date')->nullable();
            $blueprint->string('gender')->nullable();
            $blueprint->string('address')->nullable();
            $blueprint->string('neighborhood')->nullable();
            $blueprint->string('academic_stage')->nullable();
            $blueprint->string('grade_level')->nullable();
            $blueprint->string('current_level')->nullable();
            $blueprint->string('memorization_method')->nullable();
            $blueprint->string('program')->nullable();
            $blueprint->string('parent_phone_1')->nullable();
            $blueprint->string('parent_relation_1')->nullable();
            $blueprint->string('parent_phone_2')->nullable();
            $blueprint->string('parent_relation_2')->nullable();
            $blueprint->string('student_phone')->nullable();
            $blueprint->string('enrollment_semester')->nullable();
            $blueprint->integer('studied_semesters')->default(0);
            $blueprint->string('completion_year')->nullable();
            $blueprint->string('end_semester')->nullable();
            $blueprint->string('end_reason')->nullable();
            $blueprint->string('profile_picture')->nullable();
            $blueprint->json('metadata')->nullable();
            $blueprint->timestamps();
        });

        // 2. Create teacher_profiles table
        Schema::create('teacher_profiles', function (Blueprint $blueprint) {
            $blueprint->uuid('id')->primary();
            $blueprint->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $blueprint->string('short_name')->nullable();
            $blueprint->string('national_id')->nullable();
            $blueprint->string('nationality')->nullable();
            $blueprint->date('birth_date')->nullable();
            $blueprint->string('gender')->nullable();
            $blueprint->string('address')->nullable();
            $blueprint->string('neighborhood')->nullable();
            $blueprint->string('specialization')->nullable();
            $blueprint->date('hire_date')->nullable();
            $blueprint->string('bank_account_number')->nullable();
            $blueprint->text('bio')->nullable();
            $blueprint->string('profile_picture')->nullable();
            $blueprint->json('metadata')->nullable();
            $blueprint->timestamps();
        });

        // 3. Migrate Data
        $profiles = DB::table('profiles')->get();
        foreach ($profiles as $profile) {
            $user = DB::table('users')->where('id', $profile->user_id)->first();
            if (!$user) continue;

            if ($user->role === 'student') {
                DB::table('student_profiles')->insert([
                    'id' => Str::uuid(),
                    'user_id' => $profile->user_id,
                    'short_name' => $profile->short_name,
                    'national_id' => $profile->national_id,
                    'nationality' => $profile->nationality,
                    'birth_date' => $profile->birth_date,
                    'gender' => $profile->gender,
                    'address' => $profile->address,
                    'neighborhood' => $profile->neighborhood,
                    'academic_stage' => $profile->academic_stage,
                    'grade_level' => $profile->grade_level,
                    'current_level' => $profile->current_level,
                    'memorization_method' => $profile->memorization_method,
                    'program' => $profile->program,
                    'parent_phone_1' => $profile->parent_phone_1,
                    'parent_relation_1' => $profile->parent_relation_1,
                    'parent_phone_2' => $profile->parent_phone_2,
                    'parent_relation_2' => $profile->parent_relation_2,
                    'student_phone' => $profile->student_phone,
                    'enrollment_semester' => $profile->enrollment_semester,
                    'studied_semesters' => $profile->studied_semesters,
                    'completion_year' => $profile->completion_year,
                    'end_semester' => $profile->end_semester,
                    'end_reason' => $profile->end_reason,
                    'profile_picture' => $profile->profile_picture,
                    'metadata' => $profile->metadata,
                    'created_at' => $profile->created_at,
                    'updated_at' => $profile->updated_at,
                ]);
            } else if ($user->role === 'teacher') {
                DB::table('teacher_profiles')->insert([
                    'id' => Str::uuid(),
                    'user_id' => $profile->user_id,
                    'short_name' => $profile->short_name,
                    'national_id' => $profile->national_id,
                    'nationality' => $profile->nationality,
                    'birth_date' => $profile->birth_date,
                    'gender' => $profile->gender,
                    'address' => $profile->address,
                    'neighborhood' => $profile->neighborhood,
                    'specialization' => $profile->specialization,
                    'hire_date' => $profile->hire_date,
                    'bank_account_number' => $profile->bank_account_number,
                    'bio' => $profile->bio,
                    'profile_picture' => $profile->profile_picture,
                    'metadata' => $profile->metadata,
                    'created_at' => $profile->created_at,
                    'updated_at' => $profile->updated_at,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('teacher_profiles');
    }
};

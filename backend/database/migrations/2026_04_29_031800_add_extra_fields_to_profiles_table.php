<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Personal & Identity
            $table->string('short_name', 50)->nullable()->after('type');
            $table->string('national_id', 20)->unique()->nullable()->after('short_name');
            $table->string('nationality', 50)->nullable()->after('national_id');
            $table->string('neighborhood', 100)->nullable()->after('address');
            
            // Academic & Educational
            $table->string('grade_level', 50)->nullable()->after('current_level'); // الصف
            $table->string('academic_stage', 50)->nullable()->after('grade_level'); // المرحلة
            $table->string('program', 100)->nullable()->after('academic_stage'); // البرنامج
            
            // Family Contacts
            $table->string('parent_phone_1', 20)->nullable()->after('parent_id');
            $table->string('parent_relation_1', 30)->nullable()->after('parent_phone_1');
            $table->string('parent_phone_2', 20)->nullable()->after('parent_phone_1');
            $table->string('parent_relation_2', 30)->nullable()->after('parent_phone_2');
            $table->string('student_phone', 20)->nullable()->after('parent_relation_2');
            
            // Enrollment History
            $table->string('enrollment_semester', 50)->nullable()->after('student_phone');
            $table->integer('studied_semesters')->default(0)->after('enrollment_semester');
            $table->string('completion_year', 20)->nullable()->after('studied_semesters');
            $table->string('end_semester', 50)->nullable()->after('completion_year');
            $table->text('end_reason')->nullable()->after('end_semester');
            
            $table->string('profile_picture')->nullable()->after('metadata');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'short_name',
                'national_id',
                'nationality',
                'neighborhood',
                'grade_level',
                'academic_stage',
                'program',
                'parent_phone_1',
                'parent_relation_1',
                'parent_phone_2',
                'parent_relation_2',
                'student_phone',
                'enrollment_semester',
                'studied_semesters',
                'completion_year',
                'end_semester',
                'end_reason',
                'profile_picture'
            ]);
        });
    }
};

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
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('identity_type')->default('national_id')->after('national_id'); // national_id, iqama, passport, border_number
            $table->string('status')->default('active')->after('current_level'); // active (نشط), discontinued (منقطع)
        });

        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->string('identity_type')->default('national_id')->after('national_id'); // national_id, iqama, passport, border_number
            $table->string('status')->default('active')->after('specialization'); // active (نشط), discontinued (منقطع)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['identity_type', 'status']);
        });

        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->dropColumn(['identity_type', 'status']);
        });
    }
};

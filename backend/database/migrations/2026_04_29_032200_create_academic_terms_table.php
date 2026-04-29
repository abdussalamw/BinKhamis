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
        // 1. Create Academic Terms Table
        Schema::create('academic_terms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100); // e.g., الفصل الثاني 1447
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });

        // 2. Add term_id to Enrollments and Attendance
        Schema::table('enrollments', function (Blueprint $table) {
            $table->uuid('term_id')->nullable()->after('circle_id');
            $table->foreign('term_id')->references('id')->on('academic_terms');
        });

        Schema::table('attendance', function (Blueprint $table) {
            $table->uuid('term_id')->nullable()->after('enrollment_id');
            $table->foreign('term_id')->references('id')->on('academic_terms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropForeign(['term_id']);
            $table->dropColumn('term_id');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['term_id']);
            $table->dropColumn('term_id');
        });

        Schema::dropIfExists('academic_terms');
    }
};

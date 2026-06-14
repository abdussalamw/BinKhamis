<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'circles',
            'academic_terms',
            'enrollments',
            'attendance',
            'progress_tracking',
            'notifications',
            'activity_logs'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->uuid('school_id')->nullable()->index();
                $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'circles',
            'academic_terms',
            'enrollments',
            'attendance',
            'progress_tracking',
            'notifications',
            'activity_logs'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('school_id');
            });
        }
    }
};

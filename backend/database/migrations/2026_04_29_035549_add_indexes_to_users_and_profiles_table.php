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
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('name');
        });

        Schema::table('profiles', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('national_id');
            $table->index('academic_stage');
            $table->index('program');
        });
        
        Schema::table('circles', function (Blueprint $table) {
            $table->index('teacher_id');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['name']);
        });

        Schema::table('profiles', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['national_id']);
            $table->dropIndex(['academic_stage']);
            $table->dropIndex(['program']);
        });
        
        Schema::table('circles', function (Blueprint $table) {
            $table->dropIndex(['teacher_id']);
            $table->dropIndex(['name']);
        });
    }
};

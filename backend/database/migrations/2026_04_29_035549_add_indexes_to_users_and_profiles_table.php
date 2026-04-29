<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Users Table
        Schema::table('users', function (Blueprint $table) {
            // Drop if exists (manual check for Postgres)
            $this->dropIndexIfExists('users', 'users_role_index');
            $this->dropIndexIfExists('users', 'users_name_index');
            
            $table->index('role');
            $table->index('name');
        });

        // Profiles Table
        Schema::table('profiles', function (Blueprint $table) {
            $this->dropIndexIfExists('profiles', 'profiles_user_id_index');
            $this->dropIndexIfExists('profiles', 'profiles_national_id_index');
            $this->dropIndexIfExists('profiles', 'profiles_academic_stage_index');
            $this->dropIndexIfExists('profiles', 'profiles_program_index');
            
            $table->index('user_id');
            $table->index('national_id');
            $table->index('academic_stage');
            $table->index('program');
        });
        
        // Circles Table
        Schema::table('circles', function (Blueprint $table) {
            $this->dropIndexIfExists('circles', 'circles_teacher_id_index');
            $this->dropIndexIfExists('circles', 'circles_name_index');
            
            $table->index('teacher_id');
            $table->index('name');
        });
    }

    private function dropIndexIfExists($table, $index)
    {
        if (config('database.default') === 'pgsql') {
            DB::statement("DROP INDEX IF EXISTS {$index}");
        } else {
            try {
                Schema::table($table, function (Blueprint $table) use ($index) {
                    $table->dropIndex($index);
                });
            } catch (\Exception $e) {
                // Ignore if not exists
            }
        }
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

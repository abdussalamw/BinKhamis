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
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->enum('type', ['student', 'teacher', 'parent']);
            
            // Common fields
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['M', 'F'])->nullable();
            $table->text('address')->nullable();
            
            // Student specific
            $table->string('current_level', 50)->nullable();
            $table->string('memorization_method', 30)->nullable();
            $table->uuid('parent_id')->nullable();
            
            // Teacher specific
            $table->string('specialization', 100)->nullable();
            $table->date('hire_date')->nullable();
            $table->text('bio')->nullable();
            
            // Parent specific
            $table->string('relation', 20)->nullable();
            $table->string('emergency_contact', 20)->nullable();
            
            $table->jsonb('metadata')->default('{}');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('users')->onDelete('set null');
            
            $table->index('user_id');
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};

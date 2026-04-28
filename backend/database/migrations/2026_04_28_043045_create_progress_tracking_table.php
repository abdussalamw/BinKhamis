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
        Schema::create('progress_tracking', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->string('surah_name', 100);
            $table->integer('surah_number');
            $table->integer('start_verse');
            $table->integer('end_verse');
            $table->date('completion_date')->nullable();
            $table->enum('quality_rating', ['excellent', 'good', 'needs_review']);
            $table->uuid('teacher_id');
            $table->text('notes')->nullable();
            $table->string('audio_recording_url')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('users');
            $table->foreign('teacher_id')->references('id')->on('users');
            
            $table->index('student_id');
            $table->index('surah_name');
            $table->index('completion_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_tracking');
    }
};

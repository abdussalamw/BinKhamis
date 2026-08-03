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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('evaluator_id')->constrained('users')->onDelete('cascade');
            $table->string('period_month'); // e.g. "2026-08"
            $table->integer('performance_score')->default(100);
            $table->integer('attendance_score')->nullable();
            $table->integer('teaching_quality_score')->nullable();
            $table->text('strengths')->nullable();
            $table->text('improvements')->nullable();
            $table->text('general_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};

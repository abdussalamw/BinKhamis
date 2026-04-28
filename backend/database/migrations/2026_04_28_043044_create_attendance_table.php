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
        Schema::create('attendance', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('enrollment_id');
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'excused']);
            $table->text('teacher_note')->nullable();
            $table->uuid('recorded_by');
            $table->timestamps();

            $table->foreign('enrollment_id')->references('id')->on('enrollments');
            $table->foreign('recorded_by')->references('id')->on('users');
            
            $table->unique(['enrollment_id', 'date']);
            $table->index('date');
            $table->index('enrollment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};

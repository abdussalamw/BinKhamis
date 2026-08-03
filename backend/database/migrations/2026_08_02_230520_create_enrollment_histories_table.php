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
        Schema::create('enrollment_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('from_circle_id')->nullable()->constrained('circles')->onDelete('set null');
            $table->foreignUuid('to_circle_id')->nullable()->constrained('circles')->onDelete('set null');
            $table->foreignUuid('teacher_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('event_type')->default('transfer'); // enrolled, transferred, level_changed, status_changed
            $table->string('from_level')->nullable();
            $table->string('to_level')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('changed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollment_histories');
    }
};

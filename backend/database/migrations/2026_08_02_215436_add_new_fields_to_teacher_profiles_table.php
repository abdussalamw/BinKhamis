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
        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->string('bank_name')->nullable()->after('bank_account_number');
            $table->string('marital_status')->nullable();
            $table->string('academic_qualification')->nullable();
            $table->string('graduation_year')->nullable();
            $table->string('university')->nullable();
            $table->json('quran_ijazat')->nullable();
            $table->decimal('basic_salary', 10, 2)->nullable();
            $table->string('employment_status')->default('active'); // active, on_leave, terminated
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name', 'marital_status', 
                'academic_qualification', 'graduation_year', 'university', 
                'quran_ijazat', 'basic_salary', 'employment_status'
            ]);
        });
    }
};

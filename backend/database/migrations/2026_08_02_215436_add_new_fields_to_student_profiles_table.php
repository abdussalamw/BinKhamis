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
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('passport_number')->nullable()->after('national_id');
            $table->string('place_of_birth')->nullable()->after('birth_date');
            $table->foreignUuid('guardian_id')->nullable()->constrained('guardians')->onDelete('set null');
            
            // Drop old guardian fields
            $table->dropColumn(['parent_phone_1', 'parent_relation_1', 'parent_phone_2', 'parent_relation_2']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropForeign(['guardian_id']);
            $table->dropColumn([
                'passport_number', 'place_of_birth', 'guardian_id'
            ]);
            
            $table->string('parent_phone_1')->nullable();
            $table->string('parent_relation_1')->nullable();
            $table->string('parent_phone_2')->nullable();
            $table->string('parent_relation_2')->nullable();
        });
    }
};

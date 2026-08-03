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
        Schema::table('users', function (Blueprint $table) {
            $table->string('identity_type')->default('national_id')->nullable();
            $table->string('national_id')->nullable();
            $table->string('passport_number')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('status')->default('active')->nullable();

            // Student fields
            $table->string('academic_stage')->nullable();
            $table->string('grade_level')->nullable();
            $table->string('memorization_amount')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('school_name')->nullable();
            $table->foreignUuid('guardian_id')->nullable()->constrained('guardians')->onDelete('set null');

            // Teacher fields
            $table->string('specialization')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('academic_qualification')->nullable();
            $table->string('graduation_year')->nullable();
            $table->string('university')->nullable();
            $table->json('quran_ijazat')->nullable();
            $table->decimal('basic_salary', 10, 2)->nullable();
        });

        // Copy data from student_profiles
        if (Schema::hasTable('student_profiles')) {
            $spList = DB::table('student_profiles')->get();
            foreach ($spList as $sp) {
                DB::table('users')->where('id', $sp->user_id)->update([
                    'identity_type' => $sp->identity_type ?? 'national_id',
                    'national_id' => $sp->national_id ?? null,
                    'passport_number' => $sp->passport_number ?? null,
                    'place_of_birth' => $sp->place_of_birth ?? null,
                    'birth_date' => $sp->birth_date ?? null,
                    'status' => $sp->status ?? 'active',
                    'academic_stage' => $sp->academic_stage ?? null,
                    'grade_level' => $sp->grade_level ?? null,
                    'memorization_amount' => $sp->current_level ?? $sp->program ?? null,
                    'neighborhood' => $sp->neighborhood ?? null,
                    'guardian_id' => $sp->guardian_id ?? null,
                ]);
            }
        }

        // Copy data from teacher_profiles
        if (Schema::hasTable('teacher_profiles')) {
            $tpList = DB::table('teacher_profiles')->get();
            foreach ($tpList as $tp) {
                DB::table('users')->where('id', $tp->user_id)->update([
                    'identity_type' => $tp->identity_type ?? 'national_id',
                    'national_id' => $tp->national_id ?? null,
                    'status' => $tp->status ?? 'active',
                    'specialization' => $tp->specialization ?? null,
                    'bank_name' => $tp->bank_name ?? null,
                    'bank_account_number' => $tp->bank_account_number ?? null,
                    'academic_qualification' => $tp->academic_qualification ?? null,
                    'graduation_year' => $tp->graduation_year ?? null,
                    'university' => $tp->university ?? null,
                    'quran_ijazat' => $tp->quran_ijazat ?? null,
                    'basic_salary' => $tp->basic_salary ?? null,
                ]);
            }
        }

        // Copy remaining data from old profiles table if exists
        if (Schema::hasTable('profiles')) {
            $pList = DB::table('profiles')->get();
            foreach ($pList as $p) {
                $user = DB::table('users')->where('id', $p->user_id)->first();
                if (!$user) continue;

                $updateData = [];
                if (empty($user->national_id) && !empty($p->national_id)) $updateData['national_id'] = $p->national_id;
                if (empty($user->academic_stage) && !empty($p->academic_stage)) $updateData['academic_stage'] = $p->academic_stage;
                if (empty($user->grade_level) && !empty($p->grade_level)) $updateData['grade_level'] = $p->grade_level;
                if (empty($user->neighborhood) && !empty($p->neighborhood)) $updateData['neighborhood'] = $p->neighborhood;
                if (empty($user->birth_date) && !empty($p->birth_date)) $updateData['birth_date'] = $p->birth_date;
                if (empty($user->memorization_amount) && !empty($p->current_level)) $updateData['memorization_amount'] = $p->current_level;

                if (!empty($updateData)) {
                    DB::table('users')->where('id', $p->user_id)->update($updateData);
                }
            }
        }

        // Drop redundant profile tables completely
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('teacher_profiles');
        Schema::dropIfExists('profiles');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['guardian_id']);
            $table->dropColumn([
                'identity_type', 'national_id', 'passport_number', 'place_of_birth',
                'birth_date', 'status', 'academic_stage', 'grade_level',
                'memorization_amount', 'neighborhood', 'school_name', 'guardian_id',
                'specialization', 'bank_name', 'bank_account_number',
                'academic_qualification', 'graduation_year', 'university',
                'quran_ijazat', 'basic_salary'
            ]);
        });
    }
};

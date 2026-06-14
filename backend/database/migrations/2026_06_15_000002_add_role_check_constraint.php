<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The valid roles in the system.
     */
    protected $validRoles = ['owner', 'admin', 'supervisor', 'teacher', 'student'];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if constraint already exists before adding (idempotent)
        $exists = DB::selectOne("
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'users_role_check'
            AND table_name = 'users'
        ");

        if (!$exists) {
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin', 'supervisor', 'teacher', 'student'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
    }
};
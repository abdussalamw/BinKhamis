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
        // D10: Add indexes using IF NOT EXISTS to avoid duplicate errors
        \DB::statement('CREATE INDEX IF NOT EXISTS activity_logs_school_id_index ON activity_logs (school_id)');
        \DB::statement('CREATE INDEX IF NOT EXISTS activity_logs_action_index ON activity_logs (action)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('activity_logs_school_id_index');
            $table->dropIndex('activity_logs_action_index');
        });
    }
};
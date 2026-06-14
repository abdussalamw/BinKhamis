<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Artisan;

class MigrateAllTenants extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenants:migrate {--fresh : Drop all tables before re-running migrations}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrations on all tenant schemas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Tenant Migration Tool ===');
        $this->line('');

        // Fetch all schools from central database
        $schools = DB::connection('central')->table('schools')->where('is_active', true)->get();

        if ($schools->isEmpty()) {
            $this->warn('No active schools found in central database.');
            return Command::SUCCESS;
        }

        $this->info("Found {$schools->count()} active school(s).");
        $this->line('');

        $successCount = 0;
        $failCount = 0;

        foreach ($schools as $school) {
            $this->line("─── Processing school: {$school->name} ({$school->id}) ───");

            // Try full UUID schema name first, then fallback to old format
            $schemaName = 'school_' . str_replace('-', '_', $school->id);
            $oldSchemaName = 'school_' . str_replace('-', '_', substr($school->id, 0, 8));

            // Check which schema exists
            $schemaExists = DB::connection('central')->selectOne(
                "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$schemaName]
            );

            if (!$schemaExists) {
                $oldSchemaExists = DB::connection('central')->selectOne(
                    "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$oldSchemaName]
                );
                if ($oldSchemaExists) {
                    $schemaName = $oldSchemaName;
                } else {
                    $this->error("Schema not found for school {$school->name} (tried: {$schemaName}, {$oldSchemaName})");
                    $failCount++;
                    continue;
                }
            }

            try {
                // Set connection to tenant
                Config::set('database.connections.tenant.search_path', $schemaName);
                DB::purge('tenant');
                DB::reconnect('tenant');
                DB::connection('tenant')->statement("SET search_path TO \"{$schemaName}\", public");

                // Run migrations
                if ($this->option('fresh')) {
                    $this->info("  → Dropping all tables and re-running migrations...");
                    Artisan::call('migrate:fresh', [
                        '--database' => 'tenant',
                        '--force' => true,
                        '--path' => 'database/migrations',
                    ]);
                } else {
                    $this->info("  → Running migrations...");
                    Artisan::call('migrate', [
                        '--database' => 'tenant',
                        '--force' => true,
                        '--path' => 'database/migrations',
                    ]);
                }

                $output = Artisan::output();
                $this->line($output);
                $this->info("  ✓ {$school->name} completed successfully.");
                $successCount++;

            } catch (\Exception $e) {
                $this->error("  ✗ Failed for {$school->name}: " . $e->getMessage());
                $failCount++;
            }

            $this->line('');
        }

        // Summary
        $this->line('═══════════════════════════════════');
        $this->info("Migration complete: {$successCount} succeeded, {$failCount} failed.");
        $this->line('═══════════════════════════════════');

        return $failCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
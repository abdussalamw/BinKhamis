<?php
 
namespace App\Http\Middleware;
 
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
 
class IdentifyTenant
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // 1. Identify Tenant (School)
        $schoolId = $request->header('X-School-ID');
        
        if ($schoolId) {
            $this->switchToTenant($schoolId);
        } else {
            // Default to central for routes that don't specify a tenant
            Config::set('database.default', 'central');
        }
 
        return $next($request);
    }
 
    protected function switchToTenant($schoolId)
    {
        // Build schema name from full UUID (C4 fix - no collision risk)
        $schemaName = 'school_' . str_replace('-', '_', $schoolId);
        // Backward compatibility: old schema name format (first 8 chars)
        $oldSchemaName = 'school_' . str_replace('-', '_', substr($schoolId, 0, 8));

        try {
            // Check if the new full-UUID schema exists in PostgreSQL
            $schemaExists = DB::connection('central')->selectOne(
                "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$schemaName]
            );

            if (!$schemaExists) {
                // Try the old truncated schema name for backward compatibility
                $oldSchemaExists = DB::connection('central')->selectOne(
                    "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$oldSchemaName]
                );

                if ($oldSchemaExists) {
                    // Use old schema name for existing tenants
                    $schemaName = $oldSchemaName;
                    \Log::info("Using legacy schema name for school {$schoolId}: {$schemaName}");
                } else {
                    // Fallback to public if the school exists in central DB
                    $schoolExists = DB::connection('central')->table('schools')->where('id', $schoolId)->exists();
                    if ($schoolExists) {
                        $schemaName = 'public';
                        \Log::info("Using public schema as fallback for school {$schoolId}");
                    } else {
                        \Log::warning("Tenant schema not found for school {$schoolId} (tried: {$schemaName}, {$oldSchemaName})");
                        // L4: Return clear error instead of silent fallback
                        abort(500, 'Tenant schema not found');
                    }
                }
            }

            // Set the search path for the tenant connection
            Config::set('database.connections.tenant.search_path', $schemaName);
            // Set default to tenant so Eloquent models use the tenant connection
            Config::set('database.default', 'tenant');
            // Purge and reconnect to apply the new search_path
            DB::purge('tenant');
            DB::reconnect('tenant');
            // Force SET search_path for the current connection session
            DB::connection('tenant')->statement("SET search_path TO \"{$schemaName}\", public");

        } catch (\Exception $e) {
            \Log::error("Error switching to tenant schema: " . $e->getMessage());
            abort(500, 'Database connection error');
        }
    }
}

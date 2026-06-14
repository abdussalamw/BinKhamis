<?php

namespace App\Services;

use App\Models\ActivityLog;

/**
 * H5: Centralized security event logging service.
 * 
 * Extracted to eliminate DRY violation between ApiTokenMiddleware and AuthController.
 * All security events (login attempts, token validation, OTP requests, etc.)
 * are logged through this service with proper error handling.
 */
class SecurityLogService
{
    /**
     * Log a security event to the activity_logs table.
     *
     * @param  \App\Models\User|null  $user    The authenticated user (or null for pre-auth events)
     * @param  string                  $action  Event action name (prefixed with 'auth_')
     * @param  array                   $details Additional context (ip, user_agent, etc.)
     * @return void
     */
    public function log($user, string $action, array $details = []): void
    {
        try {
            $logData = [
                'action' => 'auth_' . $action,
                'new_values' => $details,
                'ip_address' => $details['ip'] ?? request()->ip(),
                'user_agent' => $details['user_agent'] ?? request()->userAgent(),
                'user_id' => $user ? $user->id : null,
                'school_id' => $user ? ($user->school_id ?? null) : null,
                'target_type' => 'user',
                'target_id' => $user ? $user->id : null,
            ];

            // Remove null values to avoid DB constraint issues
            $logData = array_filter($logData, function ($value) {
                return !is_null($value);
            });

            // H6: Use withoutGlobalScope to ensure pre-auth events (user=null) are logged
            ActivityLog::withoutGlobalScope('school')->create($logData);
        } catch (\Exception $e) {
            // Never let logging break the application flow
            \Log::error('Failed to log security event: ' . $e->getMessage());
        }
    }
}
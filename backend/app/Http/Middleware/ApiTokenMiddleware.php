<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\SecurityLogService;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenMiddleware
{
    protected $securityLog;

    public function __construct(SecurityLogService $securityLog)
    {
        $this->securityLog = $securityLog;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization');
        $token = null;

        if ($header && preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            $token = $matches[1];
        } elseif ($request->has('api_token')) {
            $token = $request->input('api_token');
        }

        if (!$token) {
            \Log::warning('ApiTokenMiddleware: Missing token in request');
            return response()->json(['message' => 'Unauthorized: Missing token'], 401);
        }

        $hashedToken = hash('sha256', $token);
        
        // 1. Try to find user in central DB (for Super Admins/Owners)
        $user = \DB::connection('central')->table('users')
            ->where('api_token', $hashedToken)
            ->first();

        if ($user) {
            // Re-map the user to an Eloquent model
            $userModel = User::on('central')->withoutGlobalScope('school')->find($user->id);
            if ($userModel && $userModel->role === 'owner') {
                auth()->login($userModel);
                $request->setUserResolver(function () use ($userModel) {
                    return $userModel;
                });
                return $next($request);
            }
        }

        // 2. If not found in central (or not an owner), check the current default connection (Tenant)
        // Auth scope bypass: BelongsToSchool returns WHERE 1=0 when no auth user exists yet
        $userModel = User::withoutGlobalScope('school')->where('api_token', $hashedToken)->first();

        if (!$userModel) {
            \Log::error('ApiTokenMiddleware: Invalid token provided', ['token_prefix' => substr($token, 0, 5)]);
            $this->securityLog->log(null, 'invalid_token', [
                'reason' => 'Token not found in any database',
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'Unauthorized: Invalid token'], 401);
        }

        // H4: Check token expiry
        if ($userModel->token_expires_at && now()->greaterThan($userModel->token_expires_at)) {
            \Log::info('ApiTokenMiddleware: Token expired for user', ['user_id' => $userModel->id]);
            $this->securityLog->log($userModel, 'token_expired', [
                'reason' => 'Token expired at ' . $userModel->token_expires_at,
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'Unauthorized: Token expired, please login again'], 401);
        }

        // CRITICAL FIX C2: Verify X-School-ID matches the user's school_id
        $requestSchoolId = $request->header('X-School-ID');
        if ($requestSchoolId && $userModel->school_id && $userModel->school_id !== $requestSchoolId) {
            \Log::warning('ApiTokenMiddleware: School ID mismatch', [
                'user_id' => $userModel->id,
                'user_school_id' => $userModel->school_id,
                'request_school_id' => $requestSchoolId
            ]);
            $this->securityLog->log($userModel, 'school_id_mismatch', [
                'user_school_id' => $userModel->school_id,
                'request_school_id' => $requestSchoolId,
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'Unauthorized: School access denied'], 403);
        }

        // CRITICAL FIX C1: Log in the user for tenant users
        auth()->login($userModel);
        $request->setUserResolver(function () use ($userModel) {
            return $userModel;
        });

        $this->securityLog->log($userModel, 'login_success', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $next($request);
    }
}
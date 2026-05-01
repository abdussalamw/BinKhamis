<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        file_put_contents('/home/user/web/binkamis.3ezit.com/public_html/api_debug.txt', "Request: " . $request->fullUrl() . " - Auth: " . $request->header('Authorization') . "\n", FILE_APPEND);
        
        $header = $request->header('Authorization');
        $token = null;

        \Log::debug('ApiTokenMiddleware Headers:', $request->headers->all());
        
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
        $user = User::where('api_token', $hashedToken)->first();

        if (!$user) {
            \Log::error('ApiTokenMiddleware: Invalid token provided', ['token_prefix' => substr($token, 0, 5)]);
            return response()->json(['message' => 'Unauthorized: Invalid token'], 401);
        }

        \Log::info('ApiTokenMiddleware: User authenticated', ['user_id' => $user->id]);

        // Log the user in for this request
        auth()->login($user);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}

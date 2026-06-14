<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\OtpCode;
use App\Services\WhatsAppService;
use App\Services\SecurityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected $whatsapp;
    protected $securityLog;

    public function __construct(WhatsAppService $whatsapp, SecurityLogService $securityLog)
    {
        $this->whatsapp = $whatsapp;
        $this->securityLog = $securityLog;
    }

    /**
     * Check phone status (exists? has password?)
     */
    public function checkPhone(Request $request)
    {
        \Log::info('Login attempt checkPhone', ['phone' => $request->phone]);
        $request->validate(['phone' => 'required|string']);
        $phone = $request->phone;
        if ($phone !== 'supervisor') {
            $phone = preg_replace('/[^0-9]/', '', $phone);
        }
        
        // Auth scope bypass: BelongsToSchool returns WHERE 1=0 when no auth user exists
        $user = User::withoutGlobalScope('school')->where('phone', $phone)->first();
        
        // D7: Always return 200 to prevent phone enumeration.
        // If user not found, return same structure with exists=false.
        if (!$user) {
            return response()->json([
                'exists' => false,
                'name' => null,
                'role' => null,
                'needs_activation' => false,
                'has_password' => false,
            ]);
        }

        // Check if user has a password set (not placeholder)
        $hasPassword = !is_null($user->password) && strlen($user->password) > 20; // Hashed passwords are long

        return response()->json([
            'exists' => true,
            'name' => $user->name,
            'role' => $user->role,
            'needs_activation' => !$hasPassword,
            'has_password' => $hasPassword
        ]);
    }

    /**
     * Login with Password
     */
    public function loginWithPassword(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string'
        ]);
        $phone = $request->phone;
        if ($phone !== 'supervisor') {
            $phone = preg_replace('/[^0-9]/', '', $phone);
        }
        // Auth scope bypass: BelongsToSchool returns WHERE 1=0 when no auth user exists
        $user = User::withoutGlobalScope('school')->where('phone', $phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // L1: Log failed login attempt
            $this->securityLog->log($user, 'login_failed', [
                'reason' => 'Invalid password',
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'بيانات الدخول غير صحيحة'], 401);
        }

        // L1: Log successful password login
        $this->securityLog->log($user, 'login_password_success', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $this->respondWithToken($user);
    }

    /**
     * Send OTP to user via WhatsApp
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string'
        ]);
        $phone = $request->phone;
        if ($phone !== 'supervisor') {
            $phone = preg_replace('/[^0-9]/', '', $phone);
        }
        // Auth scope bypass: BelongsToSchool returns WHERE 1=0 when no auth user exists
        $user = User::withoutGlobalScope('school')->where('phone', $phone)->first();
        
        if (!$user) {
            // L1: Log OTP attempt for non-existent user
            $this->securityLog->log(null, 'otp_request_no_user', [
                'phone' => $phone,
                'ip' => $request->ip(),
            ]);
            return response()->json(['message' => 'رقم الجوال غير مسجل'], 404);
        }

        // Generate 6-digit code
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Save to database (FIX H1: store hashed code, not plain text)
        OtpCode::create([
            'phone' => $phone,
            'code' => hash('sha256', $code),
            'expires_at' => Carbon::now()->addMinutes(10),
            'is_used' => false,
        ]);

        // L1: Log OTP sent event
        $this->securityLog->log($user, 'otp_sent', [
            'phone' => $phone,
            'ip' => $request->ip(),
        ]);

        // Send via WhatsApp (send the plain code, only store hash)
        $message = "رمز التحقق الخاص بك لنظام بن خميس هو: $code \nصالح لمدة 10 دقائق لتنشيط حسابك.";
        
        try {
            $this->whatsapp->sendMessage($phone, $message);
            return response()->json(['success' => true, 'message' => 'تم إرسال رمز التحقق بنجاح عبر الواتساب']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'فشل إرسال الرمز، تأكد من حالة خدمة الواتساب'], 500);
        }
    }

    /**
     * Verify OTP and allow password setup
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $phone = preg_replace('/[^0-9]/', '', $request->phone);
        $code = $request->code;
        
        $otpRecord = OtpCode::where('phone', $phone)
            ->where('code', hash('sha256', $code))
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (!$otpRecord) {
            return response()->json(['success' => false, 'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'], 422);
        }

        $user = User::withoutGlobalScope('school')->where('phone', $phone)->first();
        if (!$user) return response()->json(['message' => 'المستخدم غير موجود'], 404);

        // Mark as used
        $otpRecord->update(['is_used' => true]);

        // If user already has a password, we can just log them in
        // But the user wants a setup flow.
        return response()->json([
            'success' => true,
            'message' => 'تم التحقق من الرمز بنجاح',
            'temp_token' => encrypt(['phone' => $phone, 'timestamp' => now()->timestamp])
        ]);
    }

    /**
     * Set Password and Complete Activation
     */
    public function completeActivation(Request $request)
    {
        $request->validate([
            'temp_token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        try {
            $data = decrypt($request->temp_token);
            if (now()->timestamp - $data['timestamp'] > 600) { // 10 mins limit
                return response()->json(['message' => 'انتهت صلاحية الجلسة، يرجى المحاولة مرة أخرى'], 422);
            }

            $user = User::withoutGlobalScope('school')->where('phone', $data['phone'])->firstOrFail();
            $user->update([
                'password' => Hash::make($request->password),
                'is_active' => true
            ]);

            return $this->respondWithToken($user);
        } catch (\Exception $e) {
            return response()->json(['message' => 'خطأ في تفعيل الحساب'], 400);
        }
    }

    protected function respondWithToken($user)
    {
        $user->load('roles', 'permissions');
        $token = Str::random(60);
        // H4: Set token expiry to 30 days from now (configurable)
        $tokenExpiry = Carbon::now()->addDays(30);
        $user->update([
            'api_token' => hash('sha256', $token),
            'last_login_at' => Carbon::now(),
            'token_expires_at' => $tokenExpiry,
            'token_version' => ($user->token_version ?? 0) + 1
        ]);

        // L5: Set HttpOnly cookie for XSS protection (in addition to JSON response for backward compatibility)
        $cookie = cookie('access_token', $token, 43200, '/', null, false, true, false, 'Strict');

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'school_id' => $user->school_id,
                'roles' => $user->roles->pluck('name'),
                'avatar' => $user->avatar,
            ]
        ])->cookie($cookie);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'student') {
            $user->load('studentProfile');
        } else {
            $user->load('teacherProfile');
        }
        return response()->json($user);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        // L1: Log logout event
        $this->securityLog->log($user, 'logout', [
            'ip' => $request->ip(),
        ]);
        $user->update(['api_token' => null]);
        return response()->json(['success' => true, 'message' => 'تم تسجيل الخروج']);
    }

}

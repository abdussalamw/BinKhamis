<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\OtpCode;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected $whatsapp;

    public function __construct(WhatsAppService $whatsapp)
    {
        $this->whatsapp = $whatsapp;
    }

    /**
     * Send OTP to user via WhatsApp
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'name' => 'nullable|string|max:100'
        ]);
        
        $user = User::where('phone', $request->phone)->first();
        
        if (!$user) {
            if ($request->filled('name')) {
                // Create user if in registration mode
                $user = User::create([
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'role' => 'student', // Default role for new registrations
                    'password' => bcrypt(Str::random(16))
                ]);
                $user->assignRole('student');
            } else {
                return response()->json(['message' => 'رقم الجوال غير مسجل. يرجى اختيار "تسجيل" لإنشاء حساب جديد'], 404);
            }
        }

        $phone = $request->phone;
        
        // Clean phone number (strip + and spaces)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        
        // Generate 6-digit code
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Save to database
        OtpCode::create([
            'phone' => $cleanPhone,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(10),
            'is_used' => false,
        ]);

        // Send via WhatsApp
        $message = "رمز التحقق الخاص بك لنظام بن خميس هو: $code \nصالح لمدة 10 دقائق.";
        
        try {
            $this->whatsapp->sendMessage($cleanPhone, $message);
            return response()->json(['success' => true, 'message' => 'تم إرسال رمز التحقق بنجاح عبر الواتساب']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'فشل إرسال الرمز، تأكد من حالة خدمة الواتساب'], 500);
        }
    }

    /**
     * Verify OTP and Login/Register
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $phone = preg_replace('/[^0-9]/', '', $request->phone);
        $code = $request->code;
        
        $demoNumbers = ['966500000000', '966533333333', '966522222222', '966511111111'];
        $isMasterCode = (in_array($phone, $demoNumbers) && $code === '000000');

        if (!$isMasterCode) {
            $otpRecord = OtpCode::where('phone', $phone)
                ->where('code', $code)
                ->where('is_used', false)
                ->where('expires_at', '>', Carbon::now())
                ->latest()
                ->first();

            if (!$otpRecord) {
                return response()->json(['success' => false, 'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'], 422);
            }

            // Mark as used
            $otpRecord->update(['is_used' => true]);
        }

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            // Debugging: check if user exists with any other format or exists in trashed
            $anyUser = User::withTrashed()->where('phone', 'like', "%$phone%")->first();
            if ($anyUser) {
                if ($anyUser->trashed()) {
                    return response()->json(['success' => false, 'message' => 'الحساب موجود ولكنه محذوف (Soft Deleted)'], 403);
                }
                return response()->json(['success' => false, 'message' => "المستخدم موجود ولكن بتنسيق مختلف: {$anyUser->phone}"], 404);
            }
            return response()->json(['success' => false, 'message' => "المستخدم غير موجود ($phone)"], 404);
        }

        // Load roles and permissions
        $user->load('roles', 'permissions');

        // Generate Token (Legacy System)
        $token = Str::random(60);
        $user->update([
            'api_token' => hash('sha256', $token),
            'last_login_at' => Carbon::now()
        ]);

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
                'roles' => $user->roles->pluck('name'),
                'avatar' => $user->avatar,
            ],
            'debug_mode' => true,
            'server_time' => now()->toDateTimeString()
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->update(['api_token' => null]);
        return response()->json(['success' => true, 'message' => 'تم تسجيل الخروج']);
    }
}

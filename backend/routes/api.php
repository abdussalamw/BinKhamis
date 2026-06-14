<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\CircleController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\WhatsAppController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AcademicTermController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\SchoolController;

Route::middleware('tenant')->group(function() {
    // Auth Public Routes (with rate limiting for L2 security)
    Route::post('auth/check-phone', [AuthController::class, 'checkPhone'])->middleware('throttle:10,1');
    Route::post('auth/login-password', [AuthController::class, 'loginWithPassword'])->middleware('throttle:5,1');
    Route::get('health', function() {
        $wa = app(\App\Services\WhatsAppService::class)->getInstanceStatus();
        return response()->json([
            'backend' => true,
            'database' => \DB::connection()->getPdo() ? true : false,
            'whatsapp' => $wa['state']['instance']['state'] ?? 'OFFLINE'
        ]);
    });
    Route::post('auth/send-otp', [AuthController::class, 'sendOtp'])->middleware('throttle:3,1');
    Route::post('auth/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1');
    Route::post('auth/complete-activation', [AuthController::class, 'completeActivation'])->middleware('throttle:5,1');
 
    Route::middleware('auth.custom')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
 
        // Super Admin Routes (Owner only)
        Route::middleware('role:owner')->group(function () {
            Route::get('super-admin/schools', [SuperAdminController::class, 'index']);
            Route::post('super-admin/schools', [SuperAdminController::class, 'storeSchool']);
            Route::put('super-admin/schools/{id}', [SuperAdminController::class, 'updateSchool']);
            Route::delete('super-admin/schools/{id}', [SuperAdminController::class, 'deleteSchool']);
        });
 
        // School Info (Tenant specific)
        Route::get('school-info', [SchoolController::class, 'show']);
        Route::put('school-info', [SchoolController::class, 'update'])->middleware('role:supervisor,admin,owner');
 
        // Protected Admin/Supervisor Routes
        Route::middleware('role:admin,supervisor,owner')->group(function () {
            Route::apiResource('terms', AcademicTermController::class);
            Route::apiResource('students', StudentController::class);
            Route::apiResource('teachers', TeacherController::class);
            Route::apiResource('circles', CircleController::class);
            Route::get('staff', [StaffController::class, 'index']);
            Route::post('staff', [StaffController::class, 'store']);
            Route::patch('staff/{id}/toggle-status', [StaffController::class, 'toggleStatus']);
            Route::post('import/excel', [ImportController::class, 'importFromJSON']);
            
            Route::prefix('whatsapp')->group(function () {
                Route::get('status', [WhatsAppController::class, 'getStatus']);
                Route::get('qr', [WhatsAppController::class, 'getQR']);
                Route::post('restart', [WhatsAppController::class, 'restart']);
                Route::post('logout', [WhatsAppController::class, 'logout']);
                Route::post('test-message', [WhatsAppController::class, 'sendTestMessage']);
            });
        });
 
        // Teacher/Supervisor/Admin/Owner Routes
        Route::middleware('role:teacher,supervisor,admin,owner')->group(function () {
            Route::post('attendance', [AttendanceController::class, 'store']);
            Route::get('attendance/circle/{circleId}', [AttendanceController::class, 'getByCircle']);
            Route::get('reports/dashboard', [ReportsController::class, 'dashboardOverview']);
            Route::get('stats/overview', [StatsController::class, 'overview']);
        });
 
        // General Reports (protected - admin/supervisor/owner only)
        Route::middleware('role:admin,supervisor,owner')->group(function () {
            Route::get('reports/student/{id}', [ReportsController::class, 'studentReport']);
            Route::get('reports/circle/{id}', [ReportsController::class, 'circleReport']);
            Route::get('stats/attendance-chart', [StatsController::class, 'attendanceChart']);
            Route::get('stats/circle-distribution', [StatsController::class, 'circleDistribution']);
        });
    });
 
});

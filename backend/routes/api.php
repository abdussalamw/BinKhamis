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

// Auth Routes
Route::post('auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('auth/verify-otp', [AuthController::class, 'verifyOtp']);

Route::middleware('auth.custom')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Protected Admin/Supervisor Routes
    Route::middleware('role:admin,supervisor')->group(function () {
        Route::apiResource('students', StudentController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('circles', CircleController::class);
        Route::get('staff', [StaffController::class, 'index']);
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

    // Teacher/Supervisor/Admin Routes
    Route::middleware('role:teacher,supervisor,admin')->group(function () {
        Route::post('attendance', [AttendanceController::class, 'store']);
        Route::get('attendance/circle/{circleId}', [AttendanceController::class, 'getByCircle']);
        Route::get('reports/dashboard', [ReportsController::class, 'dashboardOverview']);
        Route::get('stats/overview', [StatsController::class, 'overview']);
    });

    // General Reports
    Route::get('reports/student/{id}', [ReportsController::class, 'studentReport']);
    Route::get('reports/circle/{id}', [ReportsController::class, 'circleReport']);
    Route::get('stats/attendance-chart', [StatsController::class, 'attendanceChart']);
    Route::get('stats/circle-distribution', [StatsController::class, 'circleDistribution']);
});

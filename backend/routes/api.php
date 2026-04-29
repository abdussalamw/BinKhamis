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

Route::apiResource('students', StudentController::class);
Route::apiResource('teachers', TeacherController::class);
Route::apiResource('circles', CircleController::class);
Route::get('staff', [StaffController::class, 'index']);
Route::patch('staff/{id}/toggle-status', [StaffController::class, 'toggleStatus']);

// Reports Routes
Route::get('reports/dashboard', [ReportsController::class, 'dashboardOverview']);
Route::get('reports/student/{id}', [ReportsController::class, 'studentReport']);
Route::get('reports/circle/{id}', [ReportsController::class, 'circleReport']);

Route::get('stats/overview', [StatsController::class, 'overview']);
Route::get('stats/attendance-chart', [StatsController::class, 'attendanceChart']);
Route::get('stats/circle-distribution', [StatsController::class, 'circleDistribution']);

Route::post('attendance', [AttendanceController::class, 'store']);
Route::get('attendance/circle/{circleId}', [AttendanceController::class, 'getByCircle']);

// Import Routes
Route::post('import/excel', [ImportController::class, 'importFromJSON']);

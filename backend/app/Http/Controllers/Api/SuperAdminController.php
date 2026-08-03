<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use App\Models\Circle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use App\Services\WhatsAppService;
 
class SuperAdminController extends Controller
{
    public function index()
    {
        $schools = School::with('supervisor')->get();
        $totalStudents = 0;
        $totalStaff = 0;
        $totalCircles = 0;
  
        foreach ($schools as $school) {
            try {
                if (DB::getDriverName() === 'pgsql') {
                    $schemaName = 'school_' . str_replace('-', '_', $school->id);
                    $oldSchemaName = 'school_' . str_replace('-', '_', substr($school->id, 0, 8));
                    
                    $schemaCheck = DB::connection('central')->selectOne(
                        "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$schemaName]
                    );
                    if (!$schemaCheck) {
                        $oldSchemaCheck = DB::connection('central')->selectOne(
                            "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$oldSchemaName]
                        );
                        $schemaName = $oldSchemaCheck ? $oldSchemaName : 'public';
                    }
                    
                    DB::connection('tenant')->statement("SET search_path TO \"{$schemaName}\", public");
                    $schoolStudents = DB::connection('tenant')->table('users')->where('role', 'student')->count();
                    $schoolStaff = DB::connection('tenant')->table('users')->whereIn('role', ['admin', 'teacher', 'manager', 'supervisor'])->count();
                    $schoolCircles = DB::connection('tenant')->table('circles')->count();
                } else {
                    // SQLite Mode: Filter by school_id
                    $schoolStudents = User::withoutGlobalScope('school')->where('school_id', $school->id)->where('role', 'student')->count();
                    $schoolStaff = User::withoutGlobalScope('school')->where('school_id', $school->id)->whereIn('role', ['admin', 'teacher', 'manager', 'supervisor'])->count();
                    $schoolCircles = Circle::withoutGlobalScope('school')->where('school_id', $school->id)->count();
                }
                
                $totalStudents += $schoolStudents;
                $totalStaff += $schoolStaff;
                $totalCircles += $schoolCircles;

                $school->students_count = $schoolStudents;
                $school->staff_count = $schoolStaff;
                $school->circles_count = $schoolCircles;
            } catch (\Exception $e) {
                \Log::error("Failed to fetch stats for school {$school->id}: " . $e->getMessage());
                $school->students_count = 0;
                $school->staff_count = 0;
                $school->circles_count = 0;
            }
        }
  
        return response()->json([
            'schools' => $schools,
            'stats' => [
                'total_schools' => $schools->count(),
                'total_students' => $totalStudents,
                'total_staff' => $totalStaff,
                'total_circles' => $totalCircles,
            ]
        ]);
    }
 
    public function storeSchool(Request $request)
    {
        $request->validate([
            'supervisor_name' => 'required|string|max:100',
            'supervisor_phone' => 'required|string',
            'school_name' => 'nullable|string|max:200',
        ]);

        if (User::where('phone', $request->supervisor_phone)->whereIn('role', ['supervisor', 'admin', 'owner'])->exists()) {
            return response()->json(['message' => 'رقم الجوال مسجل بالفعل لمشرف أو مدير آخر.'], 422);
        }
 
        return DB::transaction(function () use ($request) {
            // 1. Create the School (in central DB)
            $school = School::create([
                'name' => $request->school_name ?? 'مجمع جديد',
                'is_active' => true,
            ]);
  
            // 2. Provision Schema (PostgreSQL) - use full UUID
            $schemaName = 'school_' . str_replace('-', '_', $school->id);
            
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("CREATE SCHEMA IF NOT EXISTS \"{$schemaName}\"");
                config(['database.connections.tenant.search_path' => $schemaName]);
                DB::purge('tenant');
                DB::connection('tenant')->statement("SET search_path TO \"{$schemaName}\", public");
                
                Artisan::call('migrate', [
                    '--database' => 'tenant',
                    '--force' => true,
                    '--path' => 'database/migrations',
                ]);
            }
  
                // 3. Create the Supervisor User (in the TENANT SCHEMA)
                $supervisorId = (string) Str::uuid();
                // FIX: generate a random secure password instead of hardcoded 123456
                $tempPassword = Str::random(8);
                DB::connection('tenant')->table('users')->insert([
                    'id' => $supervisorId,
                    'name' => $request->supervisor_name,
                    'phone' => $request->supervisor_phone,
                    'password' => Hash::make($tempPassword),
                    'role' => 'supervisor',
                    'school_id' => $school->id,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
  
                // 4. Update school with supervisor_id (back in central DB)
                $school->update(['supervisor_id' => $supervisorId]);
  
                // 5. Send WhatsApp Invitation
                $waService = new WhatsAppService();
                $schoolCode = str_replace('-', '_', substr($school->id, 0, 8));
                // FIX: use config() instead of env() for frontend URL
                $loginUrl = config('app.frontend_url', config('services.frontend_url', 'http://localhost:5173')) . '/auth/signin';
                
                $message = "مرحباً بك أ. *{$request->supervisor_name}* في منصة حلقات برو.\n\n"
                         . "تم إنشاء مجمعك: *{$school->name}* بنجاح.\n"
                         . "يمكنك الدخول الآن باستخدام البيانات التالية:\n\n"
                         . "📍 *رابط المنصة:* {$loginUrl}\n"
                         . "📱 *رقم الجوال:* {$request->supervisor_phone}\n"
                         . "🔑 *كلمة المرور:* {$tempPassword}\n"
                         . "🏢 *كود المجمع:* `{$schoolCode}`\n\n"
                         . "⚠️ يرجى تغيير كلمة المرور بعد تسجيل الدخول لأول مرة.\n\n"
                         . "نتمنى لكم رحلة تعليمية مباركة.";
                
                $waService->sendMessage($request->supervisor_phone, $message);

                return response()->json([
                    'success' => true,
                    'message' => 'تم إنشاء المجمع والمساحة المعزولة وإرسال بيانات الدخول عبر الواتساب',
                    'school' => $school,
                    'school_code' => $schoolCode,
                ]);
            
        });
    }
 
    public function updateSchool(Request $request, $id)
    {
        $request->validate([
            'school_name' => 'nullable|string|max:200',
            'supervisor_name' => 'required|string|max:100',
            'supervisor_phone' => 'required|string',
        ]);
        
        $school = School::findOrFail($id);
        
        // Ensure no other manager has this phone
        $existingPhone = User::withoutGlobalScope('school')
            ->where('phone', $request->supervisor_phone)
            ->where('id', '!=', $school->supervisor_id)
            ->whereIn('role', ['supervisor', 'admin', 'owner'])
            ->exists();
            
        if ($existingPhone) {
            return response()->json(['message' => 'رقم الجوال مسجل بالفعل لمشرف أو مدير آخر.'], 422);
        }

        $school->update(['name' => $request->school_name ?? $school->name]);
        
        if ($school->supervisor_id) {
            if (DB::getDriverName() === 'pgsql') {
                $schemaName = 'school_' . str_replace('-', '_', $school->id);
                DB::connection('tenant')->statement("SET search_path TO \"{$schemaName}\", public");
                DB::connection('tenant')->table('users')->where('id', $school->supervisor_id)->update([
                    'name' => $request->supervisor_name,
                    'phone' => $request->supervisor_phone,
                ]);
            } else {
                User::withoutGlobalScope('school')
                    ->where('id', $school->supervisor_id)
                    ->update([
                        'name' => $request->supervisor_name,
                        'phone' => $request->supervisor_phone,
                    ]);
            }
        }
        
        return response()->json(['success' => true, 'school' => $school]);
    }
 
    public function deleteSchool($id)
    {
        $school = School::findOrFail($id);
        
        // Drop both schema name formats: new (full UUID) and legacy (8 chars)
        $schemaName    = 'school_' . str_replace('-', '_', $school->id);
        $oldSchemaName = 'school_' . str_replace('-', '_', substr($school->id, 0, 8));
        try {
            // Drop new UUID-based schema
            DB::statement("DROP SCHEMA IF EXISTS \"{$schemaName}\" CASCADE");
            // Drop legacy short-name schema (if it exists and differs from the new name)
            if ($oldSchemaName !== $schemaName) {
                DB::statement("DROP SCHEMA IF EXISTS \"{$oldSchemaName}\" CASCADE");
            }
        } catch (\Exception $e) {
            \Log::error("Failed to drop schema(s) for school {$school->id}: " . $e->getMessage());
        }

        $school->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف المجمع وكافة بياناته بنجاح']);
    }
}

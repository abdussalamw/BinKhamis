<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$school = App\Models\School::firstOrCreate(
    ['name' => 'مجمع بن خميس المطور'],
    ['is_active' => true]
);

App\Models\User::withoutGlobalScope('school')->whereNull('school_id')->where('role', '!=', 'owner')->update(['school_id' => $school->id]);
App\Models\Circle::withoutGlobalScope('school')->whereNull('school_id')->update(['school_id' => $school->id]);

$admin = App\Models\User::withoutGlobalScope('school')->where('phone', '0511111111')->first();
if ($admin) {
    $admin->update(['school_id' => $school->id]);
    $school->update(['supervisor_id' => $admin->id]);
}

$schools = App\Models\School::with('supervisor')->get();
echo json_encode($schools, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

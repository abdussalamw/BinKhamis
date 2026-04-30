<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $supervisor = Role::firstOrCreate(['name' => 'supervisor', 'guard_name' => 'web']);
        $teacher = Role::firstOrCreate(['name' => 'teacher', 'guard_name' => 'web']);
        $student = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

        // Create basic permissions
        $permissions = [
            'manage users',
            'manage circles',
            'manage attendance',
            'view reports',
            'record progress',
            'view profile',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Assign permissions to roles
        $admin->givePermissionTo(Permission::all());
        
        $supervisor->givePermissionTo([
            'manage circles',
            'manage attendance',
            'view reports',
            'record progress',
        ]);

        $teacher->givePermissionTo([
            'manage attendance',
            'record progress',
            'view profile',
        ]);

        $student->givePermissionTo([
            'view profile',
        ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateOwnerPhoneSeeder extends Seeder
{
    public function run()
    {
        $phone = '966544592410';
        $owner = DB::connection('central')->table('users')->where('role', 'owner')->first();
        
        if ($owner) {
            DB::connection('central')->table('users')->where('id', $owner->id)->update([
                'phone' => $phone,
                'password' => Hash::make('123456') // Force reset to 123456 for now
            ]);
            echo "Updated existing owner phone to $phone\n";
        } else {
            DB::connection('central')->table('users')->insert([
                'id' => \Illuminate\Support\Str::uuid(),
                'name' => 'المالك المشرف العام',
                'phone' => $phone,
                'password' => Hash::make('123456'),
                'role' => 'owner',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            echo "Created new owner with phone $phone\n";
        }
    }
}

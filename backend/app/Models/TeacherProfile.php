<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'short_name',
        'national_id',
        'nationality',
        'birth_date',
        'gender',
        'address',
        'neighborhood',
        'specialization',
        'hire_date',
        'bank_account_number',
        'bio',
        'profile_picture',
        'metadata'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

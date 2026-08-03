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
        'bank_name',
        'marital_status',
        'academic_qualification',
        'graduation_year',
        'university',
        'quran_ijazat',
        'basic_salary',
        'employment_status',
        'identity_type',
        'status',
        'bio',
        'profile_picture',
        'metadata'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'metadata' => 'array',
        'quran_ijazat' => 'array',
        'basic_salary' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

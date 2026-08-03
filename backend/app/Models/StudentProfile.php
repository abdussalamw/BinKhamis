<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
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
        'academic_stage',
        'grade_level',
        'current_level',
        'memorization_method',
        'program',
        'student_phone',
        'enrollment_semester',
        'studied_semesters',
        'completion_year',
        'end_semester',
        'end_reason',
        'passport_number',
        'place_of_birth',
        'identity_type',
        'status',
        'guardian_id',
        'profile_picture',
        'metadata'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'metadata' => 'array',
        'studied_semesters' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guardian()
    {
        return $this->belongsTo(Guardian::class, 'guardian_id');
    }
}

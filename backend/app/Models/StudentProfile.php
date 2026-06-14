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
        'parent_phone_1',
        'parent_relation_1',
        'parent_phone_2',
        'parent_relation_2',
        'student_phone',
        'enrollment_semester',
        'studied_semesters',
        'completion_year',
        'end_semester',
        'end_reason',
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
}

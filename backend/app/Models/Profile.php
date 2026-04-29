<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'type',
        'birth_date',
        'gender',
        'address',
        'neighborhood',
        'short_name',
        'national_id',
        'national_id_type',
        'nationality',
        'current_level',
        'grade_level',
        'academic_stage',
        'program',
        'memorization_method',
        'educational_status',
        'parent_id',
        'parent_phone_1',
        'parent_relation_1',
        'parent_phone_2',
        'parent_relation_2',
        'student_phone',
        'specialization',
        'hire_date',
        'join_date',
        'bio',
        'relation',
        'emergency_contact',
        'enrollment_semester',
        'studied_semesters',
        'completion_year',
        'end_semester',
        'end_reason',
        'metadata',
        'profile_picture',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'join_date' => 'date',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}

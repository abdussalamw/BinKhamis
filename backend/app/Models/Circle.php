<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToSchool;

class Circle extends Model
{
    use HasFactory, SoftDeletes, BelongsToSchool;

    protected $fillable = [
        'name',
        'teacher_id',
        'description',
        'max_students',
        'is_active',
        'academic_term_id',
        'period',
        'school_id',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'circle_id', 'student_id')
            ->withPivot('enrolled_at', 'status');
    }

    public function academicTerm()
    {
        return $this->belongsTo(AcademicTerm::class);
    }
}

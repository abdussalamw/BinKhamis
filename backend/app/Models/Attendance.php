<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToSchool;

class Attendance extends Model
{
    use HasFactory, BelongsToSchool;

    protected $table = 'attendance';

    protected $fillable = [
        'enrollment_id',
        'date',
        'status',
        'teacher_note',
        'note',
        'recorded_by',
        'term_id',
        'school_id',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class, 'enrollment_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function circle()
    {
        return $this->belongsTo(Circle::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class EnrollmentHistory extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_id',
        'from_circle_id',
        'to_circle_id',
        'teacher_id',
        'event_type',
        'from_level',
        'to_level',
        'notes',
        'changed_at',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function fromCircle()
    {
        return $this->belongsTo(Circle::class, 'from_circle_id');
    }

    public function toCircle()
    {
        return $this->belongsTo(Circle::class, 'to_circle_id');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}

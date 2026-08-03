<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Evaluation extends Model
{
    use HasUuids;

    protected $fillable = [
        'teacher_id',
        'evaluator_id',
        'period_month',
        'performance_score',
        'attendance_score',
        'teaching_quality_score',
        'strengths',
        'improvements',
        'general_notes',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}

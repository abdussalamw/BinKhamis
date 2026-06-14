<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToSchool;

class Enrollment extends Model
{
    use HasFactory, BelongsToSchool;

    protected $fillable = [
        'student_id',
        'circle_id',
        'enrolled_at',
        'status',
        'school_id',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function circle()
    {
        return $this->belongsTo(Circle::class);
    }
}

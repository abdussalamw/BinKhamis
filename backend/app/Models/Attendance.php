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
        'student_id',
        'circle_id',
        'date',
        'status',
        'note',
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

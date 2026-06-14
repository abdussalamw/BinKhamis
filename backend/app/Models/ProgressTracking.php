<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToSchool;

class ProgressTracking extends Model
{
    use HasFactory, BelongsToSchool;

    protected $table = 'progress_tracking';

    protected $fillable = [
        'student_id',
        'circle_id',
        'date',
        'type',
        'surah',
        'from_verse',
        'to_verse',
        'pages_count',
        'grade',
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

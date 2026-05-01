<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressTracking extends Model
{
    use HasUuids;

    protected $table = 'progress_tracking';

    protected $fillable = [
        'student_id',
        'surah_name',
        'surah_number',
        'start_verse',
        'end_verse',
        'date',
        'quality_rating',
        'teacher_id',
        'notes',
        'audio_recording_url',
    ];

    protected $casts = [
        'date' => 'date',
        'quality_rating' => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}

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
        'current_level',
        'memorization_method',
        'parent_id',
        'specialization',
        'hire_date',
        'bio',
        'relation',
        'emergency_contact',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'birth_date' => 'date',
        'hire_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

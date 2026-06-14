<?php

namespace App\Traits;

use App\Models\School;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToSchool
{
    protected static function bootBelongsToSchool()
    {
        static::creating(function ($model) {
            if (empty($model->school_id) && auth()->check()) {
                $model->school_id = auth()->user()->school_id;
            }
        });

        static::addGlobalScope('school', function (Builder $builder) {
            if (auth()->check()) {
                $user = auth()->user();
                if ($user->role !== 'owner' && $user->school_id) {
                    $builder->where('school_id', $user->school_id);
                }
            } else {
                // FIX H1: If no authenticated user, restrict to empty set to prevent data leaks
                $builder->whereRaw('1 = 0');
            }
        });
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}

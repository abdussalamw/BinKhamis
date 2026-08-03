<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Str;

use App\Traits\BelongsToSchool;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids, SoftDeletes, HasRoles, BelongsToSchool;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'avatar',
        'is_active',
        'last_login_at',
        'api_token',
        'token_expires_at',
        'token_version',
        'school_id',

        // Unified Profile Fields
        'identity_type',
        'national_id',
        'passport_number',
        'place_of_birth',
        'birth_date',
        'status',
        'academic_stage',
        'grade_level',
        'memorization_amount',
        'neighborhood',
        'school_name',
        'guardian_id',
        'secondary_guardian_id',
        'specialization',
        'bank_name',
        'bank_account_number',
        'academic_qualification',
        'graduation_year',
        'university',
        'quran_ijazat',
        'basic_salary',
    ];

    protected $appends = ['active_profile', 'student_profile', 'teacher_profile', 'profile'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'token_expires_at' => 'datetime',
            'birth_date' => 'date',
            'quran_ijazat' => 'array',
            'basic_salary' => 'decimal:2',
        ];
    }

    /**
     * Custom token generation to avoid Sanctum environment issues
     */
    public function createToken(string $name)
    {
        $token = Str::random(80);
        $this->update(['api_token' => hash('sha256', $token)]);
        
        return new class($token) {
            public $plainTextToken;
            public function __construct($token) { $this->plainTextToken = $token; }
        };
    }

    public function guardian()
    {
        return $this->belongsTo(Guardian::class, 'guardian_id');
    }

    public function secondaryGuardian()
    {
        return $this->belongsTo(Guardian::class, 'secondary_guardian_id');
    }

    public function getActiveProfileAttribute()
    {
        return $this;
    }

    public function getStudentProfileAttribute()
    {
        return $this;
    }

    public function getTeacherProfileAttribute()
    {
        return $this;
    }

    public function getProfileAttribute()
    {
        return $this;
    }

    public function circles(): HasMany
    {
        return $this->hasMany(Circle::class, 'teacher_id');
    }

    public function progressTracking(): HasMany
    {
        return $this->hasMany(ProgressTracking::class, 'student_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function enrollmentHistories(): HasMany
    {
        return $this->hasMany(EnrollmentHistory::class, 'student_id');
    }

    public function teacherLeaves(): HasMany
    {
        return $this->hasMany(TeacherLeave::class, 'teacher_id');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'teacher_id');
    }
}

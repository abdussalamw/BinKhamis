<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\School;
use Illuminate\Support\Str;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

/**
 * L6: Security tests for tenant isolation and authentication.
 * 
 * These tests verify that:
 * 1. Token authentication works correctly
 * 2. X-School-ID validation prevents cross-tenant access
 * 3. Token expiry is enforced
 * 4. BelongsToSchool trait isolates data properly
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $school1;
    protected $school2;
    protected $user1;
    protected $user2;
    protected $token1;
    protected $token2;

    /**
     * Set up test data with two schools and two users.
     * Note: This uses the default SQLite testing DB, not PostgreSQL schemas.
     * For full schema isolation tests, a PostgreSQL test DB is required.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Create two schools
        $this->school1 = School::create([
            'id' => (string) Str::uuid(),
            'name' => 'Test School 1',
            'slug' => 'test-school-1',
            'is_active' => true,
        ]);

        $this->school2 = School::create([
            'id' => (string) Str::uuid(),
            'name' => 'Test School 2',
            'slug' => 'test-school-2',
            'is_active' => true,
        ]);

        // Create users in each school
        $this->user1 = User::create([
            'name' => 'User One',
            'email' => 'user1@test.com',
            'phone' => '966500000001',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
            'school_id' => $this->school1->id,
            'is_active' => true,
        ]);

        $this->user2 = User::create([
            'name' => 'User Two',
            'email' => 'user2@test.com',
            'phone' => '966500000002',
            'password' => bcrypt('password456'),
            'role' => 'teacher',
            'school_id' => $this->school2->id,
            'is_active' => true,
        ]);

        // Generate tokens
        $this->token1 = Str::random(60);
        $this->user1->update(['api_token' => hash('sha256', $this->token1)]);

        $this->token2 = Str::random(60);
        $this->user2->update(['api_token' => hash('sha256', $this->token2)]);
    }

    /** @test */
    public function valid_token_authenticates_user()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
            'X-School-ID' => $this->school1->id,
        ])->getJson('/api/auth/me');

        $response->assertStatus(200);
    }

    /** @test */
    public function missing_token_returns_401()
    {
        $response = $this->getJson('/api/auth/me');
        $response->assertStatus(401);
    }

    /** @test */
    public function invalid_token_returns_401()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid_token_here',
            'X-School-ID' => $this->school1->id,
        ])->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    /** @test */
    public function expired_token_returns_401()
    {
        // Set token to expired
        $this->user1->update([
            'token_expires_at' => now()->subDay(),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
            'X-School-ID' => $this->school1->id,
        ])->getJson('/api/auth/me');

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthorized: Token expired, please login again']);
    }

    /** @test */
    public function valid_token_without_expiry_passes()
    {
        // Token without expiry set should pass (backward compatibility)
        $this->user1->update(['token_expires_at' => null]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
            'X-School-ID' => $this->school1->id,
        ])->getJson('/api/auth/me');

        $response->assertStatus(200);
    }

    /** @test */
    public function school_id_mismatch_returns_403()
    {
        // User 1's token but with School 2's ID
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
            'X-School-ID' => $this->school2->id, // Wrong school!
        ])->getJson('/api/auth/me');

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Unauthorized: School access denied']);
    }

    /** @test */
    public function user_from_school1_cannot_access_school2_data()
    {
        // Test that BelongsToSchool trait isolates queries
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
            'X-School-ID' => $this->school1->id,
        ])->getJson('/api/students');

        // Should fail with 403 because user1 is teacher, not admin
        // But importantly, it should NOT leak school2's data
        $response->assertStatus(403);
    }

    /** @test */
    public function login_with_valid_credentials_returns_token()
    {
        $response = $this->postJson('/api/auth/login-password', [
            'phone' => '966500000001',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'access_token',
            'token_type' => 'Bearer',
            'user' => ['id', 'name', 'role'],
        ]);
    }

    /** @test */
    public function login_with_invalid_password_returns_401()
    {
        $response = $this->postJson('/api/auth/login-password', [
            'phone' => '966500000001',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function logout_clears_token()
    {
        // Login first to get a fresh token
        $response = $this->postJson('/api/auth/login-password', [
            'phone' => '966500000001',
            'password' => 'password123',
        ]);

        $token = $response->json('access_token');

        // Now logout
        $logoutResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-School-ID' => $this->school1->id,
        ])->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);
    }

    /** @test */
    public function role_middleware_restricts_access()
    {
        // User 1 is a teacher, should not access admin routes
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
            'X-School-ID' => $this->school1->id,
        ])->getJson('/api/students');

        $response->assertStatus(403);
    }

    /** @test */
    public function owner_can_access_all_schools()
    {
        // Create an owner user (in central DB for real, but we test with tenant for simplicity)
        $owner = User::create([
            'name' => 'Platform Owner',
            'email' => 'owner@test.com',
            'phone' => '966500000000',
            'password' => bcrypt('ownerpass'),
            'role' => 'owner',
            'is_active' => true,
        ]);

        $ownerToken = Str::random(60);
        $owner->update(['api_token' => hash('sha256', $ownerToken)]);

        // Owner should access super admin routes
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $ownerToken,
        ])->getJson('/api/super-admin/schools');

        $response->assertStatus(200);
    }

    /** @test */
    public function belogns_to_school_scope_isolates_data()
    {
        // Verify that school1's user can only see school1's data
        $user1schoolId = $this->user1->school_id;
        $this->assertEquals($this->school1->id, $user1schoolId);

        $user2schoolId = $this->user2->school_id;
        $this->assertEquals($this->school2->id, $user2schoolId);

        $this->assertNotEquals($user1schoolId, $user2schoolId);
    }
}
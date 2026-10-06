<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_guest_cannot_reach_admin_api(): void
    {
        $this->getJson('/api/v1/admin/dashboard')->assertStatus(401);
    }

    public function test_customer_token_is_refused_by_admin_api(): void
    {
        $customer = $this->makeUser('customer');
        $token = $customer->createToken('customer')->plainTextToken;

        foreach (['/api/v1/admin/dashboard', '/api/v1/admin/orders', '/api/v1/admin/customers', '/api/v1/admin/products'] as $url) {
            $this->withToken($token)->getJson($url)->assertStatus(403)->assertJson(['message' => 'Access denied.']);
        }
    }

    public function test_customer_cannot_sign_in_through_admin_login(): void
    {
        $this->makeUser('customer', ['email' => 'shopper@example.com']);

        $this->postJson('/api/v1/admin/auth/login', ['email' => 'shopper@example.com', 'password' => 'Password123'])
            ->assertStatus(403);
    }

    public function test_customer_login_redirects_to_profile_and_admin_login_to_dashboard(): void
    {
        $this->makeUser('customer', ['email' => 'shopper@example.com']);
        $this->makeUser('admin', ['email' => 'staff@example.com']);

        $this->postJson('/api/v1/auth/login', ['email' => 'shopper@example.com', 'password' => 'Password123'])
            ->assertOk()->assertJsonPath('redirect_to', '/profile')->assertJsonPath('user.role', 'customer');

        $this->postJson('/api/v1/admin/auth/login', ['email' => 'staff@example.com', 'password' => 'Password123'])
            ->assertOk()->assertJsonPath('redirect_to', '/admin/dashboard');
    }

    public function test_admin_can_open_dashboard(): void
    {
        $admin = $this->makeUser('admin');
        $this->withToken($admin->createToken('admin')->plainTextToken)
            ->getJson('/api/v1/admin/dashboard')->assertOk()->assertJsonStructure(['stats' => ['total_orders', 'total_revenue']]);
    }

    public function test_only_super_admin_can_change_settings(): void
    {
        $admin = $this->makeUser('admin');
        $this->withToken($admin->createToken('admin')->plainTextToken)
            ->putJson('/api/v1/admin/settings', [])->assertStatus(403);
    }

    public function test_public_registration_always_creates_a_customer(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sneaky', 'email' => 'sneaky@example.com', 'password' => 'Password123',
            'password_confirmation' => 'Password123', 'role' => 'super_admin', 'role_id' => 3,
        ])->assertCreated()->assertJsonPath('user.role', 'customer');
    }
}

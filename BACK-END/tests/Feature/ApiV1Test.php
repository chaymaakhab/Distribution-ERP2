<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiV1Test extends TestCase
{
    use RefreshDatabase;

    public function test_auth_me_endpoint()
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(200)
                 ->assertJsonPath('roleCode', 'admin');
    }

    public function test_roles_endpoint()
    {
        $response = $this->getJson('/api/v1/roles');
        $response->assertStatus(200)
                 ->assertJsonCount(5);
    }

    public function test_create_order_via_sync()
    {
        $payload = [
            'operations' => [
                [
                    'type' => 'create_order',
                    'client_generated_uuid' => 'test-uuid-1234',
                    'payload' => [
                        'ref' => 'CMD-TEST',
                        'city' => 'Casablanca',
                        'date' => '02 Oct 2026',
                        'total' => 1500.00,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/sync', $payload);
        $response->assertStatus(200)
                 ->assertJsonPath('results.0.status', 'applied');

        $this->assertDatabaseHas('orders', ['ref' => 'CMD-TEST']);
    }
}

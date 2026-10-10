<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Order;
use App\Models\Quote;
use App\Models\DeliverySlip;
use App\Models\CommercialVisit;
use App\Models\Notification;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiV1Test extends TestCase
{
    use RefreshDatabase;

    protected User $staffUser;
    protected Role $adminRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create([
            'code' => 'admin',
            'name' => 'Administrateur',
            'permissions' => ['*'],
        ]);

        $this->staffUser = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.ma',
            'phone' => '+212600000000',
            'password' => bcrypt('secret123'),
            'is_active' => true,
        ]);

        $this->staffUser->roles()->attach($this->adminRole->id, ['is_primary' => true]);
    }

    public function test_auth_login_endpoint()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'admin@test.ma',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    }

    public function test_auth_me_endpoint()
    {
        Sanctum::actingAs($this->staffUser, ['*'], 'staff');

        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(200)
                 ->assertJsonPath('user.email', 'admin@test.ma');
    }

    public function test_roles_endpoint()
    {
        Sanctum::actingAs($this->staffUser, ['*'], 'staff');

        $response = $this->getJson('/api/v1/roles');
        $response->assertStatus(200);
    }

    public function test_create_order_via_sync()
    {
        Sanctum::actingAs($this->staffUser, ['*'], 'staff');

        $payload = [
            'operations' => [
                [
                    'type' => 'create_order',
                    'client_generated_uuid' => 'test-uuid-' . uniqid(),
                    'payload' => [
                        'ref' => 'CMD-TEST-SYNC',
                        'city' => 'Casablanca',
                        'date' => '09 Oct 2026',
                        'total' => 1500.00,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/sync', $payload);
        $response->assertStatus(200)
                 ->assertJsonPath('results.0.status', 'applied');

        $this->assertDatabaseHas('orders', ['ref' => 'CMD-TEST-SYNC']);
    }

    public function test_warehouses_and_quotes_flow()
    {
        Sanctum::actingAs($this->staffUser, ['*'], 'staff');

        $warehouse = Warehouse::create([
            'code' => 'DEP-TEST',
            'name' => 'Dépôt Test Casablanca',
            'city' => 'Casablanca',
        ]);

        $customer = Customer::create([
            'code' => 'CLI-TEST',
            'name' => 'Client Test',
            'city' => 'Casablanca',
            'price_tier' => 'standard',
        ]);

        $product = Product::create([
            'code' => 'PRD-TEST',
            'sku' => 'PRD-TEST',
            'name' => 'Produit Test',
            'price' => 100.00,
        ]);

        // List Warehouses
        $wResponse = $this->getJson('/api/v1/warehouses');
        $wResponse->assertStatus(200);

        // Create Quote
        $quoteResponse = $this->postJson('/api/v1/quotes', [
            'customer_id' => $customer->id,
            'date' => '2026-10-09',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5,
                    'unit_price' => 100.00,
                ]
            ],
        ]);

        $quoteResponse->assertStatus(201)
                      ->assertJsonPath('total_ht', '500.00')
                      ->assertJsonPath('total_ttc', '600.00');

        $quoteId = $quoteResponse->json('id');

        // Convert Quote to Order
        $convertResponse = $this->postJson("/api/v1/quotes/{$quoteId}/convert-to-order");
        $convertResponse->assertStatus(201)
                        ->assertJsonPath('quote.status', 'Converti');
    }

    public function test_notifications_and_visits_endpoints()
    {
        Sanctum::actingAs($this->staffUser, ['*'], 'staff');

        $customer = Customer::create([
            'code' => 'CLI-VISIT',
            'name' => 'Client Visite',
            'city' => 'Rabat',
            'price_tier' => 'standard',
        ]);

        // Notifications
        $notif = Notification::create([
            'type' => 'alert',
            'title' => 'Test Notification',
            'message' => 'Test Message',
            'read' => false,
        ]);

        $nResponse = $this->getJson('/api/v1/notifications');
        $nResponse->assertStatus(200);

        $readResponse = $this->patchJson("/api/v1/notifications/{$notif->id}/read");
        $readResponse->assertStatus(200)
                     ->assertJsonPath('read', true);

        // Commercial Visit
        $visitResponse = $this->postJson('/api/v1/visits', [
            'customer_id' => $customer->id,
            'visit_date' => '2026-10-09',
            'visit_type' => 'prospection',
            'notes' => 'Premier contact commercial',
        ]);

        $visitResponse->assertStatus(201)
                      ->assertJsonPath('status', 'planifiee');
    }
}

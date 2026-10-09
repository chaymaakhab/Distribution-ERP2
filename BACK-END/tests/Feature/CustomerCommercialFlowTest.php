<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerCommercialFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure roles exist
        Role::firstOrCreate(['code' => 'superadmin'], ['name' => 'Super Admin', 'permissions' => ['*']]);
        Role::firstOrCreate(['code' => 'admin'], ['name' => 'Admin', 'permissions' => ['customers.view', 'customers.create', 'customers.update']]);
        Role::firstOrCreate(['code' => 'warehouse'], ['name' => 'Responsable Dépôt', 'permissions' => ['customers.view', 'customers.create', 'customers.update']]);
        Role::firstOrCreate(['code' => 'commercial'], ['name' => 'Commercial', 'permissions' => ['customers.view', 'customers.create', 'customers.update']]);
    }

    public function test_customer_can_self_register_and_choose_commercial()
    {
        // 1. Create a commercial user
        $commercial = User::factory()->create([
            'email' => 'comm_' . uniqid() . '@hercules-erp.ma',
            'commercial_code' => 'COM-991',
            'commission_rate' => 6.50,
        ]);
        $commercialRole = Role::where('code', 'commercial')->first();
        $commercial->roles()->sync([$commercialRole->id => ['is_primary' => true]]);

        // 2. Customer registers choosing this commercial
        $res = $this->postJson('/api/v1/customer/register', [
            'name' => 'Hamza Bennis',
            'company' => 'Bennis Équipements SARL',
            'email' => 'bennis_' . uniqid() . '@example.ma',
            'phone' => '+2126' . rand(10000000, 99999999),
            'password' => 'secret1234',
            'city' => 'Casablanca',
            'commercial_id' => $commercial->id,
        ]);

        $res->assertStatus(201)
            ->assertJsonStructure(['token', 'user', 'home']);

        $customerData = $res->json('user');
        $this->assertEquals('COM-991', $customerData['commercial_reference']);
        $this->assertEquals(6.50, $customerData['commission_percentage']);
        $this->assertEquals($commercial->id, $customerData['commercial']['id']);
    }

    public function test_warehouse_manager_and_superadmin_can_create_client_with_commercial_attribution()
    {
        $commercial = User::factory()->create([
            'email' => 'comm_' . uniqid() . '@hercules-erp.ma',
            'commercial_code' => 'COM-992',
            'commission_rate' => 7.00,
        ]);
        $commercialRole = Role::where('code', 'commercial')->first();
        $commercial->roles()->sync([$commercialRole->id => ['is_primary' => true]]);

        // Warehouse manager (Responsable Dépôt) creates client
        $depotUser = User::factory()->create(['email' => 'depot_' . uniqid() . '@hercules-erp.ma']);
        $warehouseRole = Role::where('code', 'warehouse')->first();
        $depotUser->roles()->sync([$warehouseRole->id => ['is_primary' => true]]);

        $token = $depotUser->createToken('staff')->plainTextToken;

        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/customers', [
                'company' => 'Société Test Dépôt',
                'name' => 'Karim Alami',
                'city' => 'Tanger',
                'phone' => '+2125' . rand(10000000, 99999999),
                'commercial_id' => $commercial->id,
            ]);

        $res->assertStatus(201);
        $this->assertEquals('COM-992', $res->json('commercial_reference'));
        $this->assertEquals(7.00, $res->json('commission_percentage'));
    }

    public function test_commercial_creating_client_automatically_assigns_their_reference_and_percentage()
    {
        $commercial = User::factory()->create([
            'email' => 'comm_' . uniqid() . '@hercules-erp.ma',
            'commercial_code' => 'COM-888',
            'commission_rate' => 8.00,
        ]);
        $commercialRole = Role::where('code', 'commercial')->first();
        $commercial->roles()->sync([$commercialRole->id => ['is_primary' => true]]);

        $token = $commercial->createToken('staff')->plainTextToken;

        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/customers', [
                'company' => 'Client Direct Commercial',
                'city' => 'Rabat',
            ]);

        $res->assertStatus(201);
        $this->assertEquals($commercial->id, $res->json('commercial_id'));
        $this->assertEquals('COM-888', $res->json('commercial_reference'));
        $this->assertEquals(8.00, $res->json('commission_percentage'));
    }

    public function test_superadmin_can_view_commercials_and_their_attached_clients()
    {
        $superadmin = User::factory()->create(['email' => 'sa_' . uniqid() . '@hercules-erp.ma']);
        $saRole = Role::where('code', 'superadmin')->first();
        $superadmin->roles()->sync([$saRole->id => ['is_primary' => true]]);

        $token = $superadmin->createToken('staff')->plainTextToken;

        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/commercials-clients');

        $res->assertStatus(200)
            ->assertJsonStructure([
                'summary' => ['total_commercials', 'total_assigned_clients', 'total_turnover', 'total_commissions'],
                'commercials',
                'unassigned_clients',
            ]);
    }
}

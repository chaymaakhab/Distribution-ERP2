<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\SyncLog;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function sync(Request $request)
    {
        $operations = $request->input('operations', []);
        $results = [];

        foreach ($operations as $op) {
            $uuid = $op['client_generated_uuid'] ?? null;
            if (!$uuid) {
                continue;
            }

            // Check if uuid already processed (Idempotency check)
            $existing = SyncLog::where('client_generated_uuid', $uuid)->first();
            if ($existing) {
                $results[] = [
                    'client_generated_uuid' => $uuid,
                    'status' => 'duplicate',
                    'message' => 'Operation already processed.',
                ];
                continue;
            }

            // Process order operation
            if (($op['type'] ?? '') === 'create_order') {
                $payload = $op['payload'] ?? [];

                // Ensure fallback customer exists
                $customer = Customer::firstOrCreate(
                    ['id' => 1],
                    [
                        'code' => 'CLI-DEMO',
                        'name' => 'Client Démo',
                        'city' => 'Casablanca',
                        'price_tier' => 'standard',
                        'credit_limit' => 50000.00,
                        'status' => 'Actif',
                    ]
                );

                $order = Order::create([
                    'ref' => $payload['ref'] ?? 'CMD-' . rand(1000, 9999),
                    'customer_id' => $customer->id,
                    'city' => $payload['city'] ?? 'Casablanca',
                    'date' => $payload['date'] ?? now()->format('d M Y'),
                    'total' => $payload['total'] ?? 0.00,
                    'status' => 'À valider',
                    'source' => 'Sync Offline',
                    'client_generated_uuid' => $uuid,
                ]);

                SyncLog::create([
                    'client_generated_uuid' => $uuid,
                    'action' => 'create_order',
                    'status' => 'applied',
                    'response_payload' => ['order_id' => $order->id, 'ref' => $order->ref],
                ]);

                $results[] = [
                    'client_generated_uuid' => $uuid,
                    'status' => 'applied',
                    'ref' => $order->ref,
                ];
            }
        }

        return response()->json(['results' => $results]);
    }
}

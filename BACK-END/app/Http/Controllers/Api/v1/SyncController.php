<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\CommercialVisit;
use App\Models\Customer;
use App\Models\DeliveryTourStop;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\SyncLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
                    'response_payload' => $existing->response_payload,
                ];
                continue;
            }

            $type = $op['type'] ?? '';
            $payload = $op['payload'] ?? [];

            // 1. Process create_order
            if ($type === 'create_order') {
                $customer = Customer::firstOrCreate(
                    ['id' => $payload['customer_id'] ?? 1],
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
                    'ref' => $payload['ref'] ?? ('CMD-SYNC-' . rand(1000, 9999)),
                    'customer_id' => $customer->id,
                    'commercial_id' => $request->user()?->id,
                    'warehouse_id' => $request->user()?->warehouse_id,
                    'city' => $payload['city'] ?? $customer->city,
                    'date' => $payload['date'] ?? now()->format('d M Y'),
                    'total' => $payload['total'] ?? 0.00,
                    'status' => $payload['status'] ?? 'À valider',
                    'source' => 'Sync Offline',
                    'client_generated_uuid' => $uuid,
                ]);

                if (!empty($payload['items'])) {
                    foreach ($payload['items'] as $item) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'] ?? 1,
                            'unit_price' => $item['unit_price'] ?? 0.00,
                            'total' => ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0.00),
                        ]);
                    }
                }

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
            // 2. Process record_payment
            elseif ($type === 'record_payment') {
                $payment = Payment::create([
                    'ref' => $payload['ref'] ?? ('PAY-SYNC-' . time()),
                    'receipt_number' => $payload['receipt_number'] ?? ('REC-' . time()),
                    'customer_id' => $payload['customer_id'] ?? 1,
                    'user_id' => $request->user()?->id,
                    'method' => $payload['method'] ?? 'Cash',
                    'amount' => $payload['amount'] ?? 0.00,
                    'bank' => $payload['bank'] ?? null,
                    'doc_number' => $payload['doc_number'] ?? null,
                    'notes' => $payload['notes'] ?? 'Encaissement synchronisé hors-ligne',
                    'status' => 'En caisse',
                ]);

                SyncLog::create([
                    'client_generated_uuid' => $uuid,
                    'action' => 'record_payment',
                    'status' => 'applied',
                    'response_payload' => ['payment_id' => $payment->id, 'ref' => $payment->ref],
                ]);

                $results[] = [
                    'client_generated_uuid' => $uuid,
                    'status' => 'applied',
                    'ref' => $payment->ref,
                ];
            }
            // 3. Process create_visit
            elseif ($type === 'create_visit') {
                $visit = CommercialVisit::create([
                    'ref' => $payload['ref'] ?? ('VIS-' . date('Y') . '-' . rand(1000, 9999)),
                    'commercial_id' => $request->user()?->id ?? 1,
                    'customer_id' => $payload['customer_id'] ?? 1,
                    'visit_date' => $payload['visit_date'] ?? now()->toDateString(),
                    'visit_type' => $payload['visit_type'] ?? 'prospection',
                    'status' => $payload['status'] ?? 'realisee',
                    'notes' => $payload['notes'] ?? null,
                    'amount_collected' => $payload['amount_collected'] ?? 0.00,
                ]);

                SyncLog::create([
                    'client_generated_uuid' => $uuid,
                    'action' => 'create_visit',
                    'status' => 'applied',
                    'response_payload' => ['visit_id' => $visit->id, 'ref' => $visit->ref],
                ]);

                $results[] = [
                    'client_generated_uuid' => $uuid,
                    'status' => 'applied',
                    'ref' => $visit->ref,
                ];
            }
            // 4. Process record_delivery_stop
            elseif ($type === 'record_delivery_stop') {
                if (!empty($payload['stop_id'])) {
                    $stop = DeliveryTourStop::find($payload['stop_id']);
                    if ($stop) {
                        $stop->update([
                            'status' => $payload['status'] ?? 'delivered',
                            'amount_collected' => $payload['amount_collected'] ?? $stop->amount_collected,
                            'payment_method' => $payload['payment_method'] ?? $stop->payment_method,
                            'receiver_name' => $payload['receiver_name'] ?? $stop->receiver_name,
                            'signature' => $payload['signature'] ?? $stop->signature,
                            'delivered_at' => now(),
                        ]);
                    }
                }

                SyncLog::create([
                    'client_generated_uuid' => $uuid,
                    'action' => 'record_delivery_stop',
                    'status' => 'applied',
                    'response_payload' => ['stop_id' => $payload['stop_id'] ?? null],
                ]);

                $results[] = [
                    'client_generated_uuid' => $uuid,
                    'status' => 'applied',
                ];
            }
            else {
                $results[] = [
                    'client_generated_uuid' => $uuid,
                    'status' => 'ignored',
                    'message' => 'Type d\'opération inconnu: ' . $type,
                ];
            }
        }

        return response()->json(['results' => $results]);
    }
}

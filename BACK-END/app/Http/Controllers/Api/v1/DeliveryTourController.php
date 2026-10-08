<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\DeliveryTour;
use App\Models\DeliveryTourStop;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryTourController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DeliveryTour::with([
            'driver',
            'warehouse',
            'stops.customer',
            'stops.order',
        ]);

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->input('driver_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $tour = DeliveryTour::with([
            'driver',
            'warehouse',
            'stops.customer',
            'stops.order.items.product',
        ])->findOrFail($id);

        return response()->json($tour);
    }

    public function updateStop(Request $request, int $tourId, int $stopId): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,in_route,arrived,delivered,partially_delivered,absent,refused',
            'amount_collected' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|in:especes,cheque',
            'cheque_number' => 'nullable|string',
            'cheque_bank' => 'nullable|string',
            'receiver_name' => 'nullable|string',
            'signature' => 'nullable|string',
            'failed_reason' => 'nullable|string',
        ]);

        $stop = DeliveryTourStop::where('delivery_tour_id', $tourId)->findOrFail($stopId);

        return DB::transaction(function () use ($stop, $validated, $tourId) {
            $stop->update([
                'status' => $validated['status'],
                'amount_collected' => $validated['amount_collected'] ?? $stop->amount_collected,
                'payment_method' => $validated['payment_method'] ?? $stop->payment_method,
                'cheque_number' => $validated['cheque_number'] ?? $stop->cheque_number,
                'cheque_bank' => $validated['cheque_bank'] ?? $stop->cheque_bank,
                'receiver_name' => $validated['receiver_name'] ?? $stop->receiver_name,
                'signature' => $validated['signature'] ?? $stop->signature,
                'failed_reason' => $validated['failed_reason'] ?? null,
                'delivered_at' => $validated['status'] === 'delivered' ? now() : $stop->delivered_at,
            ]);

            // If payment was collected at delivery, record payment receipt
            if (!empty($validated['amount_collected']) && $validated['amount_collected'] > 0 && $validated['status'] === 'delivered') {
                Payment::create([
                    'ref' => 'PAY-TOUR-' . $stop->id . '-' . time(),
                    'receipt_number' => 'REC-BL-' . $stop->id . '-' . time(),
                    'customer_id' => $stop->customer_id,
                    'method' => ($validated['payment_method'] ?? 'especes') === 'cheque' ? 'Check' : 'Cash',
                    'bank' => $validated['cheque_bank'] ?? null,
                    'doc_number' => $validated['cheque_number'] ?? null,
                    'amount' => $validated['amount_collected'],
                    'notes' => 'Encaissement livraison tournée chauffeur ' . ($stop->receiver_name ? "Reçu par {$stop->receiver_name}" : ''),
                    'status' => 'En caisse',
                ]);

                // Update order status
                if ($stop->order_id) {
                    Order::where('id', $stop->order_id)->update(['status' => 'Livré']);
                }
            }

            // Recalculate tour statistics
            $tour = DeliveryTour::findOrFail($tourId);
            $completedCount = $tour->stops()->whereIn('status', ['delivered', 'partially_delivered'])->count();
            $totalCollected = $tour->stops()->sum('amount_collected');
            $allDone = $tour->stops()->whereIn('status', ['pending', 'in_route'])->count() === 0;

            $tour->update([
                'completed_stops' => $completedCount,
                'total_amount_collected' => $totalCollected,
                'status' => $allDone ? 'terminee' : 'en_cours',
            ]);

            return response()->json($stop);
        });
    }
}

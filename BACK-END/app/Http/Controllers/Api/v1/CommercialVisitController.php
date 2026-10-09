<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\CommercialVisit;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommercialVisitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CommercialVisit::with(['commercial', 'customer', 'order']);

        if ($request->filled('commercial_id')) {
            $query->where('commercial_id', $request->input('commercial_id'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date')) {
            $query->whereDate('visit_date', $request->input('date'));
        }

        return response()->json($query->orderByDesc('visit_date')->get());
    }

    public function show(int $id): JsonResponse
    {
        $visit = CommercialVisit::with(['commercial', 'customer', 'order'])->findOrFail($id);
        return response()->json($visit);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'nullable|string|unique:commercial_visits,ref',
            'commercial_id' => 'nullable|exists:users,id',
            'customer_id' => 'required|exists:customers,id',
            'visit_date' => 'required|date',
            'visit_type' => 'nullable|string|in:prospection,prise_commande,recouvrement,fidelisation,litige',
            'notes' => 'nullable|string',
            'next_action' => 'nullable|string',
            'next_visit_date' => 'nullable|date',
        ]);

        $ref = $validated['ref'] ?? ('VIS-' . date('Y') . '-' . str_pad((string) (CommercialVisit::count() + 1), 3, '0', STR_PAD_LEFT));

        $visit = CommercialVisit::create([
            'ref' => $ref,
            'commercial_id' => $validated['commercial_id'] ?? $request->user()?->id,
            'customer_id' => $validated['customer_id'],
            'visit_date' => $validated['visit_date'],
            'visit_type' => $validated['visit_type'] ?? 'prospection',
            'status' => 'planifiee',
            'notes' => $validated['notes'] ?? null,
            'next_action' => $validated['next_action'] ?? null,
            'next_visit_date' => $validated['next_visit_date'] ?? null,
        ]);

        return response()->json($visit->load(['commercial', 'customer']), 201);
    }

    public function checkin(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $visit = CommercialVisit::findOrFail($id);
        $visit->update([
            'checkin_lat' => $validated['latitude'],
            'checkin_lng' => $validated['longitude'],
            'checkin_time' => now(),
            'status' => 'en_cours',
        ]);

        return response()->json($visit);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
            'amount_collected' => 'nullable|numeric|min:0',
            'order_id' => 'nullable|exists:orders,id',
            'next_action' => 'nullable|string',
            'next_visit_date' => 'nullable|date',
        ]);

        $visit = CommercialVisit::findOrFail($id);

        return DB::transaction(function () use ($visit, $validated, $request) {
            $visit->update([
                'notes' => $validated['notes'] ?? $visit->notes,
                'amount_collected' => $validated['amount_collected'] ?? 0.00,
                'order_id' => $validated['order_id'] ?? $visit->order_id,
                'next_action' => $validated['next_action'] ?? null,
                'next_visit_date' => $validated['next_visit_date'] ?? null,
                'checkout_time' => now(),
                'status' => 'realisee',
            ]);

            // If cash was collected during visit, record payment
            if (!empty($validated['amount_collected']) && $validated['amount_collected'] > 0) {
                Payment::create([
                    'ref' => 'PAY-VISIT-' . $visit->id . '-' . time(),
                    'receipt_number' => 'REC-VISIT-' . $visit->id . '-' . time(),
                    'customer_id' => $visit->customer_id,
                    'user_id' => $request->user()?->id,
                    'method' => 'Cash',
                    'amount' => $validated['amount_collected'],
                    'notes' => 'Encaissement sur visite terrain ' . $visit->ref,
                    'status' => 'En caisse',
                ]);
            }

            return response()->json($visit->load(['commercial', 'customer', 'order']));
        });
    }
}

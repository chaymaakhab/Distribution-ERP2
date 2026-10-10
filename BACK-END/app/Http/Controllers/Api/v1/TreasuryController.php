<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\CashClosing;
use App\Models\ChequeInHand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TreasuryController extends Controller
{
    public function closings(Request $request): JsonResponse
    {
        $query = CashClosing::with(['warehouse', 'closedBy', 'validatedBy']);

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function storeClosing(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'cash_theoretical' => 'required|numeric|min:0',
            'cash_counted' => 'required|numeric|min:0',
            'cash_difference' => 'required|numeric',
            'cheques_count' => 'required|integer|min:0',
            'cheques_total' => 'required|numeric|min:0',
            'effects_count' => 'nullable|integer|min:0',
            'effects_total' => 'nullable|numeric|min:0',
            'total_collected' => 'required|numeric|min:0',
            'justification_notes' => 'nullable|string',
        ]);

        $closing = CashClosing::create([
            'ref' => 'CLT-' . date('Y') . '-' . str_pad((string) (CashClosing::count() + 1), 4, '0', STR_PAD_LEFT),
            'warehouse_id' => $validated['warehouse_id'],
            'closed_by_user_id' => $request->user()->id,
            'closing_date' => now()->toDateString(),
            'cash_theoretical' => $validated['cash_theoretical'],
            'cash_counted' => $validated['cash_counted'],
            'cash_difference' => $validated['cash_difference'],
            'cheques_count' => $validated['cheques_count'],
            'cheques_total' => $validated['cheques_total'],
            'effects_count' => $validated['effects_count'] ?? 0,
            'effects_total' => $validated['effects_total'] ?? 0.00,
            'total_collected' => $validated['total_collected'],
            'status' => 'valide_depot',
            'justification_notes' => $validated['justification_notes'] ?? null,
            'validated_by_user_id' => $request->user()->id,
            'validated_at' => now(),
        ]);

        return response()->json($closing->load(['warehouse', 'closedBy']), 201);
    }

    public function cheques(Request $request): JsonResponse
    {
        $query = ChequeInHand::with(['customer', 'warehouse', 'payment']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('doc_type')) {
            $query->where('doc_type', $request->input('doc_type'));
        }

        return response()->json($query->orderBy('due_date')->get());
    }

    public function updateChequeStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:en_portefeuille,remis_en_banque,encaisse,impaye',
            'remittance_ref' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $cheque = ChequeInHand::findOrFail($id);
        $cheque->update([
            'status' => $validated['status'],
            'remittance_ref' => $validated['remittance_ref'] ?? $cheque->remittance_ref,
            'deposit_date' => $validated['status'] === 'remis_en_banque' ? now() : $cheque->deposit_date,
            'cleared_date' => $validated['status'] === 'encaisse' ? now() : $cheque->cleared_date,
            'notes' => $validated['notes'] ?? $cheque->notes,
        ]);

        return response()->json($cheque);
    }
}

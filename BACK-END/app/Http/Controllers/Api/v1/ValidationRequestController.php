<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\ValidationRequest;
use Illuminate\Http\Request;

class ValidationRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = ValidationRequest::query();

        if ($request->has('company_id')) {
            $query->where('company_id', $request->query('company_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->query('priority'));
        }

        if ($request->has('op_type')) {
            $query->where('op_type', $request->query('op_type'));
        }

        $items = $query->orderByRaw("FIELD(priority, 'urgente', 'haute', 'normale', 'basse')")
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $items,
            'counts' => [
                'total' => $items->count(),
                'pending' => $items->where('status', 'en_attente')->count(),
                'urgent' => $items->where('priority', 'urgente')->where('status', 'en_attente')->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'op_type' => 'required|string',
            'priority' => 'nullable|string',
            'order_ref' => 'nullable|string',
            'client_name' => 'nullable|string',
            'depot_name' => 'nullable|string',
            'requester_name' => 'nullable|string',
            'requester_role' => 'nullable|string',
            'product_name' => 'nullable|string',
            'qty' => 'nullable|numeric',
            'amount' => 'nullable|numeric',
            'motif' => 'nullable|string',
            'notes' => 'nullable|string',
            'company_id' => 'nullable|integer',
        ]);

        $refPrefix = match ($validated['op_type']) {
            'retour' => 'RET',
            'derogation_credit' => 'DER',
            'remise_exceptionnelle' => 'REM',
            default => 'VAL',
        };

        $validated['ref'] = $refPrefix . '-' . date('Y') . '-' . str_pad((string)(ValidationRequest::count() + 1), 3, '0', STR_PAD_LEFT);
        $validated['status'] = 'en_attente';

        $item = ValidationRequest::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Demande de validation créée avec succès',
            'data' => $item,
        ], 201);
    }

    public function arbitrate(Request $request, $id)
    {
        $item = ValidationRequest::findOrFail($id);

        $validated = $request->validate([
            'decision_action' => 'required|string',
            'decision_motif' => 'required|string',
            'arbitrated_by' => 'nullable|string',
            'approved' => 'nullable|boolean',
        ]);

        $item->update([
            'status' => ($validated['approved'] ?? true) ? 'valide' : 'rejete',
            'decision_action' => $validated['decision_action'],
            'decision_motif' => $validated['decision_motif'],
            'arbitrated_by' => $validated['arbitrated_by'] ?? ($request->user() ? $request->user()->name : 'Super Administrateur'),
            'arbitrated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Demande arbitrée avec succès',
            'data' => $item,
        ]);
    }
}

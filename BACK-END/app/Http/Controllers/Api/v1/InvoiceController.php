<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\CreditNote;
use App\Models\CreditNoteItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['customer', 'order', 'items.product', 'creditNotes']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('ref', 'like', "%{$q}%")
                    ->orWhereHas('customer', function ($c) use ($q) {
                        $c->where('name', 'like', "%{$q}%")
                          ->orWhere('company', 'like', "%{$q}%")
                          ->orWhere('ice', 'like', "%{$q}%");
                    });
            });
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::with(['customer', 'order', 'items.product', 'creditNotes.items.product'])->findOrFail($id);
        return response()->json($invoice);
    }

    public function creditNotes(Request $request): JsonResponse
    {
        $query = CreditNote::with(['customer', 'invoice', 'items.product', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function storeCreditNote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'required|string|unique:credit_notes,ref',
            'invoice_id' => 'nullable|exists:invoices,id',
            'return_id' => 'nullable|exists:returns,id',
            'customer_id' => 'required|exists:customers,id',
            'date_issued' => 'required|date',
            'reason' => 'required|string',
            'total_ht' => 'required|numeric|min:0',
            'tva_rate' => 'nullable|numeric',
            'total_ttc' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $creditNote = CreditNote::create([
                'ref' => $validated['ref'],
                'invoice_id' => $validated['invoice_id'] ?? null,
                'return_id' => $validated['return_id'] ?? null,
                'customer_id' => $validated['customer_id'],
                'user_id' => $request->user()?->id,
                'date_issued' => $validated['date_issued'],
                'reason' => $validated['reason'],
                'total_ht' => $validated['total_ht'],
                'tva_rate' => $validated['tva_rate'] ?? 20.00,
                'total_ttc' => $validated['total_ttc'],
                'status' => 'Émis',
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    CreditNoteItem::create([
                        'credit_note_id' => $creditNote->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total' => $item['quantity'] * $item['unit_price'],
                    ]);
                }
            }

            return response()->json($creditNote->load(['customer', 'invoice', 'items.product']), 201);
        });
    }
}

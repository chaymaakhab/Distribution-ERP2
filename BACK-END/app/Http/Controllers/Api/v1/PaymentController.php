<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['customer:id,code,name,company,ice,city', 'user:id,name'])
            ->orderBy('id', 'desc');

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->query('customer_id'));
        }

        if ($request->filled('method') && $request->query('method') !== 'all') {
            $query->where('method', $request->query('method'));
        }

        $payments = $query->paginate(50);

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric|min:1',
            'method' => 'required|string', // Chèque bancaire, Virement bancaire, Espèces, Traite / Effet
            'bank' => 'nullable|string',
            'doc_number' => 'nullable|string',
            'due_date' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $customer = Customer::findOrFail($validated['customer_id']);

            $previousBalance = (float) $customer->current_balance;
            $amount = (float) $validated['amount'];
            $newBalance = max(0, $previousBalance - $amount);
            $newOverdue = max(0, (float) $customer->overdue_amount - $amount);

            $nextCount = Payment::count() + 892;
            $receiptNumber = 'REC-2026-' . str_pad($nextCount, 4, '0', STR_PAD_LEFT);
            $ref = 'PAY-' . date('Y') . '-' . str_pad($nextCount, 4, '0', STR_PAD_LEFT);

            $payment = Payment::create([
                'ref' => $ref,
                'receipt_number' => $receiptNumber,
                'customer_id' => $customer->id,
                'method' => $validated['method'],
                'bank' => $validated['bank'] ?? null,
                'doc_number' => $validated['doc_number'] ?? null,
                'due_date' => $validated['due_date'] ?? null,
                'amount' => $amount,
                'previous_balance' => $previousBalance,
                'new_balance' => $newBalance,
                'user_id' => $request->user()?->id,
                'notes' => $validated['notes'] ?? null,
                'status' => 'Encaissé',
            ]);

            // Update customer balance & unblock if debt resolved
            $newStatus = $customer->status;
            if ($customer->status === 'Bloqué' && $newOverdue == 0 && $newBalance <= $customer->credit_limit) {
                $newStatus = 'Actif';
            }

            $customer->update([
                'current_balance' => $newBalance,
                'overdue_amount' => $newOverdue,
                'status' => $newStatus,
            ]);

            $payment->load(['customer:id,code,name,company,ice,city', 'user:id,name']);

            return response()->json([
                'message' => 'Règlement client enregistré et quittance générée avec succès',
                'payment' => $payment,
                'customer' => $customer,
            ], 201);
        });
    }
}

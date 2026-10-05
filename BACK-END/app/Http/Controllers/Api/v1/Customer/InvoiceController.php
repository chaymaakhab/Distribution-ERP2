<?php

namespace App\Http\Controllers\Api\v1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $invoices = $customer->invoices()->orderByDesc('due_date')->get();

        return response()->json([
            'data' => $invoices->map(fn ($i) => $this->present($i))->values(),
        ]);
    }

    public function show(Request $request, string $ref)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $invoice = $customer->invoices()->with('order.items.product')->where('ref', $ref)->firstOrFail();

        $data = $this->present($invoice);
        $data['items'] = $invoice->order
            ? $invoice->order->items->map(fn ($item) => [
                'name' => $item->product?->name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ])->values()
            : [];

        return response()->json(['data' => $data]);
    }

    private function present(Invoice $invoice): array
    {
        return [
            'ref' => $invoice->ref,
            'order_ref' => $invoice->order?->ref,
            'total_ttc' => (float) $invoice->total_ttc,
            'paid_amount' => (float) $invoice->paid_amount,
            'remaining' => round((float) $invoice->total_ttc - (float) $invoice->paid_amount, 2),
            'status' => $invoice->status,
            'due_date' => $invoice->due_date,
        ];
    }
}

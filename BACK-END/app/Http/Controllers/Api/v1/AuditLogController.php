<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user');

        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->input('action') . '%');
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('action', 'like', "%{$q}%")
                    ->orWhere('ip_address', 'like', "%{$q}%")
                    ->orWhereHas('user', function ($uQuery) use ($q) {
                        $uQuery->where('name', 'like', "%{$q}%")
                               ->orWhere('email', 'like', "%{$q}%");
                    });
            });
        }

        $logs = $query->orderByDesc('id')->paginate(50);

        return response()->json($logs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|string',
            'properties' => 'nullable|array',
            'ip_address' => 'nullable|string',
        ]);

        $log = AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $validated['action'],
            'properties' => $validated['properties'] ?? null,
            'ip_address' => $validated['ip_address'] ?? $request->ip(),
        ]);

        return response()->json($log, 201);
    }
}

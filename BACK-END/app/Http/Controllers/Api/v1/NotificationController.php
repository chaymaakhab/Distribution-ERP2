<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;

        $notifications = Notification::where(function ($q) use ($userId) {
            $q->whereNull('user_id')
              ->orWhere('user_id', $userId);
        })
        ->orderByDesc('id')
        ->limit(50)
        ->get();

        $unreadCount = $notifications->where('read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(int $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['read' => true]);

        return response()->json($notification);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;

        Notification::where(function ($q) use ($userId) {
            $q->whereNull('user_id')
              ->orWhere('user_id', $userId);
        })->update(['read' => true]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:alert,operation,financial,delivery',
            'title' => 'required|string',
            'message' => 'required|string',
            'segment' => 'nullable|string',
            'link' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $notification = Notification::create([
            'user_id' => $validated['user_id'] ?? null,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'message' => $validated['message'],
            'segment' => $validated['segment'] ?? 'general',
            'link' => $validated['link'] ?? null,
            'read' => false,
        ]);

        return response()->json($notification, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }
}

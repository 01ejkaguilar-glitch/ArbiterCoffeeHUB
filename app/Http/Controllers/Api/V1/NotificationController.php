<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AdminMessageNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Send an admin notification to selected users.
     */
    public function sendNotification(Request $request): JsonResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        if (!$admin || !$admin->hasAnyRole(['admin', 'super-admin'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'type' => 'sometimes|string|max:50',
            'action_label' => 'nullable|string|max:100',
            'action_url' => 'nullable|string|max:500',
        ]);

        $users = User::whereIn('id', $validated['user_ids'])->get();
        $notification = new AdminMessageNotification(
            $validated['title'],
            $validated['message'],
            $validated['type'] ?? 'info',
            ['sent_by' => $admin->id],
            ($validated['action_label'] ?? null) && ($validated['action_url'] ?? null)
                ? ['label' => $validated['action_label'], 'url' => $validated['action_url']]
                : null
        );

        foreach ($users as $recipient) {
            /** @var User $recipient */
            $recipient->notify($notification);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification sent successfully',
            'data' => [
                'recipient_count' => $users->count(),
            ],
        ]);
    }

    /**
     * Get VAPID public key for push notifications
     */
    public function getVapidKey(): JsonResponse
    {
        try {
            $vapidPublicKey = config('services.vapid.public_key') ?? env('VAPID_PUBLIC_KEY');

            if (!$vapidPublicKey) {
                return response()->json([
                    'error' => 'VAPID public key not configured'
                ], 500);
            }

            return response()->json([
                'publicKey' => $vapidPublicKey
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve VAPID key'
            ], 500);
        }
    }

    /**
     * Get all notifications for the authenticated user.
     * Uses Laravel's built-in database notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get()
            ->map(fn($n) => [
                'id'        => $n->id,
                'title'     => $n->data['title'] ?? 'Notification',
                'message'   => $n->data['message'] ?? '',
                'type'      => $n->data['type'] ?? 'info',
                'data'      => $n->data['data'] ?? [],
                'action'    => $n->data['action'] ?? null,
                'read'      => !is_null($n->read_at),
                'createdAt' => $n->created_at->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'data'    => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Update a stored notification payload.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'message' => 'sometimes|string|max:2000',
            'type' => 'sometimes|string|max:50',
            'data' => 'sometimes|array',
            'action_label' => 'nullable|string|max:100',
            'action_url' => 'nullable|string|max:500',
            'read' => 'sometimes|boolean',
        ]);

        $payload = $notification->data;

        if (array_key_exists('title', $validated)) {
            $payload['title'] = $validated['title'];
        }
        if (array_key_exists('message', $validated)) {
            $payload['message'] = $validated['message'];
        }
        if (array_key_exists('type', $validated)) {
            $payload['type'] = $validated['type'];
        }
        if (array_key_exists('data', $validated)) {
            $payload['data'] = $validated['data'];
        }

        if (array_key_exists('action_label', $validated) || array_key_exists('action_url', $validated)) {
            $actionLabel = $validated['action_label'] ?? ($payload['action']['label'] ?? null);
            $actionUrl = $validated['action_url'] ?? ($payload['action']['url'] ?? null);

            $payload['action'] = ($actionLabel && $actionUrl)
                ? ['label' => $actionLabel, 'url' => $actionUrl]
                : null;
        }

        $notification->data = $payload;

        if (array_key_exists('read', $validated)) {
            $notification->read_at = $validated['read'] ? now() : null;
        }

        $notification->save();

        return response()->json([
            'success' => true,
            'message' => 'Notification updated successfully',
            'data' => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'type' => $notification->data['type'] ?? 'info',
                'data' => $notification->data['data'] ?? [],
                'action' => $notification->data['action'] ?? null,
                'read' => !is_null($notification->read_at),
                'createdAt' => $notification->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Delete a single notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $deleted = $request->user()
            ->notifications()
            ->where('id', $id)
            ->delete();

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Clear all notifications.
     */
    public function clearAll(Request $request): JsonResponse
    {
        $request->user()->notifications()->delete();

        return response()->json(['success' => true]);
    }
}
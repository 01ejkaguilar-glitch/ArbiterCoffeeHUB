<?php

namespace App\Jobs;

use App\Models\Order;
use App\Notifications\OrderStatusNotification;
use Illuminate\Support\Facades\Log;

/**
 * Process order notifications (email + database logging) with exponential backoff retry.
 */
class ProcessOrderNotification extends BaseJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $order;
    public $notificationType;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order, $notificationType = 'created')
    {
        $this->order = $order;
        $this->notificationType = $notificationType;
    }

    /**
     * Execute the job logic.
     */
    protected function handleJob(): void
    {
        $order = $this->order->load(['user', 'orderItems.product']);

        // Log the notification
        Log::channel('orders')->info("Order notification sent", [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'type' => $this->notificationType,
            'customer' => $order->user->email,
        ]);

        // Send notification (writes to database + sends email)
        $notifType = match ($this->notificationType) {
            'created'   => 'order_created',
            'ready'     => 'order_ready',
            'completed' => 'order_completed',
            'cancelled' => 'order_cancelled',
            default     => 'status_update',
        };
        $order->user->notify(new OrderStatusNotification($order, $notifType));
    }

    /**
     * Handle a job failure (called after max attempts exceeded).
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Order notification job failed permanently", [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

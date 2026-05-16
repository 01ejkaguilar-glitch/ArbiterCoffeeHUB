<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Order;

class OrderPolicy
{
    /**
     * Determine if the user can view the order
     */
    public function view(User $user, Order $order): bool
    {
        // Customer can only view their own orders
        if ($user->hasRole('customer')) {
            return $user->id === $order->user_id;
        }

        // Admin, barista, kitchen staff, and managers can view all orders
        return $user->hasAnyRole(['admin', 'super-admin', 'barista', 'kitchen-staff', 'workforce-manager']);
    }

    /**
     * Determine if the user can update the order
     */
    public function update(User $user, Order $order): bool
    {
        // Only customer can update their own order, and only if pending
        if ($user->hasRole('customer')) {
            return $user->id === $order->user_id && in_array($order->status, ['pending', 'preparing']);
        }

        // Admin can update status and details
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can cancel the order
     */
    public function cancel(User $user, Order $order): bool
    {
        // Customer can cancel their own pending/preparing orders
        if ($user->hasRole('customer')) {
            return $user->id === $order->user_id && in_array($order->status, ['pending', 'preparing']);
        }

        // Admin can cancel any order
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can delete the order (soft delete)
     */
    public function delete(User $user, Order $order): bool
    {
        // Only admin can delete/archive orders
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can restore the order
     */
    public function restore(User $user, Order $order): bool
    {
        // Only admin can restore deleted orders
        return $user->hasAnyRole(['admin', 'super-admin']);
    }
}

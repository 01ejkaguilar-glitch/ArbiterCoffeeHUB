<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Payment;

class PaymentPolicy
{
    /**
     * Determine if the user can view payment records
     */
    public function viewAny(User $user): bool
    {
        // Customers can view their own payments
        // Admins can view all payments
        return $user->hasAnyRole(['customer', 'admin', 'super-admin']);
    }

    /**
     * Determine if the user can view a specific payment
     */
    public function view(User $user, Payment $payment): bool
    {
        // Customer can only view their own order's payment
        if ($user->hasRole('customer')) {
            return $user->id === $payment->order->user_id;
        }

        // Admin can view all payments
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can create payments
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['customer', 'admin', 'super-admin']);
    }

    /**
     * Determine if the user can refund a payment
     */
    public function refund(User $user, Payment $payment): bool
    {
        // Only admins can process refunds
        return $user->hasAnyRole(['admin', 'super-admin']);
    }
}

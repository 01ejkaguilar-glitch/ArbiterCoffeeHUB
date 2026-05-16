<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Address;

class AddressPolicy
{
    /**
     * Determine if the user can view addresses
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view their own addresses
        return true;
    }

    /**
     * Determine if the user can view a specific address
     */
    public function view(User $user, Address $address): bool
    {
        // Users can only view their own addresses
        if ($user->hasRole('customer')) {
            return $user->id === $address->user_id;
        }

        // Admins can view all addresses
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can create addresses
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['customer']);
    }

    /**
     * Determine if the user can update a specific address
     */
    public function update(User $user, Address $address): bool
    {
        // Users can update their own addresses
        if ($user->hasRole('customer')) {
            return $user->id === $address->user_id;
        }

        // Admins can update any address
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can delete a specific address
     */
    public function delete(User $user, Address $address): bool
    {
        // Users can delete their own addresses
        if ($user->hasRole('customer')) {
            return $user->id === $address->user_id;
        }

        // Admins can delete any address
        return $user->hasAnyRole(['admin', 'super-admin']);
    }
}

<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view users
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super-admin', 'workforce-manager']);
    }

    /**
     * Determine if the user can view a specific user
     */
    public function view(User $user, User $model): bool
    {
        // Users can view their own profile
        if ($user->id === $model->id) {
            return true;
        }

        // Admins can view all users
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can create users
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can update a user
     */
    public function update(User $user, User $model): bool
    {
        // Users can update their own profile
        if ($user->id === $model->id) {
            return true;
        }

        // Admins can update any user
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can delete a user
     */
    public function delete(User $user, User $model): bool
    {
        // Users cannot delete themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Only admins can delete users
        return $user->hasAnyRole(['admin', 'super-admin']);
    }
}

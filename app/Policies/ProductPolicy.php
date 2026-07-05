<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Product;

class ProductPolicy
{
    /**
     * Determine if the user can create products.
     */
    public function create(?User $user)
    {
        return $user !== null && $user->hasRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can update the product.
     */
    public function update(?User $user, Product $product)
    {
        return $user !== null && $user->hasRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can delete the product.
     */
    public function delete(?User $user, Product $product)
    {
        return $user !== null && $user->hasRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can view the product.
     */
    public function view(?User $user, Product $product)
    {
        return true; // Or implement your own logic
    }
}
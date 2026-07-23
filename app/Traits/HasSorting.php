<?php

namespace App\Traits;

trait HasSorting
{
    /**
     * Apply sorting to a query builder with whitelist validation.
     */
    public function applySorting($query, $request, array $allowedColumns = ['id', 'name', 'price', 'created_at', 'updated_at']): void
    {
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validate sort columns to prevent injection
        if (!in_array($sortBy, $allowedColumns)) {
            $sortBy = 'created_at';
        }

        // Validate sort direction to prevent injection
        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);
    }
}
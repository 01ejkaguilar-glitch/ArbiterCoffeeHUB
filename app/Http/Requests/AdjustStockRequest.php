<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:restock,usage,wastage,adjustment',
            'quantity' => 'required|numeric',
            'notes' => 'sometimes|nullable|string|max:500',
        ];
    }
}

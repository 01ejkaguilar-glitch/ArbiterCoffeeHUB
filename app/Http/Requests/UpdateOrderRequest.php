<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'items' => 'nullable|array|min:1|max:50',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1|max:99',
            'items.*.special_instructions' => 'nullable|string|max:500',
            'delivery_address_id' => 'nullable|exists:addresses,id',
            'pickup_time' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'nullable|in:cash,gcash,maya,card',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'items.*.product_id.required_with' => 'Product ID is required for each item.',
            'items.*.product_id.exists' => 'Selected product does not exist.',
            'items.*.quantity.min' => 'Quantity must be at least 1.',
            'items.*.quantity.max' => 'Quantity cannot exceed 99.',
        ];
    }
}

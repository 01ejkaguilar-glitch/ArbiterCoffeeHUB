<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|in:home,work,other',
            'street' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:100',
            'province' => 'sometimes|string|max:100',
            'postal_code' => 'sometimes|string|max:10',
            'is_default' => 'sometimes|boolean',
        ];
    }
}

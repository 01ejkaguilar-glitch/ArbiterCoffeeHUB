<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'birthday' => 'sometimes|nullable|date',
            'address' => 'sometimes|nullable|string|max:500',
            'taste_preferences' => 'sometimes|nullable|array',
        ];
    }
}

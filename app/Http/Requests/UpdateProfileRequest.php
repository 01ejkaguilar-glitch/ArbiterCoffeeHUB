<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
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

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Name must be a string.',
            'name.max' => 'Name cannot exceed 255 characters.',
            'phone.string' => 'Phone must be a string.',
            'phone.max' => 'Phone cannot exceed 20 characters.',
            'birthday.date' => 'Birthday must be a valid date.',
            'address.string' => 'Address must be a string.',
            'address.max' => 'Address cannot exceed 500 characters.',
            'taste_preferences.array' => 'Taste preferences must be an array.',
        ];
    }
}
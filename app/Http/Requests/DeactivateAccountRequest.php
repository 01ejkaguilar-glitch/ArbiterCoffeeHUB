<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeactivateAccountRequest extends FormRequest
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
            'reason' => 'sometimes|string|max:500',
            'password' => 'required|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reason.string' => 'Reason must be a string.',
            'reason.max' => 'Reason cannot exceed 500 characters.',
            'password.required' => 'Password is required to deactivate account.',
        ];
    }
}
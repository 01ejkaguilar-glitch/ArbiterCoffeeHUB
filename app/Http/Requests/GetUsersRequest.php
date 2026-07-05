<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetUsersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'super-admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:active,inactive',
            'role' => 'sometimes|string|in:customer,barista,manager,admin,super-admin',
            'search' => 'sometimes|string|max:255',
            'sort_by' => 'sometimes|string|in:id,name,email,created_at,updated_at',
            'sort_order' => 'sometimes|in:asc,desc',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ];
    }
}
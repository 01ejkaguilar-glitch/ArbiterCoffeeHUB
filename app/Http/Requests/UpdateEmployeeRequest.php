<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $this->route('id'),
            'phone' => 'sometimes|nullable|string|max:20',
            'password' => 'sometimes|string|min:8',
            'position' => 'sometimes|string|max:100',
            'department' => 'sometimes|nullable|string|max:100',
            'hire_date' => 'sometimes|nullable|date',
            'salary' => 'sometimes|nullable|numeric|min:0',
            'status' => 'sometimes|in:active,on_leave,suspended,terminated,inactive',
            'emergency_contact_name' => 'sometimes|nullable|string|max:255',
            'emergency_contact_phone' => 'sometimes|nullable|string|max:20',
        ];
    }
}

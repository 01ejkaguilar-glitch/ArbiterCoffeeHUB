<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'sometimes|exists:employees,id',
            'date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'position' => 'nullable|string|max:100',
            'status' => 'in:scheduled,confirmed,completed,cancelled',
            'notes' => 'nullable|string|max:500',
        ];
    }
}

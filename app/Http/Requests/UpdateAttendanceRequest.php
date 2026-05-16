<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:present,absent,late,half_day,on_leave',
            'clock_in' => 'sometimes|nullable|date_format:H:i',
            'clock_out' => 'sometimes|nullable|date_format:H:i|after:clock_in',
            'notes' => 'sometimes|nullable|string|max:500',
        ];
    }
}

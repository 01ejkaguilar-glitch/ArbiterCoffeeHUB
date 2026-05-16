<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetReportRequest extends FormRequest
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
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'employee_id' => 'nullable|exists:employees,id',
            'type' => 'nullable|in:leave,overtime,both',
            'report_type' => 'nullable|in:attendance,leave_ot,task_completion,bean_usage',
            'format' => 'nullable|in:csv,pdf',
        ];
    }
}

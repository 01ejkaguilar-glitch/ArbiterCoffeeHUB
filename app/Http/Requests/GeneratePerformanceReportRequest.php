<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePerformanceReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employees,id',
            'report_type' => 'required|in:summary,detailed,comparison',
            'format' => 'nullable|in:json,pdf,csv',
        ];
    }
}

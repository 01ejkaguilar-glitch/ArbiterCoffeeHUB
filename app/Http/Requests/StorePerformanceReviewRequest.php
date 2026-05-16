<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'review_period_start' => 'required|date',
            'review_period_end' => 'required|date|after_or_equal:review_period_start',
            'speed_score' => 'required|numeric|min:0|max:5',
            'quality_score' => 'required|numeric|min:0|max:5',
            'attendance_score' => 'required|numeric|min:0|max:5',
            'teamwork_score' => 'required|numeric|min:0|max:5',
            'customer_service_score' => 'required|numeric|min:0|max:5',
            'strengths' => 'nullable|string|max:2000',
            'areas_for_improvement' => 'nullable|string|max:2000',
            'goals' => 'nullable|string|max:2000',
            'comments' => 'nullable|string|max:2000',
        ];
    }
}

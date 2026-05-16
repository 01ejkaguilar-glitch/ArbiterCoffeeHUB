<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerformanceReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'speed_score' => 'nullable|numeric|min:0|max:5',
            'quality_score' => 'nullable|numeric|min:0|max:5',
            'attendance_score' => 'nullable|numeric|min:0|max:5',
            'teamwork_score' => 'nullable|numeric|min:0|max:5',
            'customer_service_score' => 'nullable|numeric|min:0|max:5',
            'strengths' => 'nullable|string|max:2000',
            'areas_for_improvement' => 'nullable|string|max:2000',
            'goals' => 'nullable|string|max:2000',
            'comments' => 'nullable|string|max:2000',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class GetAnalyticsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $maxDate = now()->toDateString();
        $minDate = now()->subYears(2)->toDateString();

        return [
            'start_date' => 'sometimes|date|before_or_equal:end_date|after:' . $minDate,
            'end_date' => 'sometimes|date|after_or_equal:start_date|before_or_equal:' . $maxDate,
            'limit' => 'sometimes|integer|min:1|max:1000',
            'offset' => 'sometimes|integer|min:0',
            'employee_id' => 'sometimes|exists:employees,id',
            'product_id' => 'sometimes|exists:products,id',
            'category_id' => 'sometimes|exists:categories,id',
            'status' => 'sometimes|in:pending,preparing,ready,completed,cancelled',
            'order_type' => 'sometimes|in:dine-in,take-out,delivery',
            'payment_method' => 'sometimes|in:cash,gcash,maya,card',
            'min_amount' => 'sometimes|numeric|min:0',
            'max_amount' => 'sometimes|numeric|min:0',
            'segment' => 'sometimes|in:vip,regular,occasional,at_risk,churned',
            'metric' => 'sometimes|string|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'start_date.before_or_equal' => 'Start date must be before or equal to end date.',
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'start_date.after' => 'Start date must be within the last 2 years.',
            'end_date.before_or_equal' => 'End date cannot be in the future.',
            'limit.max' => 'Limit cannot exceed 1000.',
            'employee_id.exists' => 'Selected employee does not exist.',
            'product_id.exists' => 'Selected product does not exist.',
            'category_id.exists' => 'Selected category does not exist.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Parse date strings to Carbon instances for easier use
        if ($this->has('start_date')) {
            $this->merge([
                'start_date' => Carbon::parse($this->input('start_date'))->startOfDay(),
            ]);
        }

        if ($this->has('end_date')) {
            $this->merge([
                'end_date' => Carbon::parse($this->input('end_date'))->endOfDay(),
            ]);
        }

        // Provide sensible defaults if not provided
        if (!$this->has('start_date') && !$this->has('end_date')) {
            $this->merge([
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->endOfMonth(),
            ]);
        }
    }
}

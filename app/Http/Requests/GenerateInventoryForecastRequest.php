<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateInventoryForecastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'item_id' => 'required|exists:inventory_items,id',
            'forecast_days' => 'nullable|integer|min:1|max:90',
            'method' => 'nullable|in:simple_average,weighted_average,linear_regression',
        ];
    }
}

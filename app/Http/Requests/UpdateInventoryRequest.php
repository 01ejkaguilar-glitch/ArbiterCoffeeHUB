<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|nullable|string|max:100',
            'source' => 'sometimes|nullable|in:Wet Market,Online',
            'type' => 'sometimes|in:bar,kitchen,baking,deli,packaging,cleaning,stationery',
            'unit' => 'sometimes|string|max:50',
            'reorder_level' => 'sometimes|numeric|min:0',
            'cost_per_unit' => 'sometimes|nullable|numeric|min:0',
        ];
    }
}

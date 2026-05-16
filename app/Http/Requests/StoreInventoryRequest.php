<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'source' => 'nullable|in:Wet Market,Online',
            'type' => 'required|in:bar,kitchen,baking,deli,packaging,cleaning,stationery',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'reorder_level' => 'required|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
        ];
    }
}

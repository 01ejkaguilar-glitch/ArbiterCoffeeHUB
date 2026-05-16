<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTimelineEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['admin', 'manager', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'year' => 'required|integer|min:1900|max:2100',
            'title' => 'required|string|max:120',
            'description' => 'required|string|max:500',
            'image_url' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
        ];
    }
}

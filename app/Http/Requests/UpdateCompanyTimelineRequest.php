<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyTimelineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['admin', 'manager', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'timeline' => 'required|array|min:1',
            'timeline.*.year' => 'required|integer|min:1900|max:2100',
            'timeline.*.title' => 'required|string|max:120',
            'timeline.*.description' => 'required|string|max:500',
            'timeline.*.image_url' => 'nullable|string|max:255',
            'timeline.*.order' => 'nullable|integer',
        ];
    }
}

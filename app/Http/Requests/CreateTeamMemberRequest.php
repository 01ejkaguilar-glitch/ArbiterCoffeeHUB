<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['admin', 'manager', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:120',
            'position' => 'required|string|max:120',
            'bio' => 'required|string|max:500',
            'photo_url' => 'nullable|string|max:255',
            'specialties' => 'nullable|array',
            'specialties.*' => 'string|max:80',
            'order' => 'nullable|integer',
        ];
    }
}

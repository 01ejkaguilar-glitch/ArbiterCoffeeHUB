<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['admin', 'manager', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'team' => 'required|array|min:1',
            'team.*.name' => 'required|string|max:120',
            'team.*.position' => 'required|string|max:120',
            'team.*.bio' => 'required|string|max:500',
            'team.*.photo_url' => 'nullable|string|max:255',
            'team.*.specialties' => 'nullable|array',
            'team.*.specialties.*' => 'string|max:80',
            'team.*.order' => 'nullable|integer',
        ];
    }
}

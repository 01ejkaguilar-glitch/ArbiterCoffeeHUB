<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSystemConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['admin', 'super-admin', 'manager']);
    }

    public function rules(): array
    {
        $allowedKeys = [
            'operating_hours',
            'contact_info',
            'team_members',
            'company_timeline',
        ];

        $base = [
            'key' => ['required', 'string', 'max:255', Rule::in($allowedKeys)],
            'type' => 'sometimes|in:json,string,number,boolean',
            'description' => 'sometimes|string',
        ];

        $valueRules = [];
        $key = $this->input('key');

        switch ($key) {
            case 'operating_hours':
                $valueRules = [
                    'value' => 'required|array',
                    'value.monday.open' => 'required|string|max:5',
                    'value.monday.close' => 'required|string|max:5',
                    'value.tuesday.open' => 'required|string|max:5',
                    'value.tuesday.close' => 'required|string|max:5',
                    'value.wednesday.open' => 'required|string|max:5',
                    'value.wednesday.close' => 'required|string|max:5',
                    'value.thursday.open' => 'required|string|max:5',
                    'value.thursday.close' => 'required|string|max:5',
                    'value.friday.open' => 'required|string|max:5',
                    'value.friday.close' => 'required|string|max:5',
                    'value.saturday.open' => 'required|string|max:5',
                    'value.saturday.close' => 'required|string|max:5',
                    'value.sunday.open' => 'required|string|max:5',
                    'value.sunday.close' => 'required|string|max:5',
                ];
                break;
            case 'contact_info':
                $valueRules = [
                    'value' => 'required|array',
                    'value.phone' => 'required|string|max:50',
                    'value.email' => 'required|email|max:255',
                    'value.address' => 'required|string|max:500',
                    'value.social_media' => 'nullable|array',
                    'value.social_media.facebook' => 'nullable|url|max:255',
                    'value.social_media.instagram' => 'nullable|url|max:255',
                    'value.social_media.twitter' => 'nullable|url|max:255',
                ];
                break;
            case 'team_members':
                $valueRules = [
                    'value' => 'required|array|min:1',
                    'value.*.name' => 'required|string|max:255',
                    'value.*.position' => 'required|string|max:255',
                    'value.*.bio' => 'required|string|max:1000',
                    'value.*.image' => 'nullable|string|max:255',
                ];
                break;
            case 'company_timeline':
                $valueRules = [
                    'value' => 'required|array|min:1',
                    'value.*.year' => 'required|string|max:10',
                    'value.*.title' => 'required|string|max:255',
                    'value.*.description' => 'required|string|max:1000',
                ];
                break;
            default:
                $valueRules = [];
        }

        return array_merge($base, $valueRules);
    }
}

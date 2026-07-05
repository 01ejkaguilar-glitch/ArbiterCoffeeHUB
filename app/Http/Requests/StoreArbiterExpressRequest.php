<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArbiterExpressRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public inquiry submission
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'event_date' => 'required|date',
            'event_time' => 'required|string',
            'location' => 'required|string',
            'guest_count' => 'required|integer|min:1',
            'service_type' => 'required|string',
            'menu_preferences' => 'nullable|string',
            'budget_range' => 'nullable|string',
            'special_requests' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'full_name.required' => 'Full name is required.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'phone.required' => 'Phone number is required.',
            'event_date.required' => 'Event date is required.',
            'event_date.date' => 'Please enter a valid date.',
            'event_time.required' => 'Event time is required.',
            'location.required' => 'Location is required.',
            'guest_count.required' => 'Guest count is required.',
            'guest_count.min' => 'Guest count must be at least 1.',
            'service_type.required' => 'Service type is required.',
        ];
    }
}
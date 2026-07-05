<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email_notifications' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
            'order_updates' => 'sometimes|boolean',
            'promotional_offers' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email_notifications.boolean' => 'Email notifications must be a boolean.',
            'sms_notifications.boolean' => 'SMS notifications must be a boolean.',
            'order_updates.boolean' => 'Order updates must be a boolean.',
            'promotional_offers.boolean' => 'Promotional offers must be a boolean.',
        ];
    }
}
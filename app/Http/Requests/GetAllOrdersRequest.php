<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetAllOrdersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'super-admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => 'sometimes|string|in:pending,confirmed,preparing,ready,completed,cancelled',
            'payment_status' => 'sometimes|string|in:pending,paid,failed,refunded',
            'order_type' => 'sometimes|string|in:takeout,delivery,dine_in',
            'search' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'sort_by' => 'sometimes|string|in:id,order_number,total_amount,status,payment_status,created_at,updated_at',
            'sort_order' => 'sometimes|in:asc,desc',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ];
    }
}
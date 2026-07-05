<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCoffeeBeanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'super-admin', 'barista', 'manager']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'origin_country' => 'required|string|max:255',
            'region' => 'nullable|string|max:255',
            'elevation' => 'nullable|string|max:255',
            'processing_method' => 'nullable|string|max:255',
            'variety' => 'nullable|string|max:255',
            'tasting_notes' => 'nullable|string',
            'producer' => 'nullable|string|max:255',
            'stock_quantity' => 'required|integer|min:0',
            'is_featured' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'image_url' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Coffee bean name is required.',
            'origin_country.required' => 'Origin country is required.',
            'stock_quantity.required' => 'Stock quantity is required.',
            'stock_quantity.min' => 'Stock quantity cannot be negative.',
            'image.image' => 'File must be an image.',
            'image.mimes' => 'Image must be in JPEG, PNG, JPG, GIF, or WebP format.',
            'image.max' => 'Image size cannot exceed 2MB.',
        ];
    }
}
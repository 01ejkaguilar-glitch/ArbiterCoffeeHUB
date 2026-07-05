<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfilePictureRequest extends FormRequest
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
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'profile_picture.required' => 'Profile picture is required.',
            'profile_picture.image' => 'File must be an image.',
            'profile_picture.mimes' => 'Image must be in JPEG, PNG, JPG, GIF, or WebP format.',
            'profile_picture.max' => 'Image size cannot exceed 2MB.',
        ];
    }
}
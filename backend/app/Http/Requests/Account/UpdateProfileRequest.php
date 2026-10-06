<?php

namespace App\Http\Requests\Account;

use App\Support\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'phone' => ['nullable', 'string', 'regex:'.Phone::TZ_REGEX],
        ];
    }

    public function messages(): array
    {
        return ['phone.regex' => 'Enter a Tanzanian phone number, e.g. 0712 345 678.'];
    }
}

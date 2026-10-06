<?php

namespace App\Http\Requests\Auth;

use App\Support\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'regex:'.Phone::TZ_REGEX],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->email)),
            'phone' => $this->phone ? Phone::clean($this->phone) : null,
        ]);
    }

    public function messages(): array
    {
        return ['phone.regex' => 'Enter a Tanzanian phone number, e.g. 0712 345 678.'];
    }
}

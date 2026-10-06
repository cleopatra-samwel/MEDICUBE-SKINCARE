<?php

namespace App\Http\Requests\Checkout;

use App\Support\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InitiatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'method' => ['required', Rule::in(array_keys(array_filter(config('payments.methods'), fn ($m) => $m['enabled'] ?? false)))],
            // Guests prove they own the order with the phone used at checkout
            // (checked in the controller; signed-in owners don't need it).
            'order_phone' => ['nullable', 'string', 'max:20'],
            'payer_phone' => ['required_if:method,mobile_money', 'nullable', 'string', 'regex:'.Phone::TZ_REGEX],
        ];
    }

    public function messages(): array
    {
        return [
            'payer_phone.required_if' => 'Enter the mobile money number that will pay.',
            'payer_phone.regex' => 'Enter a Tanzanian phone number, e.g. 0712 345 678.',
        ];
    }
}

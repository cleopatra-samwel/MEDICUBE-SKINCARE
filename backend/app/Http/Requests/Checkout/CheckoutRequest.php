<?php

namespace App\Http\Requests\Checkout;

use App\Support\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guests are welcome
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'regex:'.Phone::TZ_REGEX],
            'email' => ['nullable', 'email', 'max:255'],
            'region' => ['required', 'string', Rule::in(config('shop.regions'))],
            'district' => ['required', 'string', 'max:100'],
            'street' => ['required', 'string', 'max:150'],
            'address_line' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            'save_address' => ['sometimes', 'boolean'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->phone) {
            $this->merge(['phone' => Phone::clean($this->phone)]);
        }
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a Tanzanian phone number, e.g. 0712 345 678.',
            'region.in' => 'Choose a region from the list.',
            'items.required' => 'Your cart is empty.',
        ];
    }
}

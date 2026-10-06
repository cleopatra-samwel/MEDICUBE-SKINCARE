<?php

namespace App\Http\Requests\Account;

use App\Support\Phone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['nullable', 'string', 'max:50'],
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'regex:'.Phone::TZ_REGEX],
            'region' => ['required', Rule::in(config('shop.regions'))],
            'district' => ['required', 'string', 'max:100'],
            'street' => ['required', 'string', 'max:150'],
            'address_line' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return $this->only(['id', 'label', 'full_name', 'phone', 'region', 'district', 'street', 'address_line', 'notes', 'is_default']);
    }
}

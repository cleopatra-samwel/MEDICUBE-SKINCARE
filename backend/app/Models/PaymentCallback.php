<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentCallback extends Model
{
    protected $fillable = ['payment_id', 'gateway', 'payload', 'signature_valid', 'result', 'processed_at'];

    protected function casts(): array
    {
        return ['payload' => 'array', 'signature_valid' => 'boolean', 'processed_at' => 'datetime'];
    }
}

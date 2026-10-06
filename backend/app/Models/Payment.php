<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'reference', 'gateway', 'method', 'amount', 'currency', 'status', 'provider_reference',
        'payer_phone', 'checkout_url', 'meta', 'failure_reason', 'paid_at', 'refunded_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'status' => PaymentStatus::class,
            'meta' => 'array',
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function callbacks(): HasMany
    {
        return $this->hasMany(PaymentCallback::class);
    }
}

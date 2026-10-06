<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'is_guest', 'customer_name', 'customer_phone', 'customer_phone_normalized',
        'customer_email', 'region', 'district', 'street', 'address_line', 'notes', 'subtotal', 'delivery_fee',
        'discount', 'total', 'currency', 'status', 'payment_status', 'paid_at', 'confirmed_at', 'delivered_at', 'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'is_guest' => 'boolean',
            'subtotal' => 'integer',
            'delivery_fee' => 'integer',
            'discount' => 'integer',
            'total' => 'integer',
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'paid_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->latest('id');
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('id');
    }

    public function isPaid(): bool
    {
        return $this->payment_status === PaymentStatus::Paid;
    }
}

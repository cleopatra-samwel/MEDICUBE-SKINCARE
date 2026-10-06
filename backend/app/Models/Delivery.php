<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    protected $fillable = ['order_id', 'status', 'rider_name', 'rider_phone', 'scheduled_for', 'dispatched_at', 'delivered_at', 'notes'];

    protected function casts(): array
    {
        return [
            'status' => DeliveryStatus::class,
            'scheduled_for' => 'date',
            'dispatched_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

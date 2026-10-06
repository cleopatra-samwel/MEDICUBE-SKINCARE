<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewOrderPlaced extends Notification
{
    use Queueable;

    public function __construct(private readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->customer_name,
            'total' => $this->order->total,
            'message' => "New order {$this->order->order_number} from {$this->order->customer_name}",
        ];
    }
}

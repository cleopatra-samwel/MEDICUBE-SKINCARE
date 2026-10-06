<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /** Customers can only see their own orders; staff can see all. */
    public function view(User $user, Order $order): bool
    {
        return $user->isStaff() || $order->user_id === $user->id;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->isStaff();
    }
}

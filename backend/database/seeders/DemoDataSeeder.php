<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReviewStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use App\Support\Phone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Sample customers, historical orders and approved reviews for local testing.
 * Orders are inserted directly as history (they skip the payment gateway on purpose;
 * live orders only become PAID via a verified callback).
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (Order::query()->exists()) {
            $this->command?->warn('Orders already exist, skipping demo data.');

            return;
        }

        $customerRole = Role::query()->where('name', 'customer')->value('id');
        $people = [
            ['Neema Mushi', 'neema@example.com', '0712345678', 'Dar es Salaam', 'Kinondoni', 'Mikocheni B'],
            ['Amina Said', 'amina@example.com', '0754112233', 'Dar es Salaam', 'Ilala', 'Upanga'],
            ['Grace Mollel', 'grace@example.com', '0689445566', 'Arusha', 'Arusha City', 'Njiro'],
            ['Rehema Juma', 'rehema@example.com', '0765778899', 'Mwanza', 'Nyamagana', 'Isamilo'],
            ['Faith Kimaro', 'faith@example.com', '0713990011', 'Dodoma', 'Dodoma City', 'Area D'],
        ];

        $customers = [];
        foreach ($people as $i => [$name, $email, $phone, $region, $district, $street]) {
            $user = User::query()->updateOrCreate(['email' => $email], [
                'name' => $name, 'phone' => $phone, 'password' => 'Password123',
                'role_id' => $customerRole, 'status' => 'active',
            ]);
            $user->forceFill(['created_at' => now()->subMonths(5 - $i)->subDays(rand(0, 20))])->saveQuietly();
            $customers[] = [
                'user' => $user,
                'region' => $region, 'district' => $district, 'street' => $street,
            ];
        }

        $products = Product::query()->with('primaryImage')->where('stock', '>', 0)->get();
        $pipeline = [OrderStatus::Delivered, OrderStatus::Delivered, OrderStatus::Delivered, OrderStatus::OutForDelivery, OrderStatus::Processing, OrderStatus::Confirmed, OrderStatus::Pending];

        for ($n = 0; $n < 48; $n++) {
            $c = $customers[array_rand($customers)];
            $guest = $n % 3 === 0;
            $recent = $n < 6;
            $createdAt = Carbon::now()->subDays($recent ? rand(0, 3) : rand(4, 170))->setTime(rand(8, 21), rand(0, 59));
            $open = array_slice($pipeline, 3);
            $status = $recent ? $open[array_rand($open)] : OrderStatus::Delivered;
            if ($n % 11 === 0) {
                $status = OrderStatus::Cancelled;
            }
            $paid = $status !== OrderStatus::Pending && $status !== OrderStatus::Cancelled;

            $lines = $products->random(rand(1, 3));
            $subtotal = 0;
            $items = [];
            foreach ($lines as $p) {
                $qty = rand(1, 2);
                $subtotal += $p->price * $qty;
                $items[] = ['product_id' => $p->id, 'product_name' => $p->name, 'product_sku' => $p->sku, 'product_image' => $p->primaryImage?->path, 'unit_price' => $p->price, 'quantity' => $qty, 'line_total' => $p->price * $qty];
            }
            $fee = $c['region'] === 'Dar es Salaam' ? 5000 : 10000;
            $name = $guest ? ['Zawadi Ally', 'Mariam Hassan', 'Joyce Mbwambo'][rand(0, 2)] : $c['user']->name;
            $phone = $guest ? '07'.rand(10000000, 99999999) : $c['user']->phone;

            $order = Order::forceCreate([
                'order_number' => 'TMP-'.$n,
                'user_id' => $guest ? null : $c['user']->id,
                'is_guest' => $guest,
                'customer_name' => $name,
                'customer_phone' => $phone,
                'customer_phone_normalized' => Phone::normalize($phone),
                'customer_email' => $guest ? null : $c['user']->email,
                'region' => $c['region'], 'district' => $c['district'], 'street' => $c['street'],
                'address_line' => 'House '.rand(1, 90).', near the main road',
                'subtotal' => $subtotal, 'delivery_fee' => $fee, 'total' => $subtotal + $fee,
                'status' => $status,
                'payment_status' => $paid ? PaymentStatus::Paid : ($status === OrderStatus::Cancelled ? PaymentStatus::Cancelled : PaymentStatus::Pending),
                'paid_at' => $paid ? $createdAt->copy()->addMinutes(5) : null,
                'delivered_at' => $status === OrderStatus::Delivered ? $createdAt->copy()->addDays(2) : null,
                'created_at' => $createdAt, 'updated_at' => $createdAt,
            ]);
            $order->order_number = config('shop.order_number_prefix').'-'.(config('shop.order_number_start') + $order->id);
            $order->save();
            $order->items()->createMany($items);
            $order->statusHistory()->create(['to_status' => $status->value, 'note' => 'Imported demo order']);
            $order->delivery()->create([
                'status' => match ($status) {
                    OrderStatus::Delivered => DeliveryStatus::Delivered,
                    OrderStatus::OutForDelivery => DeliveryStatus::OutForDelivery,
                    OrderStatus::Cancelled => DeliveryStatus::Failed,
                    default => DeliveryStatus::Pending,
                },
                'rider_name' => $status === OrderStatus::OutForDelivery || $status === OrderStatus::Delivered ? 'Baraka (Rider)' : null,
            ]);
            if ($paid) {
                $order->payments()->create([
                    'reference' => 'PAY-'.$order->order_number.'-DEMO', 'gateway' => 'sandbox', 'method' => ['mobile_money', 'mobile_money', 'card'][rand(0, 2)],
                    'amount' => $order->total, 'status' => PaymentStatus::Paid, 'paid_at' => $order->paid_at,
                    'provider_reference' => 'SBX-DEMO-'.$order->id,
                ]);
                if ($status === OrderStatus::Delivered) {
                    foreach ($items as $it) {
                        Product::query()->whereKey($it['product_id'])->increment('sold_count', $it['quantity']);
                    }
                }
            }
        }

        $reviews = [
            ['Neema M.', 5, 'My skin finally glows', 'I have used the vitamin C serum for six weeks and my dark marks are visibly lighter. It absorbs fast even in Dar humidity.'],
            ['Amina S.', 5, 'No white cast at all', 'The SPF sits beautifully on my skin tone and does not pill under makeup. I reapply at lunch without any fuss.'],
            ['Grace M.', 4, 'Gentle and lovely', 'The milk cleanser leaves my face soft instead of tight. The scent is very light which I appreciate.'],
            ['Rehema J.', 5, 'Worth every shilling', 'The barrier cream rescued my skin after a harsh retinol. Delivery to Mwanza took two days.'],
            ['Faith K.', 5, 'Morning skin is different', 'I wake up with smooth, bouncy skin after the sleeping mask. A little goes a long way.'],
            ['Zawadi A.', 4, 'Great for oily skin', 'The gel moisturizer keeps shine down all afternoon. I would love a bigger size.'],
        ];
        $targets = ['vitamin-c-brightening-serum', 'daily-veil-spf-50', 'rose-milk-gentle-cleanser', 'peony-barrier-cream', 'overnight-rose-sleeping-mask', 'cloud-gel-moisturizer'];
        foreach ($reviews as $i => [$name, $rating, $title, $body]) {
            $product = Product::query()->where('slug', $targets[$i])->first();
            if (! $product) {
                continue;
            }
            Review::create(['product_id' => $product->id, 'name' => $name, 'rating' => $rating, 'title' => $title, 'body' => $body, 'status' => ReviewStatus::Approved, 'is_verified_purchase' => true]);
            $product->recalculateRating();
        }
        Review::create(['product_id' => $products->first()->id, 'name' => 'Pending Reviewer', 'rating' => 3, 'body' => 'Waiting for moderation so you can test the Reviews screen.', 'status' => ReviewStatus::Pending]);

        $this->command?->info('Demo customers use the password: Password123');
    }
}

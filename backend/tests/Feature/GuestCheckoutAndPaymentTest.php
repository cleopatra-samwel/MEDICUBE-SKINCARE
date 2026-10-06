<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestCheckoutAndPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    public function test_guest_can_checkout_and_prices_come_from_the_server(): void
    {
        $product = $this->makeProduct(['price' => 35000, 'stock' => 5]);

        // The client tries to smuggle in its own price; it must be ignored.
        $payload = $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 2, 'price' => 1]]);

        $response = $this->postJson('/api/v1/checkout', $payload)->assertCreated();

        $response->assertJsonPath('subtotal', 70000)
            ->assertJsonPath('delivery_fee', 5000)
            ->assertJsonPath('total', 75000)
            ->assertJsonPath('payment_status', 'PENDING')
            ->assertJsonPath('is_guest', true);

        $this->assertMatchesRegularExpression('/^SKN-\d+$/', $response->json('order_number'));
        $this->assertSame(3, $product->fresh()->stock);
    }

    public function test_checkout_refuses_more_than_stock(): void
    {
        $product = $this->makeProduct(['stock' => 1]);
        $this->postJson('/api/v1/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 3]]))
            ->assertStatus(422)->assertJsonValidationErrors('items');
    }

    public function test_payment_is_never_paid_without_a_signed_callback(): void
    {
        $product = $this->makeProduct();
        $orderNumber = $this->postJson('/api/v1/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->json('order_number');

        $this->postJson("/api/v1/orders/{$orderNumber}/payments", [
            'method' => 'mobile_money', 'order_phone' => '0712345678', 'payer_phone' => '0712345678',
        ])->assertCreated()->assertJsonPath('payment.status', 'PROCESSING');

        $payment = Payment::query()->firstOrFail();

        // Forged callback: wrong signature → rejected, still not paid.
        $this->postJson('/api/v1/payments/webhook/sandbox', ['reference' => $payment->reference, 'status' => 'paid'], ['X-Sandbox-Signature' => 'forged'])
            ->assertStatus(401);
        $this->assertSame('PROCESSING', Order::query()->first()->payment_status->value);

        // Correctly signed callback → paid.
        $body = json_encode(['reference' => $payment->reference, 'status' => 'paid', 'amount' => $payment->amount]);
        $this->call('POST', '/api/v1/payments/webhook/sandbox', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_SANDBOX_SIGNATURE' => hash_hmac('sha256', $body, 'test-secret'),
        ], $body)->assertOk();

        $this->assertSame('PAID', Order::query()->first()->payment_status->value);
    }

    public function test_guest_cannot_pay_or_view_someone_elses_order(): void
    {
        $product = $this->makeProduct();
        $orderNumber = $this->postJson('/api/v1/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->json('order_number');

        $this->postJson("/api/v1/orders/{$orderNumber}/payments", ['method' => 'card', 'order_phone' => '0799999999'])->assertNotFound();
        $this->getJson("/api/v1/orders/{$orderNumber}/payment-status?phone=0799999999")->assertNotFound();
    }

    public function test_tracking_needs_matching_order_number_and_phone(): void
    {
        $product = $this->makeProduct();
        $orderNumber = $this->postJson('/api/v1/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->json('order_number');

        $this->postJson('/api/v1/track-order', ['order_number' => $orderNumber, 'phone' => '+255 712 345 678'])
            ->assertOk()->assertJsonPath('timeline.0.state', 'done');

        $this->postJson('/api/v1/track-order', ['order_number' => $orderNumber, 'phone' => '0700000000'])->assertNotFound();
    }

    public function test_unpaid_orders_cannot_be_dispatched(): void
    {
        $product = $this->makeProduct();
        $orderNumber = $this->postJson('/api/v1/checkout', $this->checkoutPayload([['product_id' => $product->id, 'quantity' => 1]]))->json('order_number');
        $admin = $this->makeUser('admin');
        $token = $admin->createToken('admin')->plainTextToken;

        foreach (['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY'] as $status) {
            $this->withToken($token)->patchJson("/api/v1/admin/orders/{$orderNumber}/status", ['status' => $status])->assertOk();
        }
        $this->withToken($token)->patchJson("/api/v1/admin/orders/{$orderNumber}/status", ['status' => 'OUT_FOR_DELIVERY'])->assertStatus(422);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique();
            // Null for guest checkouts; the contact details below are always stored.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_guest')->default(true);
            $table->string('customer_name');
            $table->string('customer_phone', 20);
            $table->string('customer_phone_normalized', 20)->index();
            $table->string('customer_email')->nullable();
            $table->string('region', 100);
            $table->string('district', 100);
            $table->string('street');
            $table->text('address_line');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('delivery_fee');
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('total');
            $table->string('currency', 3)->default('TZS');
            $table->string('status', 30)->default('PENDING')->index();
            $table->string('payment_status', 20)->default('PENDING')->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            // Snapshot of the product at purchase time, kept even if the product is later deleted.
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('product_sku', 64)->nullable();
            $table->string('product_image')->nullable();
            $table->unsignedBigInteger('unit_price');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('line_total');
            $table->timestamps();
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->string('note')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('reference', 64)->unique();          // our reference, sent to the provider
            $table->string('gateway', 50);                     // sandbox | provider | ...
            $table->string('method', 30);                      // mobile_money | card | bank
            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('TZS');
            $table->string('status', 20)->default('PENDING')->index();
            $table->string('provider_reference')->nullable()->index();
            $table->string('payer_phone', 20)->nullable();
            $table->string('checkout_url', 2048)->nullable();  // for redirect-style gateways
            $table->jsonb('meta')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
        });

        // Every provider callback is logged before it is processed (audit + idempotency).
        Schema::create('payment_callbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('gateway', 50);
            $table->jsonb('payload');
            $table->boolean('signature_valid')->default(false);
            $table->string('result', 50)->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('status', 30)->default('PENDING')->index();
            $table->string('rider_name')->nullable();
            $table->string('rider_phone', 20)->nullable();
            $table->date('scheduled_for')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('payment_callbacks');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};

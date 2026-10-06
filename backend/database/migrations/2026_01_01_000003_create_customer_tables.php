<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label', 50)->nullable();   // "Home", "Office"
            $table->string('full_name');
            $table->string('phone', 20);
            $table->string('region', 100);
            $table->string('district', 100);
            $table->string('street');
            $table->text('address_line');
            $table->text('notes')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wishlist_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['wishlist_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlist_items');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('delivery_addresses');
    }
};

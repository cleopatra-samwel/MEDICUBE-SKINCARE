<?php

namespace Tests;

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function seedRoles(): void
    {
        $this->seed(RoleSeeder::class);
    }

    protected function makeUser(string $role = 'customer', array $attrs = []): User
    {
        return User::create(array_merge([
            'name' => ucfirst($role).' User',
            'email' => $role.uniqid().'@example.com',
            'password' => 'Password123',
            'status' => 'active',
            'role_id' => Role::query()->where('name', $role)->value('id'),
        ], $attrs));
    }

    protected function makeProduct(array $attrs = []): Product
    {
        $category = Category::query()->firstOrCreate(['slug' => 'serums'], ['name' => 'Serums']);

        return Product::create(array_merge([
            'category_id' => $category->id,
            'name' => 'Test Serum '.uniqid(),
            'slug' => 'test-serum-'.uniqid(),
            'sku' => 'T-'.uniqid(),
            'price' => 35000,
            'stock' => 10,
            'status' => 'ACTIVE',
        ], $attrs));
    }

    protected function checkoutPayload(array $items): array
    {
        return [
            'full_name' => 'Neema Mushi',
            'phone' => '0712 345 678',
            'email' => 'neema@example.com',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'street' => 'Mikocheni B',
            'address_line' => 'House 12, blue gate',
            'items' => $items,
        ];
    }
}

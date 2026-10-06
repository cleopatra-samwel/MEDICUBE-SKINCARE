<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
            CatalogSeeder::class,
        ]);

        // Sample customers, orders and reviews so the dashboard has something to show.
        // Skip in production: php artisan db:seed --class=DemoDataSeeder only when wanted.
        if (! app()->isProduction()) {
            $this->call(DemoDataSeeder::class);
        }
    }
}

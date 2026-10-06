<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /** Creates the first super admin from ADMIN_* variables in .env. */
    public function run(): void
    {
        $email = strtolower((string) env('ADMIN_EMAIL', 'admin@example.com'));

        User::query()->updateOrCreate(['email' => $email], [
            'name' => env('ADMIN_NAME', 'Store Owner'),
            'password' => env('ADMIN_PASSWORD', 'ChangeMe!2026'),
            'role_id' => Role::query()->where('name', UserRole::SuperAdmin->value)->value('id'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->command?->info("Super admin ready: {$email} (change the password after first sign-in).");
    }
}

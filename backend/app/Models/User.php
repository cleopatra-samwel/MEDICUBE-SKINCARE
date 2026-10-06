<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = ['role_id', 'name', 'email', 'phone', 'password', 'status', 'last_login_at'];

    protected $hidden = ['password', 'remember_token'];

    protected $with = ['role'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',     // bcrypt/argon via Laravel's Hash facade
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function roleEnum(): UserRole
    {
        return UserRole::from($this->role->name);
    }

    public function hasRole(UserRole|string ...$roles): bool
    {
        $names = array_map(fn ($r) => $r instanceof UserRole ? $r->value : $r, $roles);

        return in_array($this->role?->name, $names, true);
    }

    public function isStaff(): bool
    {
        return $this->hasRole(UserRole::Admin, UserRole::SuperAdmin);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(UserRole::SuperAdmin);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function scopeCustomers(Builder $query): Builder
    {
        return $query->whereHas('role', fn ($q) => $q->where('name', UserRole::Customer->value));
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(DeliveryAddress::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlist(): HasOne
    {
        return $this->hasOne(Wishlist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}

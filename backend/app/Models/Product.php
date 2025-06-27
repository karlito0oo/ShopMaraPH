<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    use HasFactory;
    
    const STATUS_AVAILABLE = 'Available';
    const STATUS_SOLD = 'Sold';
    const STATUS_ON_HOLD = 'OnHold';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'sku',
        'care_instructions',
        'is_new_arrival',
        'is_sale',
        'status',
        'size',
        'onhold_by_type',
        'onhold_by_id',
        'onhold_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_new_arrival' => 'boolean',
        'is_sale' => 'boolean',
        'images' => 'array',
        'price' => 'decimal:2'
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
    
    /**
     * Put the product on hold for a user or guest
     */
    public function putOnHold(string $type, string $id): void
    {
        $this->update([
            'status' => self::STATUS_ON_HOLD,
            'onhold_by_type' => $type,
            'onhold_by_id' => $id,
            'onhold_at' => now()
        ]);
    }

    
    /**
     * Check if the product is on hold by a specific user/guest
     */
    public function isHeldBy(string $type, string $id): bool
    {
        //check if the product is on hold by the same user/guest
        return $this->status === self::STATUS_ON_HOLD &&
               $this->onhold_by_type === $type &&
               $this->onhold_by_id === $id;
    }

    public function isHoldExpired(): bool
    {
        if ($this->status !== self::STATUS_ON_HOLD || !$this->onhold_at) {
            return false;
        }

        $holdDuration = Setting::where('key', 'product_hold_duration')->value('value') ?? 30;
        return $this->onhold_at->addMinutes($holdDuration)->isPast();
    }
    
    /**
     * Release hold if expired
     */
    public function releaseHoldIfExpired(): void
    {
        if ($this->isHoldExpired()) {
            $this->releaseFromHold();
        }
    }
}

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
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sku',
        'name',
        'description',
        'care_instructions',
        'price',
        'image',
        'images',
        'category',
        'is_best_seller',
        'is_new_arrival',
        'is_sale',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'images' => 'array',
        'is_best_seller' => 'boolean',
        'is_new_arrival' => 'boolean',
        'is_sale' => 'boolean',
        'active' => 'boolean',
        'price' => 'float',
    ];

    /**
     * Get the stock record associated with the product.
     */
    public function stock(): HasOne
    {
        return $this->hasOne(Stock::class);
    }

    /**
     * Get the sizes available for this product.
     */
    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class);
    }

    /**
     * Get the available sizes for this product.
     */
    public function getAvailableSizesAttribute(): array
    {
        return $this->sizes()->pluck('size')->toArray();
    }

    /**
     * Get the size stock information for this product.
     */
    public function getSizeStockAttribute(): array
    {
        return $this->sizes()
            ->select(['size', 'stock'])
            ->get()
            ->toArray();
    }
}

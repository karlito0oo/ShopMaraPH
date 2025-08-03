<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroCarousel extends Model
{
    protected $fillable = [
        'image_url',
        'title',
        'subtitle',
        'link',
        'order',
        'is_active',
        'view_type',
    ];
}

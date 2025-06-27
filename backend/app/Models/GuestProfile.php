<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuestProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'guest_id',
        'customer_name',
        'instagram_username',
        'address_line1',
        'barangay',
        'province',
        'city',
        'mobile_number',
        'email',
    ];

    /**
     * Find a profile by guest ID.
     *
     * @param string $guestId
     * @return GuestProfile|null
     */
    public static function findByGuestId(string $guestId): ?GuestProfile
    {
        return static::where('guest_id', $guestId)->first();
    }
} 
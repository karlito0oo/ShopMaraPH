<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'guest_id',
        'instagram_username',
        'address_line1',
        'barangay',
        'province',
        'city',
        'mobile_number',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Find a profile by guest ID.
     *
     * @param string $guestId
     * @return UserProfile|null
     */
    public static function findByGuestId(string $guestId): ?UserProfile
    {
        return static::where('guest_id', $guestId)->first();
    }
} 
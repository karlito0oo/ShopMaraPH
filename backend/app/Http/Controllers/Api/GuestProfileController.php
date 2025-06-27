<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuestProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GuestProfileController extends Controller
{
    /**
     * Get a guest's profile.
     */
    public function getProfile(Request $request)
    {
        try {
            $guestId = $request->header('X-Guest-ID');
            if (!$guestId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guest ID is required',
                ], 422);
            }

            $profile = GuestProfile::findByGuestId($guestId);
            
            return response()->json([
                'success' => true,
                'data' => $profile,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get guest profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save or update a guest's profile.
     */
    public function saveProfile(Request $request)
    {
        try {
            $guestId = $request->header('X-Guest-ID');
            if (!$guestId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Guest ID is required',
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'customer_name' => 'required|string|max:255',
                'instagram_username' => 'nullable|string|max:255',
                'address_line1' => 'required|string|max:255',
                'barangay' => 'required|string|max:255',
                'province' => 'required|string|max:255',
                'city' => 'required|string|max:255',
                'mobile_number' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $profile = GuestProfile::findByGuestId($guestId);
            if (!$profile) {
                $profile = new GuestProfile();
                $profile->guest_id = $guestId;
            }

            $profile->fill($request->only([
                'customer_name',
                'instagram_username',
                'address_line1',
                'barangay',
                'province',
                'city',
                'mobile_number',
                'email',
            ]));

            $profile->save();

            return response()->json([
                'success' => true,
                'data' => $profile,
                'message' => 'Guest profile saved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save guest profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
} 
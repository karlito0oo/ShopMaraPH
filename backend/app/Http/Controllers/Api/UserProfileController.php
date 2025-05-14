<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function getProfile()
    {
        $user = Auth::user();
        $profile = $user->profile;
        
        if (!$profile) {
            // Return empty profile if none exists yet
            return response()->json([
                'success' => true,
                'data' => [
                    'profile' => null
                ]
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'profile' => $profile
            ]
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'instagram_username' => 'nullable|string|max:255',
            'address_line1' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'mobile_number' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = Auth::user();
        $profile = $user->profile;
        
        if (!$profile) {
            // Create new profile if it doesn't exist
            $profile = new UserProfile([
                'user_id' => $user->id,
                'instagram_username' => $request->instagram_username,
                'address_line1' => $request->address_line1,
                'barangay' => $request->barangay,
                'city' => $request->city,
                'mobile_number' => $request->mobile_number,
            ]);
            $profile->save();
        } else {
            // Update existing profile
            $profile->update([
                'instagram_username' => $request->instagram_username,
                'address_line1' => $request->address_line1,
                'barangay' => $request->barangay,
                'city' => $request->city,
                'mobile_number' => $request->mobile_number,
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'profile' => $profile
            ]
        ]);
    }
} 
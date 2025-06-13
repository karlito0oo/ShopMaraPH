<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    /**
     * List all users with their profile info.
     */
    public function index()
    {
        $users = User::with('profile')->get();
        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Change a user's password (admin only).
     */
    public function changePassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        $user = User::findOrFail($id);
        $user->password = Hash::make($request->password);
        $user->save();
        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.'
        ]);
    }
} 
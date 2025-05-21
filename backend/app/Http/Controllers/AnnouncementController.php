<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    /**
     * Get all active announcements
     */
    public function index()
    {
        $announcements = Announcement::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements
        ]);
    }

    /**
     * Admin: Get all announcements
     */
    public function adminIndex()
    {
        $announcements = Announcement::orderBy('display_order')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements
        ]);
    }

    /**
     * Admin: Get a specific announcement
     */
    public function show($id)
    {
        $announcement = Announcement::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $announcement
        ]);
    }

    /**
     * Admin: Create a new announcement
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:255',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'background_color' => 'string|max:20',
            'text_color' => 'string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $announcement = Announcement::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully',
            'data' => $announcement
        ], 201);
    }

    /**
     * Admin: Update an announcement
     */
    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'text' => 'sometimes|required|string|max:255',
            'is_active' => 'sometimes|boolean',
            'display_order' => 'sometimes|integer|min:0',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'background_color' => 'sometimes|string|max:20',
            'text_color' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $announcement->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully',
            'data' => $announcement
        ]);
    }

    /**
     * Admin: Delete an announcement
     */
    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully'
        ]);
    }

    /**
     * Admin: Toggle announcement status
     */
    public function toggleStatus(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $announcement->is_active = $request->is_active;
        $announcement->save();

        return response()->json([
            'success' => true,
            'message' => 'Announcement status updated successfully',
            'data' => $announcement
        ]);
    }
} 
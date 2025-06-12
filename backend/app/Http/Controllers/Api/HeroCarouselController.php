<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroCarousel;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HeroCarouselController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carousels = HeroCarousel::orderBy('order')->get();
        $interval = Setting::get('hero_carousel_interval', 5000);
        foreach ($carousels as $carousel) {
            $carousel->image_url = asset($carousel->image_url);
        }
        return response()->json([
            'success' => true,
            'data' => [
                'carousels' => $carousels,
                'interval' => $interval,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        $data = $request->only(['title', 'subtitle', 'link', 'order', 'is_active']);
        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('hero_carousel', 'public');
            $data['image_url'] = '/storage/' . $path;
        } elseif ($request->filled('image_url')) {
            $data['image_url'] = $request->input('image_url');
        }
        $carousel = HeroCarousel::create($data);
        return response()->json(['success' => true, 'data' => $carousel]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $carousel = HeroCarousel::findOrFail($id);
        return response()->json(['success' => true, 'data' => $carousel]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $carousel = HeroCarousel::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        $data = $request->only(['title', 'subtitle', 'link', 'order', 'is_active']);
        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('hero_carousel', 'public');
            $data['image_url'] = '/storage/' . $path;
        } elseif ($request->filled('image_url')) {
            $data['image_url'] = $request->input('image_url');
        }
        $carousel->update($data);
        return response()->json(['success' => true, 'data' => $carousel]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $carousel = HeroCarousel::findOrFail($id);
        $carousel->delete();
        return response()->json(['success' => true]);
    }

    // Public endpoint: get all active carousels and interval
    public function publicIndex()
    {
        $carousels = HeroCarousel::where('is_active', true)->orderBy('order')->get();
        $interval = Setting::get('hero_carousel_interval', 5000);
        foreach ($carousels as $carousel) {
            $carousel->image_url = asset($carousel->image_url);
        }
        return response()->json([
            'success' => true,
            'data' => [
                'carousels' => $carousels,
                'interval' => $interval,
            ],
        ]);
    }

    // Update interval setting
    public function updateInterval(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'interval' => 'required|integer|min:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        Setting::set('hero_carousel_interval', $request->input('interval'));
        return response()->json(['success' => true, 'interval' => $request->input('interval')]);
    }
}

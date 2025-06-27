<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::all();

        $data = [];
        foreach($products as $product){
            if ($product->status === Product::STATUS_ON_HOLD) {
                $product->releaseHoldIfExpired();
                $product->refresh(); // Refresh the model to get updated status
            }

            $data[] =  [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'description' => $product->description,
                'careInstructions' => $product->care_instructions,
                'price' => $product->price,
                'image' => asset('storage/' . $product->image),
                'images' => $product->images ? collect($product->images)->map(fn ($img) => asset('storage/' . $img))->toArray() : [],
                'isNewArrival' => $product->is_new_arrival,
                'isSale' => $product->is_sale,
                'status' => $product->status,
                'size' => $product->size
            ];
        }
        
        
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Store or update a resource in storage.
     * If ID is provided, updates existing product. Otherwise creates a new one.
     */
    public function store(Request $request, $id = null)
    {
        try {
            $isUpdate = !is_null($id);
            
            // Different validation rules for update vs create
            $imageValidation = $isUpdate ? 'nullable|image|mimes:jpeg,png,jpg,gif|max:5048' : 'required|image|mimes:jpeg,png,jpg,gif|max:2048';
            $skuValidation = $isUpdate ? 'nullable|string|max:50|unique:products,sku,' . $id : 'nullable|string|max:50|unique:products,sku';

            $validator = Validator::make($request->all(), [
                'sku' => $skuValidation,
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'care_instructions' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => $imageValidation,
                'additional_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5048',
                'is_new_arrival' => 'required|in:true,false',
                'is_sale' => 'required|in:true,false',
                'status' => 'sometimes|in:Available,Sold',
                'size' => 'required|in:xs,s,m,l,xl,xxl'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get or create the product
            $product = $isUpdate ? Product::findOrFail($id) : new Product();

            // Set basic product properties
            $product->sku = $request->sku;
            $product->name = $request->name;
            $product->description = $request->description;
            $product->care_instructions = $request->care_instructions;
            $product->price = $request->price;
            $product->is_new_arrival = $request->is_new_arrival === 'true';
            $product->is_sale = $request->is_sale === 'true';
            $product->status = $isUpdate ? ($request->status ?? $product->status) : 'Available';
            $product->size = $request->size;

            // Handle main image if provided
            if ($request->hasFile('image')) {
                // Delete old image if updating
                if ($isUpdate && $product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $product->image = $request->file('image')->store('products', 'public');
            } elseif ($isUpdate && $request->has('existing_image')) {
                // Keep existing main image - extract path from URL
                $path = parse_url($request->existing_image, PHP_URL_PATH);
                $product->image = preg_replace('#^/storage/#', '', $path);
            }

            // Handle additional images
            $additionalImagesPaths = [];
            
            // Handle existing additional images
            if ($request->has('existing_additional_images')) {
                $existingImages = json_decode($request->existing_additional_images, true) ?? [];
                foreach ($existingImages as $imageUrl) {
                    // Extract just the path after 'storage/'
                    $path = parse_url($imageUrl, PHP_URL_PATH);
                    $path = preg_replace('#^/storage/#', '', $path);
                    $additionalImagesPaths[] = $path;
                }
            }
            
            // Add any new additional images
            if ($request->hasFile('additional_images')) {
                foreach ($request->file('additional_images') as $image) {
                    $additionalImagesPaths[] = $image->store('products', 'public');
                }
            }
            
            // Clean up removed images
            if ($isUpdate && $product->images) {
                $currentPaths = $additionalImagesPaths;
                $oldPaths = $product->images;
                
                // Delete images that are no longer in use
                foreach ($oldPaths as $oldPath) {
                    if (!in_array($oldPath, $currentPaths)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
            }
            
            $product->images = !empty($additionalImagesPaths) ? $additionalImagesPaths : null;

            // Save the product
            $product->save();

            return response()->json([
                'success' => true,
                'message' => $isUpdate ? 'Product updated successfully' : 'Product created successfully',
                'data' => $product,
            ], $isUpdate ? 200 : 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $isUpdate ? 'Failed to update product' : 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $product = Product::findOrFail($id);
            // Transform to match frontend format
            $transformedProduct = [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'description' => $product->description,
                'careInstructions' => $product->care_instructions,
                'price' => $product->price,
                'image' => asset('storage/' . $product->image),
                'images' => $product->images ? collect($product->images)->map(fn ($img) => asset('storage/' . $img))->toArray() : [],
                'isNewArrival' => $product->is_new_arrival,
                'isSale' => $product->is_sale,
                'status' => $product->status,
                'size' => $product->size
            ];
            
            return response()->json([
                'success' => true,
                'data' => $transformedProduct,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Delete product images
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            
            if ($product->images) {
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            
            $product->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

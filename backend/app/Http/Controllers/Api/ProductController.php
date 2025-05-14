<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Stock;
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
        $products = Product::with(['sizes', 'stock'])->get();
        
        // Transform to match frontend format
        $products->transform(function ($product) {
            return [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'description' => $product->description,
                'careInstructions' => $product->care_instructions,
                'price' => $product->price,
                'image' => asset('storage/' . $product->image),
                'images' => $product->images ? collect($product->images)->map(fn ($img) => asset('storage/' . $img))->toArray() : [],
                'category' => $product->category,
                'isBestSeller' => $product->is_best_seller,
                'isNewArrival' => $product->is_new_arrival,
                'sizes' => $product->available_sizes,
                'sizeStock' => collect($product->size_stock)->map(function ($item) {
                    return [
                        'size' => $item['size'],
                        'stock' => $item['stock'],
                    ];
                })->toArray(),
                'active' => $product->active,
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'sku' => 'nullable|string|max:50|unique:products,sku',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'care_instructions' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'additionalImages.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'required|string|max:50',
                'is_best_seller' => 'required|in:true,false',
                'is_new_arrival' => 'required|in:true,false',
                'sizes' => 'required|json',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Parse sizes JSON
            $sizesData = json_decode($request->sizes, true);
            
            // Validate the parsed sizes data
            $sizesValidator = Validator::make(['sizes' => $sizesData], [
                'sizes' => 'required|array|min:1',
                'sizes.*.size' => 'required|string|in:small,medium,large,xlarge',
                'sizes.*.stock' => 'required|integer|min:0',
            ]);
            
            if ($sizesValidator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $sizesValidator->errors(),
                ], 422);
            }

            // Handle main image upload
            $mainImagePath = $request->file('image')->store('products', 'public');
            
            // Handle additional images if provided
            $additionalImagesPaths = [];
            if ($request->hasFile('additionalImages')) {
                foreach ($request->file('additionalImages') as $image) {
                    $additionalImagesPaths[] = $image->store('products', 'public');
                }
            }

            // Create the product
            $product = Product::create([
                'sku' => $request->sku,
                'name' => $request->name,
                'description' => $request->description,
                'care_instructions' => $request->care_instructions,
                'price' => $request->price,
                'image' => $mainImagePath,
                'images' => !empty($additionalImagesPaths) ? $additionalImagesPaths : null,
                'category' => $request->category,
                'is_best_seller' => $request->is_best_seller === 'true',
                'is_new_arrival' => $request->is_new_arrival === 'true',
                'active' => true,
            ]);

            // Calculate total stock
            $totalStock = collect($sizesData)->sum('stock');
            
            // Create stock record
            Stock::create([
                'product_id' => $product->id,
                'quantity' => $totalStock,
                'min_quantity' => 5,
            ]);
            
            // Create size records
            foreach ($sizesData as $size) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size' => $size['size'],
                    'stock' => $size['stock'],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product->load(['sizes', 'stock']),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
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
            $product = Product::with(['sizes', 'stock'])->findOrFail($id);
            
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
                'category' => $product->category,
                'isBestSeller' => $product->is_best_seller,
                'isNewArrival' => $product->is_new_arrival,
                'sizes' => $product->available_sizes,
                'sizeStock' => collect($product->size_stock)->map(function ($item) {
                    return [
                        'size' => $item['size'],
                        'stock' => $item['stock'],
                    ];
                })->toArray(),
                'active' => $product->active,
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $product = Product::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'sku' => 'sometimes|string|max:50|unique:products,sku,' . $id,
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'care_instructions' => 'nullable|string',
                'price' => 'sometimes|numeric|min:0',
                'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
                'additionalImages.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'sometimes|string|max:50',
                'is_best_seller' => 'sometimes|in:true,false',
                'is_new_arrival' => 'sometimes|in:true,false',
                'sizes' => 'sometimes|json',
                'active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Parse sizes JSON if provided
            $sizesData = null;
            if ($request->has('sizes')) {
                $sizesData = json_decode($request->sizes, true);
                
                // Validate the parsed sizes data
                $sizesValidator = Validator::make(['sizes' => $sizesData], [
                    'sizes' => 'required|array|min:1',
                    'sizes.*.size' => 'required|string|in:small,medium,large,xlarge',
                    'sizes.*.stock' => 'required|integer|min:0',
                ]);
                
                if ($sizesValidator->fails()) {
                    return response()->json([
                        'success' => false,
                        'errors' => $sizesValidator->errors(),
                    ], 422);
                }
            }

            $data = $request->only([
                'sku', 'name', 'description', 'care_instructions', 'price', 'category', 'active'
            ]);

            // Handle is_best_seller conversion if present
            if ($request->has('is_best_seller')) {
                $data['is_best_seller'] = $request->is_best_seller === 'true';
            }
            
            // Handle is_new_arrival conversion if present
            if ($request->has('is_new_arrival')) {
                $data['is_new_arrival'] = $request->is_new_arrival === 'true';
            }

            // Handle main image upload if provided
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $data['image'] = $request->file('image')->store('products', 'public');
            }
            
            // Handle additional images if provided
            if ($request->hasFile('additionalImages')) {
                // Delete old additional images if exist
                if ($product->images) {
                    foreach ($product->images as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
                
                $additionalImagesPaths = [];
                foreach ($request->file('additionalImages') as $image) {
                    $additionalImagesPaths[] = $image->store('products', 'public');
                }
                $data['images'] = $additionalImagesPaths;
            }

            // Update the product
            $product->update($data);

            // Update sizes if provided
            if ($sizesData) {
                // Delete existing sizes
                $product->sizes()->delete();
                
                // Calculate total stock
                $totalStock = collect($sizesData)->sum('stock');
                
                // Update stock record
                $product->stock()->update([
                    'quantity' => $totalStock,
                ]);
                
                // Create new size records
                foreach ($sizesData as $size) {
                    ProductSize::create([
                        'product_id' => $product->id,
                        'size' => $size['size'],
                        'stock' => $size['stock'],
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product->fresh(['sizes', 'stock']),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage(),
            ], 500);
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
            
            // The sizes and stock will be deleted automatically due to onDelete('cascade')
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

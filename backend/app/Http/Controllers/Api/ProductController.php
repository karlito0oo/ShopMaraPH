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
                'isSale' => $product->is_sale,
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
     * Store or update a resource in storage.
     * If ID is provided, updates existing product. Otherwise creates a new one.
     */
    public function store(Request $request, $id = null)
    {
        try {
            $isUpdate = !is_null($id);
            
            // Different validation rules for update vs create
            $imageValidation = $isUpdate ? 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048' : 'required|image|mimes:jpeg,png,jpg,gif|max:2048';
            $skuValidation = $isUpdate ? 'nullable|string|max:50|unique:products,sku,' . $id : 'nullable|string|max:50|unique:products,sku';

            $validator = Validator::make($request->all(), [
                'sku' => $skuValidation,
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'care_instructions' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => $imageValidation,
                'additional_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'category' => 'required|string|max:50',
                'is_best_seller' => 'required|in:true,false',
                'is_new_arrival' => 'required|in:true,false',
                'is_sale' => 'required|in:true,false',
                'sizes' => 'required|json',
                'size_stock' => 'required|json',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Parse JSON data
            $sizes = json_decode($request->sizes, true);
            $sizeStock = json_decode($request->size_stock, true);

            // Get or create the product
            $product = $isUpdate ? Product::findOrFail($id) : new Product();

            // Set basic product properties
            $product->sku = $request->sku;
            $product->name = $request->name;
            $product->description = $request->description;
            $product->care_instructions = $request->care_instructions;
            $product->price = $request->price;
            $product->category = $request->category;
            $product->is_best_seller = $request->is_best_seller === 'true';
            $product->is_new_arrival = $request->is_new_arrival === 'true';
            $product->is_sale = $request->is_sale === 'true';
            $product->active = true;

            // Handle main image if provided
            if ($request->hasFile('image')) {
                // Delete old image if updating
                if ($isUpdate && $product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $product->image = $request->file('image')->store('products', 'public');
            }

            // Handle additional images
            $additionalImagesPaths = [];
            if ($isUpdate) {
                // Preserve existing additional images if this is an update
                $additionalImagesPaths = $product->images ?? [];
                
                // Get original image URLs if provided
                if ($request->has('original_image_urls')) {
                    $originalImageUrls = json_decode($request->original_image_urls, true);
                    // Process unchanged images logic here if needed
                }
            }
            
            // Add any new additional images
            if ($request->hasFile('additional_images')) {
                foreach ($request->file('additional_images') as $image) {
                    $additionalImagesPaths[] = $image->store('products', 'public');
                }
            }
            
            $product->images = !empty($additionalImagesPaths) ? $additionalImagesPaths : null;

            // Save the product
            $product->save();

            // Update or create stock
            if ($isUpdate) {
                // Delete existing size records for this product if updating
                $product->sizes()->delete();
                
                // For update: Update main stock record
                $totalStock = collect($sizeStock)->sum('stock');
                $product->stock()->update([
                    'quantity' => $totalStock,
                ]);
            } else {
                // For new product: Create stock record
                $totalStock = collect($sizeStock)->sum('stock');
                Stock::create([
                    'product_id' => $product->id,
                    'quantity' => $totalStock,
                    'min_quantity' => 5,
                ]);
            }

            // Create new size records
            foreach ($sizeStock as $item) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size' => $item['size'],
                    'stock' => $item['stock'],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => $isUpdate ? 'Product updated successfully' : 'Product created successfully',
                'data' => $product->load(['sizes', 'stock']),
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
                'isSale' => $product->is_sale,
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

    /**
     * Restock a product with additional quantities.
     */
    public function restock(Request $request, string $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'sizeStock' => 'required|array',
                'sizeStock.*.size' => 'required|string',
                'sizeStock.*.quantity' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $product = Product::with('sizes')->findOrFail($id);
            $sizeStockData = $request->sizeStock;
            $totalAddedStock = 0;

            // Update each size's stock
            foreach ($sizeStockData as $item) {
                $size = $item['size'];
                $quantity = $item['quantity'];
                
                if ($quantity <= 0) {
                    continue; // Skip if quantity is not positive
                }
                
                $totalAddedStock += $quantity;
                
                // Find the existing size record or create a new one
                $productSize = ProductSize::firstOrNew([
                    'product_id' => $product->id,
                    'size' => $size,
                ]);
                
                // If it's a new record, set initial stock to 0
                if (!$productSize->exists) {
                    $productSize->stock = 0;
                }
                
                // Add the quantity to the existing stock
                $productSize->stock += $quantity;
                $productSize->save();
            }
            
            // Update the total stock in the stocks table
            if ($totalAddedStock > 0) {
                $stock = Stock::firstOrCreate(['product_id' => $product->id], [
                    'quantity' => 0,
                    'min_quantity' => 5
                ]);
                
                $stock->quantity += $totalAddedStock;
                $stock->save();
            }

            // Fetch the updated product with its sizes and stock
            $updatedProduct = Product::with(['sizes', 'stock'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'message' => 'Product restocked successfully',
                'data' => [
                    'id' => $updatedProduct->id,
                    'name' => $updatedProduct->name,
                    'sizeStock' => collect($updatedProduct->size_stock)->map(function ($item) {
                        return [
                            'size' => $item['size'],
                            'stock' => $item['stock'],
                        ];
                    })->toArray(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restock product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get the current user's cart with items.
     */
    public function getCart()
    {
        $user = Auth::user();
        $cart = $user->cart()->with(['items.product'])->first();
        
        if (!$cart) {
            // Return empty cart if none exists yet
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => [],
                    'totalItems' => 0,
                    'totalPrice' => 0
                ]
            ]);
        }
        
        // Transform cart items to match frontend format
        $transformedItems = $cart->items->map(function ($item) {
            $product = $item->product;
            return [
                'id' => $item->id,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image' => asset('storage/' . $product->image),
                    'category' => $product->category,
                ],
                'size' => $item->size,
                'quantity' => $item->quantity,
            ];
        });
        
        // Calculate totals
        $totalItems = $cart->items->sum('quantity');
        $totalPrice = $cart->items->reduce(function ($sum, $item) {
            return $sum + ($item->product->price * $item->quantity);
        }, 0);
        
        return response()->json([
            'success' => true,
            'data' => [
                'items' => $transformedItems,
                'totalItems' => $totalItems,
                'totalPrice' => $totalPrice
            ]
        ]);
    }

    /**
     * Add a product to the cart.
     */
    public function addToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'size' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = Auth::user();
        $productId = $request->product_id;
        $size = $request->size;
        $quantity = $request->quantity;
        
        // Verify product exists and has the requested size available
        $product = Product::with('sizes')->findOrFail($productId);
        $productSize = $product->sizes->where('size', $size)->first();
        
        if (!$productSize) {
            return response()->json([
                'success' => false,
                'message' => 'The selected size is not available for this product.',
            ], 422);
        }
        
        // Check if quantity is available
        if ($productSize->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available for the selected size.',
            ], 422);
        }
        
        // Get or create the user's cart
        $cart = $user->cart;
        if (!$cart) {
            $cart = Cart::create(['user_id' => $user->id]);
        }
        
        // Check if the product is already in the cart with the same size
        $cartItem = $cart->items()->where('product_id', $productId)
            ->where('size', $size)
            ->first();
        
        if ($cartItem) {
            // Update existing cart item
            $newQuantity = $cartItem->quantity + $quantity;
            
            // Verify there's enough stock for the new total quantity
            if ($productSize->stock < $newQuantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not enough stock available for the total requested quantity.',
                ], 422);
            }
            
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'size' => $size,
                'quantity' => $quantity,
            ]);
        }
        
        // Return updated cart
        return $this->getCart();
    }

    /**
     * Update the quantity of a cart item.
     */
    public function updateCartItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_item_id' => 'required|exists:cart_items,id',
            'quantity' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = Auth::user();
        $cart = $user->cart;
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found.',
            ], 404);
        }
        
        $cartItemId = $request->cart_item_id;
        $quantity = $request->quantity;
        
        // Get the cart item and verify it belongs to the user's cart
        $cartItem = CartItem::where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->with('product.sizes')
            ->first();
        
        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found.',
            ], 404);
        }
        
        // If quantity is 0, remove the item
        if ($quantity === 0) {
            $cartItem->delete();
            return $this->getCart();
        }
        
        // Verify there's enough stock for the requested quantity
        $productSize = $cartItem->product->sizes
            ->where('size', $cartItem->size)
            ->first();
        
        if (!$productSize || $productSize->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough stock available for the requested quantity.',
            ], 422);
        }
        
        // Update the cart item
        $cartItem->quantity = $quantity;
        $cartItem->save();
        
        // Return updated cart
        return $this->getCart();
    }

    /**
     * Remove an item from the cart.
     */
    public function removeFromCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_item_id' => 'required|exists:cart_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }
        
        $user = Auth::user();
        $cart = $user->cart;
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found.',
            ], 404);
        }
        
        $cartItemId = $request->cart_item_id;
        
        // Delete the cart item if it belongs to the user's cart
        $deleted = CartItem::where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->delete();
        
        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found or already removed.',
            ], 404);
        }
        
        // Return updated cart
        return $this->getCart();
    }

    /**
     * Clear the cart (remove all items).
     */
    public function clearCart()
    {
        $user = Auth::user();
        $cart = $user->cart;
        
        if ($cart) {
            // Delete all items in the cart
            $cart->items()->delete();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully.',
            'data' => [
                'items' => [],
                'totalItems' => 0,
                'totalPrice' => 0
            ]
        ]);
    }
} 
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get the current user's or guest's cart with items.
     */
    public function getCart(Request $request)
    {
        try {
            $cart = null;
            
            if (Auth::check()) {
                $user = Auth::user();
                $cart = Cart::with(['items.product'])->where('user_id', $user->id)->first();
            } else {
                $guestId = $request->header('X-Guest-ID');
                if ($guestId) {
                    $cart = Cart::with(['items.product'])->where('guest_id', $guestId)->first();
                }
            }

            if (!$cart) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'items' => [],
                        'total' => 0,
                    ],
                ]);
            }

            // Filter and transform items
            $cart->items = $cart->items->filter(function ($item) {
                return $item->product && $item->product->status === 'Available';
            })->map(function ($item) {
                if ($item->product && $item->product->image) {
                    $item->product->image = asset('storage/' . $item->product->image);
                }
                return $item;
            });

            // Calculate total
            $total = $cart->items->sum(function ($item) {
                return $item->product->price;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $cart->items,
                    'total' => $total,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add a product to the cart.
     */
    public function addToCart(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            // Check if product is available
            $product = Product::where('id', $request->product_id)
                ->where('status', 'Available')
                ->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is not available',
                ], 422);
            }

            $cart = null;
            
            if (Auth::check()) {
                // Get or create cart for authenticated user
                $user = Auth::user();
                $cart = Cart::firstOrCreate(['user_id' => $user->id]);
            } else {
                // Get or create cart for guest user
                $guestId = $request->header('X-Guest-ID');
                if (!$guestId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Guest ID is required',
                    ], 422);
                }
                
                $cart = Cart::firstOrCreate(['guest_id' => $guestId]);
            }

            // Check if product is already in cart
            $existingItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is already in cart',
                ], 422);
            }

            // Add item to cart
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
            ]);

            return $this->getCart($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add product to cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove an item from the cart.
     */
    public function removeFromCart(Request $request)
    {
        $cartItemId = $request->cart_item_id;
        try {
            $cart = null;
            
            if (Auth::check()) {
                $user = Auth::user();
                $cart = Cart::where('user_id', $user->id)->first();
            } else {
                $guestId = $request->header('X-Guest-ID');
                if ($guestId) {
                    $cart = Cart::where('guest_id', $guestId)->first();
                }
            }

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found',
                ], 404);
            }

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('id', $cartItemId)
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found',
                ], 404);
            }

            $cartItem->delete();

            return $this->getCart($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove product from cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear the cart (remove all items).
     */
    public function clearCart(Request $request)
    {
        try {
            $cart = null;
            
            if (Auth::check()) {
                $user = Auth::user();
                $cart = Cart::where('user_id', $user->id)->first();
            } else {
                $guestId = $request->header('X-Guest-ID');
                if ($guestId) {
                    $cart = Cart::where('guest_id', $guestId)->first();
                }
            }

            if ($cart) {
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
} 
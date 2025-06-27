<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CartController extends Controller
{
    /**
     * Get the current user's or guest's cart with items.
     */
    public function getCart(Request $request)
    {
        try {
            $cart = null;
            $user = Auth::user();
            
            if (Auth::check()) {
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
            $cart->items = $cart->items->map(function ($item) {
                if ($item->product->status === Product::STATUS_ON_HOLD) {
                    $item->product->releaseHoldIfExpired();
                    $item->product->refresh(); // Refresh the model to get updated status
                }
    
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
    
    private function getGuestId(Request $request)
    {
        // Try to get guest_id from header first
        $guestId = $request->header('X-Guest-ID');
        
        // If not in header, try request body
        if (!$guestId) {
            $guestId = $request->input('guest_id');
        }

        return $guestId;
    }

    public function putProductsOnHold(Request $request)
    {
        $guestId = $this->getGuestId($request);

        // For guest routes, guest_id is required
        if (!auth()->id() && !$guestId) {
            return response()->json([
                'success' => false,
                'message' => 'Guest ID is required',
            ], 422);
        }

        if(auth()->id()){
            $cart = Cart::with(['items.product'])
            ->where('user_id', auth()->id())
            ->first();
        } else {
            $cart = Cart::with(['items.product'])
            ->where('guest_id', $guestId)
            ->first();
        }

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty',
            ], 400);
        }

        $type = auth()->id() ? 'user' : 'guest';
        $id = auth()->id() ?? $guestId;
        $holdDuration = Setting::where('key', 'product_hold_duration')->value('value') ?? 30;

        foreach ($cart->items as $item) {
            $product = $item->product;
            
            // Skip if product is already held by this user/guest
            if ($product->isHeldBy($type, $id)) {
                continue;
            }

            // Check if product is held by someone else
            if ($product->status === Product::STATUS_ON_HOLD) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some products in your cart are no longer available',
                ], 200);
            }

            $product->putOnHold($type, $id);
        }
        $holdUntil = Carbon::parse($cart->items->first()->product->onhold_at)
            ->addMinutes((int) ($holdDuration ?? 30));
        
        $diffInSeconds = $holdUntil->diffInSeconds(now());

        return response()->json([
            'success' => true,
            'message' => 'Products put on hold',
            'hold_duration' => $holdDuration,
            'hold_expiry_time_in_seconds' => $diffInSeconds,
            'is_hold_expired' => $holdUntil->isPast(),
        ]);
    }
} 
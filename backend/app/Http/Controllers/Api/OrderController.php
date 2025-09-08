<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Models\UserProfile;
use App\Models\GuestProfile;

class OrderController extends Controller
{
    /**
     * Create a new order from the user's cart.
     */
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'instagram_username' => 'required|string|max:255',
            'address_line1' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:255',
            'payment_proof' => 'required|image|max:5120', // 5MB max
            'shipping_fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $cart = $user->cart()->with(['items.product'])->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty',
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Calculate total amount
            $totalAmount = 0;
            foreach ($cart->items as $item) {
                $totalAmount += $item->product->price;
            }

            // Handle payment proof upload
            $paymentProofPath = null;
            if ($request->hasFile('payment_proof')) {
                $file = $request->file('payment_proof');
                $paymentProofPath = $file->store('payment_proofs', 'public');
            }

            // Create order
            $order = new Order([
                'user_id' => $user->id,
                'status' => Order::STATUS_PENDING,
                'customer_name' => $request->customer_name,
                'instagram_username' => $request->instagram_username,
                'address_line1' => $request->address_line1,
                'barangay' => $request->barangay,
                'province' => $request->province,
                'city' => $request->city,
                'mobile_number' => $request->mobile_number,
                'payment_method' => 'bank_transfer', // Currently only supporting bank transfers
                'payment_proof' => $paymentProofPath,
                'total_amount' => $totalAmount,
                'shipping_fee' => $request->input('shipping_fee', 0),
            ]);
            $order->save();

            // Create order items and mark products as sold
            foreach ($cart->items as $cartItem) {
                // Check if product is available
                $product = Product::where('id', $cartItem->product->id)
                ->where(function ($query) use ($user) {
                    $query->where('status', 'Available')
                          ->orWhere(function ($q) use ($user) {
                              $q->where('status', 'OnHold')
                                ->where('onhold_by_type', 'user')
                                ->where('onhold_by_id', $user->id);
                          });
                })
                ->first();

                if (!$product) {
                    throw new \Exception("Product {$cartItem->product->name} is no longer available.");
                }

                $orderItem = new OrderItem([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product->id,
                    'product_name' => $cartItem->product->name,
                    'price' => $cartItem->product->price,
                ]);
                $orderItem->save();

                // Mark the product as sold
                $product->status = 'Pending';
                $product->save();
            }

            // Clear the cart
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order->load('items'),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new order from a guest cart.
     */
    public function createGuestOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'instagram_username' => 'required|string|max:255',
            'address_line1' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:255',
            'payment_proof' => 'required|image|max:5120', // 5MB max
            'cart_items' => 'required|json',
            'shipping_fee' => 'nullable|numeric|min:0',
            'guest_id' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Save or update guest profile
            $profile = GuestProfile::findByGuestId($request->guest_id);
            if (!$profile) {
                $profile = new GuestProfile();
                $profile->guest_id = $request->guest_id;
            }

            $profile->fill([
                'customer_name' => $request->customer_name,
                'email' => $request->email,
                'instagram_username' => $request->instagram_username,
                'address_line1' => $request->address_line1,
                'barangay' => $request->barangay,
                'province' => $request->province,
                'city' => $request->city,
                'mobile_number' => $request->mobile_number,
            ]);
            $profile->save();

            // Parse the cart items from JSON
            $cartItems = json_decode($request->cart_items, true);
            $cart = Cart::with(['items.product'])->where('guest_id', $profile->guest_id)->first();
            

            if (!$cart || $cart->items->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your cart is empty',
                ], 422);
            }

            // Calculate total amount and verify products
            $totalAmount = 0;
            $orderItems = [];
            
            
            // Handle payment proof upload
            $paymentProofPath = null;
            if ($request->hasFile('payment_proof')) {
                $file = $request->file('payment_proof');
                $paymentProofPath = $file->store('payment_proofs', 'public');
            }

            // Create order
            $order = new Order([
                'user_id' => null, // Guest order, no user ID
                'guest_id' => $request->guest_id,
                'status' => Order::STATUS_PENDING,
                'customer_name' => $request->customer_name,
                'email' => $request->email,
                'instagram_username' => $request->instagram_username,
                'address_line1' => $request->address_line1,
                'barangay' => $request->barangay,
                'province' => $request->province,
                'city' => $request->city,
                'mobile_number' => $request->mobile_number,
                'payment_method' => 'bank_transfer',
                'payment_proof' => $paymentProofPath,
                'total_amount' => $totalAmount,
                'shipping_fee' => $request->input('shipping_fee', 0),
            ]);
            $order->save();
            // Create order items and mark products as sold
            foreach ($cart->items as $cartItem) {
                // Check if product is available
                $product = Product::where('id', $cartItem->product->id)
                ->where(function ($query) use ($profile) {
                    $query->where('status', 'Available')
                          ->orWhere(function ($q) use ($profile) {
                              $q->where('status', 'OnHold')
                                ->where('onhold_by_type', 'guest')
                                ->where('onhold_by_id', $profile->guest_id);
                          });
                })
                ->first();

                if (!$product) {
                    throw new \Exception("Product {$cartItem->product->name} is no longer available.");
                }

                $orderItem = new OrderItem([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product->id,
                    'product_name' => $cartItem->product->name,
                    'price' => $cartItem->product->price,
                ]);
                $orderItem->save();

                // Mark the product as sold
                $product->status = 'Sold';
                $product->save();
            }

            // Clear the cart
            $cart->items()->delete();
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order->load('items'),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all orders for the authenticated user.
     */
    public function getUserOrders()
    {
        $user = Auth::user();
        $orders = Order::with('items.product')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders,
            ],
        ]);
    }

    /**
     * Get a specific order for the authenticated user.
     */
    public function getUserOrder($id)
    {
        $user = Auth::user();
        $order = Order::with('items.product')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
            ],
        ]);
    }

    /**
     * Admin: Get all orders.
     */
    public function getAllOrders(Request $request)
    {
        $orders = Order::with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders,
            ],
        ]);
    }

    /**
     * Admin: Update order status.
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:' . implode(',', Order::STATUSES),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $order = Order::with('items.product')->findOrFail($id);

            // Prevent updates if order is already cancelled
            if ($order->status === Order::STATUS_CANCELLED) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update status of a cancelled order',
                ], 422);
            }

            // If updating to cancelled status, mark all products as available
            if ($request->status === Order::STATUS_CANCELLED) {
                foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->status = 'Available';
                        $item->product->save();
                    }
                }
            }
            
            if ($request->status === Order::STATUS_PENDING) {
                foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->status = 'Pending';
                        $item->product->save();
                    }
                }
            }
            
            if ($request->status === Order::STATUS_APPROVED || $request->status === Order::STATUS_SHIPPED || $request->status === Order::STATUS_DELIVERED) {
                foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->status = 'SOLD';
                        $item->product->save();
                    }
                }

                // If the order is being approved, add it to Google Sheets
                if ($request->status === Order::STATUS_APPROVED) {
                    try {
                        $googleSheetsService = new \App\Services\GoogleSheetsService();
                        $googleSheetsService->appendOrderData($order);
                    } catch (\Exception $e) {
                        \Log::error('Failed to add order to Google Sheets: ' . $e->getMessage());
                        // Don't throw the exception - we don't want to block the order status update
                        // if Google Sheets sync fails
                    }
                }
            }

            $order->status = $request->status;
            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'order' => $order->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Get a specific order.
     */
    public function getOrder($id)
    {
        $order = Order::with('items.product')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
            ],
        ]);
    }

    /**
     * Get all orders for a guest by guest_id.
     */
    public function getGuestOrders($guestId)
    {
        $orders = Order::with('items.product')
            ->where('guest_id', $guestId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders,
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'user_id' => 'nullable|exists:users,id',
                'guest_id' => 'nullable|string',
                'email' => 'required|email',
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'phone' => 'required|string',
                'address' => 'required|string',
                'city' => 'required|string',
                'province' => 'required|string',
                'postal_code' => 'required|string',
                'total_amount' => 'required|numeric',
                'shipping_fee' => 'required|numeric',
                'items' => 'required|array',
                'items.*.product_id' => 'required|exists:products,id',
            ]);

            DB::beginTransaction();

            // Create the order
            $order = Order::create([
                'user_id' => $validatedData['user_id'] ?? null,
                'guest_id' => $validatedData['guest_id'] ?? null,
                'email' => $validatedData['email'],
                'first_name' => $validatedData['first_name'],
                'last_name' => $validatedData['last_name'],
                'phone' => $validatedData['phone'],
                'address' => $validatedData['address'],
                'city' => $validatedData['city'],
                'province' => $validatedData['province'],
                'postal_code' => $validatedData['postal_code'],
                'total_amount' => $validatedData['total_amount'],
                'shipping_fee' => $validatedData['shipping_fee'],
                'status' => 'pending'
            ]);

            // Create order items and mark products as sold
            foreach ($validatedData['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id']
                ]);

                // Mark the product as sold
                Product::where('id', $item['product_id'])->update(['status' => 'Sold']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order->load('items.product')
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
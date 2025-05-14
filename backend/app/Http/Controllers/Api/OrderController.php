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
            'city' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:255',
            'payment_proof' => 'required|image|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $cart = $user->cart()->with(['items.product.sizes'])->first();

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
                $totalAmount += $item->product->price * $item->quantity;
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
                'city' => $request->city,
                'mobile_number' => $request->mobile_number,
                'payment_method' => 'bank_transfer', // Currently only supporting bank transfers
                'payment_proof' => $paymentProofPath,
                'total_amount' => $totalAmount,
            ]);
            $order->save();

            // Create order items
            foreach ($cart->items as $cartItem) {
                $orderItem = new OrderItem([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product->id,
                    'product_name' => $cartItem->product->name,
                    'size' => $cartItem->size,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->product->price,
                ]);
                $orderItem->save();

                // Put the product on hold by reducing available stock
                $productSize = ProductSize::where('product_id', $cartItem->product->id)
                    ->where('size', $cartItem->size)
                    ->first();

                if ($productSize) {
                    $productSize->stock -= $cartItem->quantity;
                    $productSize->save();
                }
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
        $orders = $user->orders()->with('items')->orderBy('created_at', 'desc')->get();

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
        $order = $user->orders()->with('items')->find($id);

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
        $query = Order::with('items', 'user');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Order by created_at desc by default
        $orders = $query->orderBy('created_at', 'desc')->get();

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
            'status' => 'required|string|in:pending,approved,shipped,delivered,cancelled',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::with('items')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        try {
            DB::beginTransaction();

            $oldStatus = $order->status;
            $order->status = $request->status;

            // If admin notes are provided, update them
            if ($request->has('admin_notes')) {
                $order->admin_notes = $request->admin_notes;
            }

            // If order is being approved now, set approved_at timestamp
            if ($request->status === Order::STATUS_APPROVED && $oldStatus === Order::STATUS_PENDING) {
                $order->approved_at = now();
            }

            // If order is being cancelled, return stock
            if ($request->status === Order::STATUS_CANCELLED && $oldStatus !== Order::STATUS_CANCELLED) {
                foreach ($order->items as $item) {
                    $productSize = ProductSize::where('product_id', $item->product_id)
                        ->where('size', $item->size)
                        ->first();

                    if ($productSize) {
                        $productSize->stock += $item->quantity;
                        $productSize->save();
                    }
                }
            }

            $order->save();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'order' => $order->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Get a specific order.
     */
    public function getOrder($id)
    {
        $order = Order::with(['items', 'user'])->find($id);

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
} 
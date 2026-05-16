<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\ProcessGCashRequest;
use App\Http\Requests\OrderIdRequest;
use Illuminate\Support\Facades\Auth;

class PaymentController extends BaseController
{
    /**
     * Get payment history (for customers - their own, for admins - all)
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user instanceof User) {
                return $this->sendError('Unauthorized', 401);
            }

            // Customers see only their own payments
            if ($user->hasRole('customer')) {
                $query = Payment::whereHas('order', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            } else if ($user->hasAnyRole(['admin', 'super-admin'])) {
                // Admins see all payments
                $query = Payment::query();
            } else {
                return $this->sendError('Unauthorized', 403);
            }

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->has('method')) {
                $query->where('method', $request->input('method'));
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->input('date_from'));
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->input('date_to'));
            }

            if ($request->has('min_amount')) {
                $query->where('amount', '>=', $request->input('min_amount'));
            }

            if ($request->has('max_amount')) {
                $query->where('amount', '<=', $request->input('max_amount'));
            }

            // Load relationships and paginate
            $payments = $query->with(['order.user', 'order.orderItems.product'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return $this->sendResponse($payments, 'Payment history retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve payment history', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get a single payment record with details
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            if (!$user instanceof User) {
                return $this->sendError('Unauthorized', 401);
            }

            // Build query based on user role
            if ($user->hasRole('customer')) {
                $payment = Payment::whereHas('order', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->where('id', $id)
                  ->with(['order.user', 'order.orderItems.product', 'order.deliveryAddress'])
                  ->first();
            } else if ($user->hasAnyRole(['admin', 'super-admin'])) {
                $payment = Payment::where('id', $id)
                    ->with(['order.user', 'order.orderItems.product', 'order.deliveryAddress'])
                    ->first();
            } else {
                return $this->sendError('Unauthorized', 403);
            }

            if (!$payment) {
                return $this->sendError('Payment record not found', 404);
            }

            return $this->sendResponse($payment, 'Payment record retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve payment record', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Process GCash payment
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function processGCash(ProcessGCashRequest $request)
    {
        try {
            $data = $request->validated();

            $user = Auth::user();

            $orderId = $data['order_id'];
            $order = Order::where('user_id', $user->id)
                ->where('id', $orderId)
                ->first();

            if (!$order) {
                return $this->sendError('Order not found', 404);
            }

            if ($order->payment_status === 'paid') {
                return $this->sendError('Order already paid', 400);
            }

            // TODO: Integrate with actual GCash API in production
            // For now, simulate payment processing

            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $order->total_amount,
                'method' => 'gcash',
                'transaction_id' => $data['gcash_reference'],
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            // Update order payment status
            $order->payment_status = 'paid';
            $order->save();

            $order->load('orderItems.product');

            return $this->sendResponse([
                'order' => $order,
                'payment' => $payment,
            ], 'Payment processed successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Payment processing failed', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Process Maya payment
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function processMaya(OrderIdRequest $request)
    {
        try {
            $data = $request->validated();

            $user = Auth::user();
            $orderId = $data['order_id'];
            $order = Order::where('user_id', $user->id)
                ->where('id', $orderId)
                ->first();

            if (!$order) {
                return $this->sendError('Order not found', 404);
            }

            if ($order->payment_status === 'paid') {
                return $this->sendError('Order already paid', 400);
            }

            // Create Maya payment
            $gateway = \App\Services\Payment\PaymentGatewayFactory::create('maya');
            $result = $gateway->createPayment([
                'amount' => $order->total_amount,
                'currency' => 'PHP',
                'order_id' => $order->id,
                'customer_email' => $user->email,
                'description' => "Order #{$order->id} Payment",
            ]);

            if (!$result['success']) {
                return $this->sendError($result['message'], 400);
            }

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $order->total_amount,
                'method' => 'maya',
                'transaction_id' => $result['transaction_id'],
                'status' => 'pending',
            ]);

            return $this->sendResponse([
                'payment' => $payment,
                'payment_url' => $result['payment_url'],
                'transaction_id' => $result['transaction_id'],
            ], 'Maya payment initiated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Maya payment processing failed', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Record cash payment
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recordCash(OrderIdRequest $request)
    {
        try {
            $data = $request->validated();

            $user = Auth::user();

            $orderId = $data['order_id'];
            $order = Order::where('user_id', $user->id)
                ->where('id', $orderId)
                ->first();

            if (!$order) {
                return $this->sendError('Order not found', 404);
            }

            if ($order->payment_method !== 'cash') {
                return $this->sendError('Order payment method is not cash', 400);
            }

            if ($order->payment_status === 'paid') {
                return $this->sendError('Order already marked as paid', 400);
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $order->total_amount,
                'method' => 'cash',
                'transaction_id' => 'CASH-' . $order->order_number,
                'status' => 'pending',
                'paid_at' => null, // Will be updated when staff confirms receipt
            ]);

            // Keep payment status as pending for cash until confirmed by staff
            $order->payment_status = 'pending';
            $order->save();

            $order->load('orderItems.product');

            return $this->sendResponse([
                'order' => $order,
                'payment' => $payment,
            ], 'Cash payment recorded successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to record cash payment', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Check payment status
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkStatus($id)
    {
        try {
            $user = Auth::user();

            $payment = Payment::whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->where('id', $id)
              ->with('order')
              ->first();

            if (!$payment) {
                return $this->sendError('Payment not found', 404);
            }

            return $this->sendResponse($payment, 'Payment status retrieved successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve payment status', 500, ['error' => $e->getMessage()]);
        }
    }
}

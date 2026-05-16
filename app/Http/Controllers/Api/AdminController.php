<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Events\OrderStatusUpdated;
use App\Notifications\OrderStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class AdminController extends BaseController
{
    /**
     * Get all users with pagination and filters
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUsers(Request $request)
    {
        try {
            $query = User::with('roles');

            // Include trashed users if filtering by inactive, otherwise only active
            if ($request->has('status') && $request->input('status') === 'inactive') {
                $query->onlyTrashed();
            } else {
                $query->whereNull('deleted_at');
            }

            // Filter by role
            if ($request->has('role')) {
                $roleName = $request->input('role');
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('name', $roleName);
                });
            }

            // Search by name or email
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $users = $query->paginate($request->get('per_page', 15));

            // Add status to each user
            $users->getCollection()->transform(function ($user) {
                $user->status = $user->trashed() ? 'inactive' : 'active';
                return $user;
            });

            return $this->sendResponse($users, 'Users retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve users', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get single user details
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUser($id)
    {
        try {
            $user = User::with([
                'roles',
                'customerProfile',
                'orders' => function ($query) {
                    $query->with(['orderItems.product:id,name,price'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10); // Limit to prevent loading too many orders
                }
            ])->findOrFail($id);

            return $this->sendResponse($user, 'User details retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('User not found', 404, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Create new user
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createUser(\App\Http\Requests\CreateUserRequest $request)
    {
        try {
            $data = $request->validated();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // Assign role
            $user->assignRole($data['role']);

            return $this->sendResponse($user->load('roles'), 'User created successfully', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to create user', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Update user
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUser(\App\Http\Requests\UpdateUserRequest $request, $id)
    {
        try {
            $data = $request->validated();

            $user = User::findOrFail($id);

            // Update basic info
            if (isset($data['name'])) {
                $user->name = $data['name'];
            }
            if (isset($data['email'])) {
                $user->email = $data['email'];
            }
            if (isset($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            $user->save();

            // Update role if provided
            if (isset($data['role'])) {
                $user->syncRoles([$data['role']]);
            }

            return $this->sendResponse($user->load('roles'), 'User updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to update user', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Deactivate user (soft delete)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deactivateUser($id)
    {
        try {
            $user = User::findOrFail($id);
            $currentUser = Auth::id();

            // Prevent self-deactivation
            if ($user->id === $currentUser) {
                return $this->sendError('Cannot deactivate your own account', 403);
            }

            $user->delete();

            return $this->sendResponse(null, 'User deactivated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to deactivate user', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Reactivate user
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reactivateUser($id)
    {
        try {
            $user = User::withTrashed()->findOrFail($id);
            $user->restore();

            return $this->sendResponse($user, 'User reactivated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to reactivate user', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get user statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserStatistics()
    {
        try {
            $connection = DB::connection()->getDriverName();
            $today = today()->toDateString();
            $startOfWeek = now()->startOfWeek()->toDateTimeString();
            $endOfWeek = now()->endOfWeek()->toDateTimeString();
            $month = now()->month;
            $year = now()->year;
            $monthStart = now()->startOfMonth()->toDateTimeString();
            $monthEnd = now()->endOfMonth()->toDateTimeString();

            // Build database-agnostic query for user counts
            // For SQLite, we use BETWEEN for month filtering; for MySQL, we can use MONTH/YEAR
            if ($connection === 'sqlite') {
                $userCounts = DB::selectOne("
                    SELECT
                        COUNT(*) as total_users,
                        SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as active_users,
                        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) as inactive_users,
                        SUM(CASE WHEN deleted_at IS NULL AND DATE(created_at) = ? THEN 1 ELSE 0 END) as new_users_today,
                        SUM(CASE WHEN deleted_at IS NULL AND created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) as new_users_this_week,
                        SUM(CASE WHEN deleted_at IS NULL AND created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) as new_users_this_month
                    FROM users
                ", [
                    $today,
                    $startOfWeek,
                    $endOfWeek,
                    $monthStart,
                    $monthEnd,
                ]);
            } else {
                // MySQL-compatible version with MONTH/YEAR functions
                $userCounts = DB::selectOne("
                    SELECT
                        COUNT(*) as total_users,
                        SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) as active_users,
                        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) as inactive_users,
                        SUM(CASE WHEN deleted_at IS NULL AND DATE(created_at) = ? THEN 1 ELSE 0 END) as new_users_today,
                        SUM(CASE WHEN deleted_at IS NULL AND created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) as new_users_this_week,
                        SUM(CASE WHEN deleted_at IS NULL AND MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as new_users_this_month
                    FROM users
                ", [
                    $today,
                    $startOfWeek,
                    $endOfWeek,
                    $month,
                    $year,
                ]);
            }

            // Single query for all role counts
            $roleCounts = DB::table('model_has_roles')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->join('users', 'model_has_roles.model_id', '=', 'users.id')
                ->whereNull('users.deleted_at')
                ->whereIn('roles.name', ['customer', 'barista', 'manager', 'admin'])
                ->selectRaw('roles.name, COUNT(*) as count')
                ->groupBy('roles.name')
                ->pluck('count', 'name');

            $stats = [
                'total_users'   => (int) $userCounts->total_users,
                'active_users'  => (int) $userCounts->active_users,
                'inactive_users'=> (int) $userCounts->inactive_users,
                'by_role' => [
                    'customers' => (int) ($roleCounts['customer'] ?? 0),
                    'baristas'  => (int) ($roleCounts['barista'] ?? 0),
                    'managers'  => (int) ($roleCounts['manager'] ?? 0),
                    'admins'    => (int) ($roleCounts['admin'] ?? 0),
                ],
                'new_users_today'      => (int) $userCounts->new_users_today,
                'new_users_this_week'  => (int) $userCounts->new_users_this_week,
                'new_users_this_month' => (int) $userCounts->new_users_this_month,
            ];

            return $this->sendResponse($stats, 'User statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve statistics', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get all orders (Admin access)
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllOrders(Request $request)
    {
        try {
            $query = Order::with(['user', 'orderItems.product']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            // Filter by payment status
            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->input('payment_status'));
            }

            // Filter by order type
            if ($request->has('order_type')) {
                $query->where('order_type', $request->input('order_type'));
            }

            // Search by order number or customer name
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            // Date range filter
            if ($request->has('start_date')) {
                $query->whereDate('created_at', '>=', $request->input('start_date'));
            }
            if ($request->has('end_date')) {
                $query->whereDate('created_at', '<=', $request->input('end_date'));
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $orders = $query->paginate($request->get('per_page', 15));

            return $this->sendResponse($orders, 'Orders retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve orders', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get order details (Admin access)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrderDetails($id)
    {
        try {
            $order = Order::with(['user', 'orderItems.product', 'deliveryAddress'])
                ->findOrFail($id);

            return $this->sendResponse($order, 'Order details retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Order not found', 404, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Update order status (Admin access)
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateOrderStatus(\App\Http\Requests\UpdateOrderStatusRequest $request, $id)
    {
        try {
            $data = $request->validated();

            $order = Order::findOrFail($id);
            $oldStatus = $order->status;
            $newStatus = $data['status'];
            /** @var User|null $actor */
            $actor = Auth::user();

            // Create status history entry (store as JSON in a note or just log it)
            $statusHistory = [
                'from' => $oldStatus,
                'to' => $newStatus,
                'timestamp' => now()->toIso8601String(),
                'updated_by' => $actor?->name ?? 'Admin'
            ];

            // For now, we'll just log the status change since status_history column doesn't exist
            // You might want to add a status_history column or use a separate table for this
            Log::info('Order status changed', $statusHistory);

            $order->status = $newStatus;

            // Set completed_at timestamp when status is completed
            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                $order->completed_at = now();
            }

            // Set prepared_at timestamp when status is ready
            if ($newStatus === 'ready' && $oldStatus !== 'ready') {
                $order->prepared_at = now();
            }

            $order->save();

            // Broadcast real-time event and send notification to customer
            event(new OrderStatusUpdated($order, $oldStatus, $newStatus, $actor));

            if ($order->user) {
                $notifType = match ($newStatus) {
                    'preparing' => 'status_update',
                    'ready'     => 'order_ready',
                    'completed' => 'order_completed',
                    'cancelled' => 'order_cancelled',
                    default     => 'status_update',
                };
                $order->user->notify(new OrderStatusNotification($order, $notifType));
            }

            return $this->sendResponse($order->load(['user', 'orderItems.product']), 'Order status updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to update order status', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Soft delete an order (admin archive only)
     *
     * Active orders should move through cancellation/status updates first.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteOrder($id)
    {
        try {
            $order = Order::findOrFail($id);

            if (in_array($order->status, ['pending', 'confirmed', 'preparing', 'ready'])) {
                return $this->sendError('Active orders must be cancelled or completed before deletion', 400, [
                    'current_status' => $order->status,
                ]);
            }

            $order->delete();

            return $this->sendResponse(null, 'Order deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete order', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get dashboard statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboardStats()
    {
        try {
            // Single query for order stats instead of 2 separate queries
            $orderStats = Order::selectRaw("
                COUNT(*) as total_orders,
                SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
            ")->first();

            $stats = [
                'totalOrders' => (int) $orderStats->total_orders,
                'totalUsers' => User::count(),
                'totalProducts' => Product::count(),
                'totalRevenue' => (float) ($orderStats->total_revenue ?? 0),
            ];

            // Get recent orders
            $recentOrders = Order::with(['user', 'orderItems'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $data = [
                'stats' => $stats,
                'recentOrders' => $recentOrders,
            ];

            return $this->sendResponse($data, 'Dashboard statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve dashboard statistics', 500, ['error' => $e->getMessage()]);
        }
    }
}

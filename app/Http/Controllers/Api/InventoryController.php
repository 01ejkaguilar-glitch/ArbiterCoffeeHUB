<?php

namespace App\Http\Controllers\Api;

use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Events\LowStockAlert;
use Illuminate\Http\Request;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Http\Requests\AdjustStockRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryController extends BaseController
{
    /**
     * Get all inventory items
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = InventoryItem::query();

            // Search by name
            $search = $request->input('search');
            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }

            // Filter by type
            $type = $request->input('type');
            if ($type && $type !== 'all') {
                $query->where('type', $type);
            }

            // Filter by stock status
            $status = $request->input('status');
            if ($status === 'low_stock') {
                $query->whereRaw('quantity <= reorder_level')->where('quantity', '>', 0);
            } elseif ($status === 'out_of_stock') {
                $query->where('quantity', '<=', 0);
            } elseif ($status === 'in_stock') {
                $query->whereRaw('quantity > reorder_level');
            }

            // Filter by low stock (legacy param)
            if ($request->boolean('low_stock')) {
                $query->whereRaw('quantity <= reorder_level');
            }

            $items = $query->orderBy('name', 'asc')->paginate($request->get('per_page', 50));

            return $this->sendResponse($items, 'Inventory items retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve inventory items', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get single inventory item
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $item = InventoryItem::with(['logs' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            }])->findOrFail($id);

            return $this->sendResponse($item, 'Inventory item retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Inventory item not found', 404, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Create new inventory item
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreInventoryRequest $request)
    {
        try {
            $item = InventoryItem::create($request->validated());

            // Log initial stock
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'type' => 'restock',
                'quantity' => $item->quantity,
                'notes' => 'Initial stock',
                'user_id' => Auth::id(),
            ]);

            return $this->sendResponse($item, 'Inventory item created successfully', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to create inventory item', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Update inventory item
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateInventoryRequest $request, $id)
    {
        try {
            $item = InventoryItem::findOrFail($id);
            $item->update($request->validated()); // Quantity changes through adjustStock only

            return $this->sendResponse($item, 'Inventory item updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to update inventory item', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete inventory item
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $item = InventoryItem::findOrFail($id);
            $item->delete();

            return $this->sendResponse(null, 'Inventory item deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete inventory item', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Adjust inventory quantity (restock or usage)
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function adjustStock(AdjustStockRequest $request, $id)
    {
        try {
            $data = $request->validated();

            DB::beginTransaction();

            $item = InventoryItem::findOrFail($id);
            $oldQuantity = $item->quantity;

            $type = $data['type'];
            $quantity = $data['quantity'];

            // Calculate new quantity based on type
            if ($type === 'restock' || $type === 'adjustment') {
                $newQuantity = $oldQuantity + abs($quantity);
            } else {
                $newQuantity = $oldQuantity - abs($quantity);
            }

            if ($newQuantity < 0) {
                DB::rollBack();
                return $this->sendError('Insufficient stock', 400);
            }

            $item->quantity = $newQuantity;
            $item->save();

            // Create log
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'type' => $type,
                'quantity' => abs($quantity),
                'notes' => $data['notes'] ?? null,
                'user_id' => Auth::id(),
            ]);

            DB::commit();

            // Dispatch low stock alert if quantity dropped to/below reorder level
            if ($newQuantity <= $item->reorder_level && $oldQuantity > $item->reorder_level) {
                event(new LowStockAlert($item));
            }

            $item->load(['logs' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            }]);

            return $this->sendResponse($item, 'Stock adjusted successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Failed to adjust stock', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get low stock items
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLowStock()
    {
        try {
            $items = InventoryItem::whereRaw('quantity <= reorder_level')
                ->orderBy('quantity', 'asc')
                ->get();

            return $this->sendResponse($items, 'Low stock items retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve low stock items', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get inventory logs
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLogs(Request $request)
    {
        try {
            $query = InventoryLog::with(['inventoryItem', 'user']);

            // Filter by item
            $itemId = $request->input('item_id');
            if ($itemId !== null) {
                $query->where('inventory_item_id', $itemId);
            }

            // Filter by type
            $type = $request->input('type');
            if ($type !== null) {
                $query->where('type', $type);
            }

            // Filter by date range
            $startDate = $request->input('start_date');
            if ($startDate !== null) {
                $query->whereDate('created_at', '>=', $startDate);
            }
            $endDate = $request->input('end_date');
            if ($endDate !== null) {
                $query->whereDate('created_at', '<=', $endDate);
            }

            $logs = $query->orderBy('created_at', 'desc')->paginate(50);

            return $this->sendResponse($logs, 'Inventory logs retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve inventory logs', 500, ['error' => $e->getMessage()]);
        }
    }
}

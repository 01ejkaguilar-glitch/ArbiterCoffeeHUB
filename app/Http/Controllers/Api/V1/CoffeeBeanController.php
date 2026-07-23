<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Models\CoffeeBean;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCoffeeBeanRequest;
use App\Http\Requests\UpdateCoffeeBeanRequest;
use App\Traits\HasSorting;

class CoffeeBeanController extends BaseController
{
    use HasSorting;
    /**
     * Display a listing of coffee beans.
     */
    public function index(Request $request)
    {
        $query = CoffeeBean::query();

        // Filter by featured status
        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Filter by origin country
        if ($request->has('origin_country') && $request->input('origin_country')) {
            $query->where('origin_country', $request->input('origin_country'));
        }

        // Filter by stock status
        if ($request->has('stock_status')) {
            switch ($request->input('stock_status')) {
                case 'out_of_stock':
                    $query->where('stock_quantity', 0);
                    break;
                case 'low_stock':
                    $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<', 10);
                    break;
                case 'in_stock':
                    $query->where('stock_quantity', '>=', 10);
                    break;
            }
        }

        // Search
        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('origin_country', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%");
            });
        }

        // Sorting
        $this->applySorting($query, $request, ['id', 'name', 'origin_country', 'region', 'stock_quantity', 'is_featured', 'created_at', 'updated_at']);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $beans = $query->paginate($perPage);

        return $this->sendResponse($beans, 'Coffee beans retrieved successfully');
    }

    /**
     * Get today's featured coffee beans (public).
     */
    public function featured()
    {
        $featuredBeans = CoffeeBean::featured()
            ->take(2)
            ->get();

        return $this->sendResponse($featuredBeans, 'Featured coffee beans retrieved successfully');
    }

    /**
     * Store a newly created coffee bean.
     */
    public function store(StoreCoffeeBeanRequest $request)
    {
        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('storage/coffee-beans'), $imageName);
            $validated['image_url'] = '/storage/coffee-beans/' . $imageName;
        }

        // Remove the image field from validated data as we don't store it directly
        unset($validated['image']);

        $bean = CoffeeBean::create($validated);

        return $this->sendCreated($bean, 'Coffee bean created successfully');
    }

    /**
     * Display the specified coffee bean.
     */
    public function show($id)
    {
        $bean = CoffeeBean::find($id);

        if (!$bean) {
            return $this->sendNotFound('Coffee bean not found');
        }

        return $this->sendResponse($bean, 'Coffee bean retrieved successfully');
    }

    /**
     * Update the specified coffee bean.
     */
    public function update(UpdateCoffeeBeanRequest $request, $id)
    {
        $bean = CoffeeBean::find($id);

        if (!$bean) {
            return $this->sendNotFound('Coffee bean not found');
        }

        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($bean->image_url && file_exists(public_path($bean->image_url))) {
                unlink(public_path($bean->image_url));
            }

            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('storage/coffee-beans'), $imageName);
            $validated['image_url'] = '/storage/coffee-beans/' . $imageName;
        }

        // Remove the image field from validated data as we don't store it directly
        unset($validated['image']);

        $bean->update($validated);

        return $this->sendResponse($bean, 'Coffee bean updated successfully');
    }

    /**
     * Remove the specified coffee bean.
     */
    public function destroy($id)
    {
        $bean = CoffeeBean::find($id);

        if (!$bean) {
            return $this->sendNotFound('Coffee bean not found');
        }

        $bean->delete();

        return $this->sendResponse(null, 'Coffee bean deleted successfully');
    }
}

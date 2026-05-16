<?php

namespace App\Http\Controllers\Api;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends BaseController
{
    /**
     * Get all addresses for authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $user = Auth::user();
            $addresses = Address::where('user_id', $user->id)
                ->orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->sendResponse($addresses, 'Addresses retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve addresses', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Create a new address
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(\App\Http\Requests\StoreAddressRequest $request)
    {
        try {
            $data = $request->validated();

            $user = Auth::user();

            // If this is set as default, unset other defaults
            if (!empty($data['is_default']) && $request->boolean('is_default')) {
                Address::where('user_id', $user->id)
                    ->update(['is_default' => false]);
            }

            // If this is the first address, make it default
            $addressCount = Address::where('user_id', $user->id)->count();
            $isDefault = $addressCount === 0 ? true : ($request->boolean('is_default') || (!empty($data['is_default']) && $data['is_default']));

            $address = Address::create([
                'user_id' => $user->id,
                'type' => $request->input('type'),
                'street' => $request->input('street'),
                'city' => $request->input('city'),
                'province' => $request->input('province'),
                'postal_code' => $request->input('postal_code'),
                'is_default' => $isDefault,
            ]);

            return $this->sendResponse($address, 'Address created successfully', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to create address', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Update an existing address
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(\App\Http\Requests\UpdateAddressRequest $request, $id)
    {
        try {
            $data = $request->validated();

            $user = Auth::user();

            $address = Address::where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$address) {
                return $this->sendError('Address not found', 404);
            }

            // If setting as default, unset other defaults
            if (!empty($data['is_default']) && $request->boolean('is_default')) {
                Address::where('user_id', $user->id)
                    ->where('id', '!=', $id)
                    ->update(['is_default' => false]);
            }

            $address->update(array_filter($request->only([
                'type', 'street', 'city', 'province', 'postal_code', 'is_default'
            ]), function($v) { return $v !== null; }));

            return $this->sendResponse($address, 'Address updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to update address', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete an address
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();

            $address = Address::where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$address) {
                return $this->sendError('Address not found', 404);
            }

            $wasDefault = $address->is_default;
            $address->delete();

            // If deleted address was default, set another as default
            if ($wasDefault) {
                $newDefault = Address::where('user_id', $user->id)->first();
                if ($newDefault) {
                    $newDefault->update(['is_default' => true]);
                }
            }

            return $this->sendResponse(null, 'Address deleted successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to delete address', 500, ['error' => $e->getMessage()]);
        }
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Services\CustomerInsightsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

/**
 * Customer Insights Controller
 *
 * Provides API endpoints for customer behavior analysis and insights
 */
class CustomerInsightsController extends BaseController
{
    /**
     * @OA\Tag(
     *     name="Customer Insights",
     *     description="Endpoints for retrieving customer behavior insights and analytics"
     * )
     */
    protected $insightsService;

    public function __construct(CustomerInsightsService $insightsService)
    {
        $this->insightsService = $insightsService;
    }

    /**
     * Get comprehensive customer insights
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights",
     *     operationId="getCustomerInsights",
     *     tags={"Customer Insights"},
     *     summary="Get comprehensive customer insights",
     *     description="Returns detailed insights about customer behavior, preferences, and predictions",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Customer insights retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getCustomerInsights(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            // Admin can view any customer, regular users can only view themselves
            $customerId = $request->input('customer_id', $user->id);
            
            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own insights']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse($insights, 'Customer insights retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving insights', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get purchase behavior analysis
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights/purchase-behavior",
     *     operationId="getPurchaseBehavior",
     *     tags={"Customer Insights"},
     *     summary="Get purchase behavior analysis",
     *     description="Returns analysis of customer's purchasing patterns and habits",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Purchase behavior retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getPurchaseBehavior(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse(
                $insights['purchase_behavior'] ?? [],
                'Purchase behavior retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving purchase behavior', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get product affinity analysis
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights/product-affinity",
     *     operationId="getProductAffinity",
     *     tags={"Customer Insights"},
     *     summary="Get product affinity analysis",
     *     description="Returns analysis of customer's product preferences and affinities",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Product affinity retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getProductAffinity(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse(
                $insights['product_affinity'] ?? [],
                'Product affinity retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving product affinity', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get engagement score
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights/engagement-score",
     *     operationId="getEngagementScore",
     *     tags={"Customer Insights"},
     *     summary="Get engagement score",
     *     description="Returns customer's engagement score based on various factors",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Engagement score retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getEngagementScore(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse(
                $insights['engagement_score'] ?? [],
                'Engagement score retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving engagement score', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get lifecycle stage
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights/lifecycle-stage",
     *     operationId="getLifecycleStage",
     *     tags={"Customer Insights"},
     *     summary="Get lifecycle stage",
     *     description="Returns customer's lifecycle stage based on their behavior",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *        response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Lifecycle stage retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getLifecycleStage(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse(
                $insights['lifecycle_stage'] ?? [],
                'Lifecycle stage retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving lifecycle stage', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get actionable recommendations
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights/recommendations",
     *     operationId="getRecommendations",
     *     tags={"Customer Insights"},
     *     summary="Get actionable recommendations",
     *     description="Returns personalized recommendations for the customer",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array"),
     *             @OA\Property(property="message", type="string", example="Recommendations retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse(
                $insights['recommendations'] ?? [],
                'Recommendations retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
        }
    }

    /**
     * Get predictive insights
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights/predictions",
     *     operationId="getPredictions",
     *     tags={"Customer Insights"},
     *     summary="Get predictive insights",
     *     description="Returns predictive insights about customer's future behavior",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Predictions retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getPredictions(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse(
                $insights['predictions'] ?? [],
                'Predictions retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
        }
    }

    /**
     * Get satisfaction indicators
     *
     * @OA\Get(
     *     path="/api/v1/customer-insights/satisfaction",
     *     operationId="getSatisfactionIndicators",
     *     tags={"Customer Insights"},
     *     summary="Get satisfaction indicators",
     *     description="Returns satisfaction indicators for the customer",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to get insights for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Satisfaction indicators retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getSatisfactionIndicators(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $insights = $this->insightsService->generateCustomerInsights($customerId);

            return $this->sendResponse(
                $insights['satisfaction_indicators'] ?? [],
                'Satisfaction indicators retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
        }
    }

    /**
     * Clear customer insights cache
     *
     * @OA\Post(
     *     path="/api/v1/customer-insights/clear-cache",
     *     operationId="clearCustomerInsightsCache",
     *     tags={"Customer Insights"},
     *     summary="Clear customer insights cache",
     *     description="Clears the cached insights for a specific customer",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_id",
     *         in="query",
     *         description="ID of the customer to clear cache for (optional, defaults to authenticated user)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Customer insights cache cleared successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function clearCache(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            $customerId = $request->input('customer_id', $user->id);

            if (!$user->hasRole(['admin', 'super-admin']) && $customerId != $user->id) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $this->insightsService->clearCustomerInsightsCache($customerId);

            return $this->sendResponse([], 'Customer insights cache cleared successfully');
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
        }
    }

    /**
     * Get insights for multiple customers (Admin only)
     *
     * @OA\Post(
     *     path="/api/v1/admin/analytics/customer-insights/bulk",
     *     operationId="getBulkCustomerInsights",
     *     tags={"Customer Insights"},
     *     summary="Get insights for multiple customers",
     *     description="Returns insights for multiple customers (admin only)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="customer_ids",
     *         in="query",
     *         description="Array of customer IDs to get insights for",
     *         required=true,
     *         @OA\Schema(
     *             type="array",
     *             @OA\Items(type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Bulk insights retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     * @param Request $request
     * @return JsonResponse
     */
    public function getBulkInsights(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->sendUnauthorized('Authentication required');
            }

            if (!$user->hasRole(['admin', 'super-admin'])) {
                return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
            }

            $validator = Validator::make($request->all(), [
                'customer_ids' => 'required|array',
                'customer_ids.*' => 'integer|exists:users,id',
            ]);

            if ($validator->fails()) {
                return $this->sendValidationError($validator->errors()->toArray());
            }

            $customerIds = $request->input('customer_ids');
            $bulkInsights = [];

            foreach ($customerIds as $customerId) {
                $bulkInsights[$customerId] = $this->insightsService->generateCustomerInsights($customerId);
            }

            return $this->sendResponse($bulkInsights, 'Bulk insights retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Unauthorized', 403, ['error' => 'You can only view your own data']);
        }
    }
}

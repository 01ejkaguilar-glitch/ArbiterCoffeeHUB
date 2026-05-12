<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class TokenRefreshMiddleware
{
    /**
     * Handle an incoming request.
     *
     * This middleware allows expired tokens to be used for token refresh.
     * It validates that the token exists and belongs to a user, but doesn't
     * check expiration dates.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token required'
            ], 401);
        }

        // Find the token in the database (even if expired)
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ], 401);
        }

        // Get the tokenable (user) associated with the token
        $tokenable = $accessToken->tokenable;

        if (!$tokenable) {
            return response()->json([
                'success' => false,
                'message' => 'Token owner not found'
            ], 401);
        }

        // Authenticate the user using Sanctum's guard
        // We manually set the user on the guard to bypass expiration checks
        Auth::guard('sanctum')->setUser($tokenable);

        // Also set the user resolver for $request->user()
        $request->setUserResolver(function () use ($tokenable) {
            return $tokenable;
        });

        return $next($request);
    }
}

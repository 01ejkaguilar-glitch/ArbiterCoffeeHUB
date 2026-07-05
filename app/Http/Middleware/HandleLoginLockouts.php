<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

/**
 * Handle login lockouts middleware
 */
class HandleLoginLockouts
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check on login attempts
        if ($request->is('api/*/auth/login') && $request->method() === 'POST') {
            $email = $request->input('email');

            if ($email) {
                $user = \App\Models\User::where('email', $email)->first();

                if ($user && $user->isLocked()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
                    ], 423); // 423 Locked
                }
            }
        }

        return $next($request);
    }
}
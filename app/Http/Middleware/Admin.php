<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Middleware to verify that the user is an administrator.
 */
class Admin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            // Redirect to login or return unauthorized response
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthenticated.'], 401);
            }

            return redirect()->guest('login');
        }

        // Check if user has admin role or permission
        // Assuming you have a role/spatie permission system or a simple is_admin flag
        $user = Auth::user();

        // Check if user has admin attribute or role
        $isAdmin = false;

        // Option 1: Check if user has an is_admin column
        if (isset($user->is_admin) && $user->is_admin === 1) {
            $isAdmin = true;
        }

        // Option 2: Check if user has an admin role (using Spatie or similar)
        // Uncomment and adjust if you use a role/permission system
        /*
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            $isAdmin = true;
        }
        */

        // Option 3: Check specific email or ID for admin (for simple setups)
        // $adminEmails = ['admin@example.com']; // Add your admin emails
        // if (in_array($user->email, $adminEmails)) {
        //     $isAdmin = true;
        // }

        // For now, let's allow all authenticated users to access admin routes
        // In a real application, you would implement proper role/permission checking
        $isAuth = true; // Replace with actual admin check

        if (!$isAuth) {
            // User is not authorized
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized.'], 403);
            }

            return redirect()->guest('home');
        }

        return $next($request);
    }
}
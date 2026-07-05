<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class HttpsRedirectMiddleware
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
        // Redirect to HTTPS if not secure and not in local/testing environment
        if (!$request->secure() && $request->server('HTTP_HOST') !== 'localhost' && !$request->server('HTTP_HOST') === '127.0.0.1') {
            return Redirect::secure($request->getRequestUri());
        }

        return $next($request);
    }
}
<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Audit Logging Service
 *
 * Provides centralized audit logging for security and compliance purposes.
 * Logs authentication, authorization, and data modification events.
 */
class AuditLogService
{
    /**
     * Log authentication events (login, logout, failed attempts).
     *
     * @param string $event Type of auth event (login, logout, failed_login, etc.)
     * @param \Illuminate\Http\Request $request HTTP request instance
     * @param mixed $user User model or null for failed attempts
     * @param bool $success Whether the authentication attempt was successful
     * @return void
     */
    public function logAuthEvent(string $event, Request $request, $user = null, bool $success = true): void
    {
        $context = [
            'event_type' => 'authentication',
            'auth_event' => $event,
            'success' => $success,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_id' => $request->header('X-Request-ID'),
            'endpoint' => $request->path(),
            'method' => $request->method(),
        ];

        if ($user) {
            $context['user_id'] = $user->id;
            $context['user_email'] = $user->email ?? null;
            $context['user_type'] = get_class($user);
        } else {
            // For failed login attempts, try to get the email from request
            $context['attempted_email'] = $request->input('email');
        }

        // Log to security channel for authentication events
        if ($success) {
            Log::channel('security')->info("Authentication Success: {$event}", $context);
        } else {
            Log::channel('security')->warning("Authentication Failure: {$event}", $context);
        }
    }

    /**
     * Log authorization events (permission checks, role changes, access denials).
     *
     * @param string $event Type of auth event (permission_granted, permission_denied, role_changed, etc.)
     * @param \Illuminate\Http\Request $request HTTP request instance
     * @param mixed $user User model performing the action
     * @param string|null $resource Resource being accessed (optional)
     * @param string|null $permission Permission being checked (optional)
     * @param bool $granted Whether access was granted
     * @return void
     */
    public function logAuthzEvent(string $event, Request $request, $user, string $resource = null, string $permission = null, bool $granted = true): void
    {
        $context = [
            'event_type' => 'authorization',
            'authz_event' => $event,
            'granted' => $granted,
            'user_id' => $user->id ?? null,
            'user_email' => $user->email ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_id' => $request->header('X-Request-ID'),
            'endpoint' => $request->path(),
            'method' => $request->method(),
        ];

        if ($resource) {
            $context['resource'] = $resource;
        }

        if ($permission) {
            $context['permission'] = $permission;
        }

        // Log to security channel with appropriate level
        if ($granted) {
            Log::channel('security')->info("Authorization Granted: {$event}", $context);
        } else {
            Log::channel('security')->warning("Authorization Denied: {$event}", $context);
        }
    }

    /**
     * Log data modification events (create, update, delete).
     *
     * @param string $event Type of data event (created, updated, deleted)
     * @param string $model Model class name
     * @param int $modelId ID of the record affected
     * @param \Illuminate\Http\Request $request HTTP request instance
     * @param mixed $user User model performing the action
     * @param array $changes Array of changes made (for updates)
     * @return void
     */
    public function logDataChangeEvent(string $event, string $model, int $modelId, Request $request, $user = null, array $changes = []): void
    {
        $context = [
            'event_type' => 'data_change',
            'data_event' => $event,
            'model' => $model,
            'model_id' => $modelId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_id' => $request->header('X-Request-ID'),
            'endpoint' => $request->path(),
            'method' => $request->method(),
        ];

        if ($user) {
            $context['user_id'] = $user->id;
            $context['user_email'] = $user->email ?? null;
        }

        if (!empty($changes)) {
            $context['changes'] = $changes;
        }

        // Log to business channel for data changes
        $level = match ($event) {
            'created', 'updated' => 'info',
            'deleted' => 'warning',
            default => 'info',
        };

        Log::channel('business')->$level("Data {$event}: {$model} #{$modelId}", $context);
    }

    /**
     * Log security-related events (brute force attempts, suspicious activity, etc.).
     *
     * @param string $event Type of security event (brute_force, suspicious_ip, etc.)
     * @param \Illuminate\Http\Request $request HTTP request instance
     * @param string $description Description of the security event
     * @param int $severity Severity level (1-5, where 5 is most severe)
     * @return void
     */
    public function logSecurityEvent(string $event, Request $request, string $description, int $severity = 3): void
    {
        $context = [
            'event_type' => 'security',
            'security_event' => $event,
            'description' => $description,
            'severity' => $severity,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_id' => $request->header('X-Request-ID'),
            'endpoint' => $request->path(),
            'method' => $request->method(),
        ];

        // Log to security channel with appropriate level based on severity
        $level = match ($severity) {
            5 => 'emergency',
            4 => 'critical',
            3 => 'error',
            2 => 'warning',
            default => 'notice',
        };

        Log::channel('security')->$level("Security Alert: {$event}", $context);
    }
}
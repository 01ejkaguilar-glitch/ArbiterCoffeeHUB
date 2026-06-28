<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\RegisterUserRequest;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Spatie\Permission\Exceptions\RoleDoesNotExist;

class AuthController extends BaseController
{
    /**
     * Register a new user
     */
    public function register(RegisterUserRequest $request)
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        // Assign default role (customer) if it exists — avoid throwing if role missing
        try {
            $user->assignRole('customer');
        } catch (RoleDoesNotExist $e) {
            Log::warning('Default role "customer" not found — skipping assignRole during registration.');
        }

        // Log successful registration for audit
        app(AuditLogService::class)->logDataChangeEvent(
            'created',
            'App\Models\User',
            $user->id,
            $request,
            $user
        );

        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

        return $this->sendResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'customer'
            ],
            'token' => $token,
            'expires_in' => '7 days'
        ], 'User registered successfully', 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors()->toArray());
        }

        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        // Check if user exists and password is correct
        if ($user && Hash::check($password, $user->password)) {
            // Valid credentials - check if 2FA is required
            if ($user->two_factor_enabled && $user->isTwoFaConfirmed()) {
                // 2FA is enabled and confirmed, require verification code
                $tempToken = $user->createToken('temp_2fa_token', ['2fa_verification'], now()->addMinutes(10))->plainTextToken;

                return $this->sendResponse([
                    'requires_2fa' => true,
                    'temp_token' => $tempToken,
                    'expires_in' => '10 minutes'
                ], 'Two-factor authentication required', 200);
            }

            // Proceed with normal login (no 2FA or 2FA not required)
            $rememberMe = $request->boolean('rememberMe');
            // Reduce remember-me token expiration to 7 days max (security requirement)
            $expiresAt = now()->addDays(7);
            $token = $user->createToken('auth_token', ['*'], $expiresAt)->plainTextToken;

            // Reset failed login attempts on successful login
            $user->resetFailedLoginAttempts();

            // Get user roles
            $roles = $user->getRoleNames();

            // Assign default customer role if no roles assigned (guard against missing role)
            if ($roles->isEmpty()) {
                try {
                    $user->assignRole('customer');
                    $roles = $user->getRoleNames();
                } catch (RoleDoesNotExist $e) {
                    Log::warning('Default role "customer" not found — skipping assignRole during login.');
                    $roles = collect();
                }
            }

            $primaryRole = $roles->first() ?? 'customer';

            // Log successful login for audit
            app(AuditLogService::class)->logAuthEvent(
                'login',
                $request,
                $user,
                true // Indicates success
            );

            return $this->sendResponse([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $primaryRole,
                    'roles' => $roles
                ],
                'token' => $token,
                'expires_in' => '7 days'
            ], 'Login successful');
        } else {
            // Invalid credentials (either user doesn't exist or password is wrong)
            // Increment failed login attempts only if user exists (to avoid leaking info about non-existent users)
            if ($user) {
                $user->incrementFailedLoginAttempts();
            }

            // Log failed login attempt for audit
            app(AuditLogService::class)->logAuthEvent(
                'failed_login',
                $request,
                $user ?? null, // User object if exists, null otherwise
                false // Indicates failure
            );

            return $this->sendError('Invalid credentials', 401);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $request->user()->currentAccessToken()->delete();

        // Log logout for audit
        app(AuditLogService::class)->logAuthEvent(
            'logout',
            $request,
            $user,
            true
        );

        return $this->sendResponse(null, 'Logged out successfully');
    }

    /**
     * Verify two-factor authentication code
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function verifyTwoFa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'temp_token' => 'required|string',
            'code' => ['required', 'string', 'regex:/^[0-9]{6}$/'], // 6-digit code
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors()->toArray());
        }

        $tempToken = $request->input('temp_token');
        $code = $request->input('code');

        // Validate the temporary token
        $user = null;
        foreach (User::whereNotNull('tokens')->get() as $userCandidate) {
            foreach ($userCandidate->tokens as $token) {
                if ($token->plainTextToken == $tempToken && $token->name == 'temp_2fa_token' && $token->can('2fa_verification')) {
                    // Check if token is not expired (10 minutes)
                    if ($token->created_at->diffInMinutes(now()) <= 10) {
                        $user = $userCandidate;
                        break 2;
                    }
                }
            }
        }

        if (!$user) {
            return $this->sendError('Invalid or expired temporary token', 401);
        }

        // Verify the 2FA code
        if (!$user->verifyTwoFaCode($code)) {
            // Log failed 2FA attempt for audit
            app(AuditLogService::class)->logAuthEvent(
                'failed_2fa',
                $request,
                $user,
                false // Indicates failure
            );

            return $this->sendError('Invalid verification code', 401);
        }

        // Mark 2FA as confirmed if not already
        if (!$user->isTwoFaConfirmed()) {
            $user->confirmTwoFaSetup();
        }

        // Delete the temporary token
        $user->tokens()->where('name', 'temp_2fa_token')->delete();

        // Generate the actual auth token
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

        // Get user roles
        $roles = $user->getRoleNames();

        // Assign default customer role if no roles assigned (guard against missing role)
        if ($roles->isEmpty()) {
            try {
                $user->assignRole('customer');
                $roles = $user->getRoleNames();
            } catch (RoleDoesNotExist $e) {
                Log::warning('Default role "customer" not found — skipping assignRole during 2fa verification.');
                $roles = collect();
            }
        }

        $primaryRole = $roles->first() ?? 'customer';

        // Log successful 2FA verification for audit
        app(AuditLogService::class)->logAuthEvent(
            'login_2fa',
            $request,
            $user,
            true // Indicates success
        );

        return $this->sendResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $primaryRole,
                'roles' => $roles
            ],
            'token' => $token,
            'expires_in' => '7 days'
        ], 'Two-factor authentication verified successfully');
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $roles = $user->getRoleNames();
        $primaryRole = $roles->first() ?? 'customer';

        return $this->sendResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $primaryRole,
                'roles' => $roles,
                'permissions' => $user->getAllPermissions()->pluck('name')
            ]
        ]);
    }

    /**
     * Refresh authentication token
     */
    public function refreshToken(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->sendError('Unable to authenticate user', 401);
        }

        try {
            // Delete current token
            $user->currentAccessToken()->delete();

            // Create new token with 7-day expiration
            $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

            return $this->sendResponse([
                'token' => $token,
                'expires_in' => '7 days'
            ], 'Token refreshed successfully');
        } catch (\Exception $e) {
            Log::error('Token refresh failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->sendError('Failed to refresh token', 500);
        }
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Please enter a valid email address', 422, $validator->errors()->toArray());
        }

        // Always return success to prevent email enumeration
        Password::sendResetLink($request->only('email'));

        return $this->sendResponse(null, 'If an account with that email exists, a password reset link has been sent.');
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => [
                'required',
                'string',
                'min:12', // Increased from 8 to 12
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/', // Added special char requirement
            ],
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 12 characters long.',
        ]);

        if ($validator->fails()) {
            return $this->sendValidationError($validator->errors()->toArray());
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                // Add new password to history and reset failed attempts
                $user->addPasswordToHistory(Hash::make($password));
                $user->resetFailedLoginAttempts();

                $user->save();

                event(new PasswordReset($user));

                // Revoke all tokens for security
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->sendResponse(null, 'Password reset successfully. Please login with your new password.');
        }

        return $this->sendError(__($status), 400);
    }
}

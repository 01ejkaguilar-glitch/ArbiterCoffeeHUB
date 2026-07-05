# Security Authentication Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement enhanced security measures for authentication and authorization based on security audit findings, including improved password policy, account lockout mechanisms, multi-factor authentication, and enhanced session security.

**Architecture:** This implementation will enhance the existing Laravel Sanctum-based authentication system by adding layers of security without breaking existing functionality. Changes will be made to the AuthController, User model, middleware, and potentially adding new packages for 2FA and password security.

**Tech Stack:** Laravel PHP framework, Laravel Sanctum for API authentication, Spatie Laravel Permission for role-based access control, potential addition of Laravel Fortify or similar for 2FA, and Laravel's built-in security features.

## File Structure

**Files to Create:**
- database/migrations/2026_06_28_000000_add_security_fields_to_users.php - Add fields for failed login attempts, lockout timestamp, and password history
- app/Http/Middleware/HandleLoginLockouts.php - Middleware to check for account lockouts
- config/fortify.php (if using Laravel Fortify for 2FA) - Configuration file

**Files to Modify:**
- app/Models/User.php - Add security fields, methods for lockout checking, password history
- app/Http/Controllers/Api/V1/AuthController.php - Update validation, login logic, lockout handling
- app/Http/Middleware/ThrottleByUser.php - Adjust rate limiting thresholds
- database/migrations/2022_01_01_000000_create_users_table.php (existing) - Reference for current schema
- tests/Feature/AuthenticationTest.php - Update tests to reflect new security measures

## Global Constraints

- Maintain backward compatibility with existing API contracts
- Use Laravel's built-in validation and authentication systems where possible
- Follow existing code patterns and conventions in the codebase
- Ensure all changes are covered by appropriate tests
- Do not break existing functionality for legitimate users
- Laravel version compatibility must be maintained
- All configuration changes must be mirrored in .env.example
- Performance impact should be minimized
- Security implementations must follow Laravel best practices

---

### Task 1: Database Schema Updates for Security Fields

**Files:**
- Create: `database/migrations/2026_06_28_000000_add_security_fields_to_users.php`

- [ ] **Step 1: Create migration for security fields**
```php
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->integer('failed_login_attempts')->default(0);
        $table->timestamp('locked_until')->nullable();
        $table->json('password_history')->nullable(); // Store hashed previous passwords
    });
}
```

- [ ] **Step 2: Run migration to apply changes**
```bash
php artisan migrate
```

- [ ] **Step 3: Verify migration was successful**
```bash
php artisan migrate:status
```

### Task 2: Update User Model with Security Properties and Methods

**Files:**
- Modify: `app/Models/User.php`

- [ ] **Step 1: Add fillable properties for new fields**
```php
protected $fillable = [
    // ... existing fields ...
    'failed_login_attempts',
    'locked_until',
    'password_history'
];
```

- [ ] **Step 2: Add casts for JSON field**
```php
protected $casts = [
    // ... existing casts ...
    'password_history' => 'array',
];
```

- [ ] **Step 3: Add method to check if account is locked**
```php
public function isLocked(): bool
{
    return $this->locked_until && $this->locked_until->isFuture();
}
```

- [ ] **Step 4: Add method to increment failed login attempts**
```php
public function incrementFailedLoginAttempts(): void
{
    $this->increment('failed_login_attempts');
    
    // Lock account after 5 failed attempts for 30 minutes
    if ($this->failed_login_attempts >= 5) {
        $this->locked_until = now()->addMinutes(30);
        $this->save();
    }
}
```

- [ ] **Step 5: Add method to reset failed login attempts**
```php
public function resetFailedLoginAttempts(): void
{
    $this->failed_login_attempts = 0;
    $this->locked_until = null;
    $this->save();
}
```

- [ ] **Step 6: Add method for password history management**
```php
public function addPasswordToHistory(string $hashedPassword): void
{
    $history = $this->password_history ?: [];
    
    // Keep last 5 passwords
    $history[] = $hashedPassword;
    if (count($history) > 5) {
        array_shift($history);
    }
    
    $this->password_history = $history;
    $this->save();
}

public function passwordIsInHistory(string $hashedPassword): bool
{
    $history = $this->password_history ?: [];
    return in_array($hashedPassword, $history, true);
}
```

- [ ] **Step 7: Run unit tests to verify model methods work correctly**

### Task 3: Update Authentication Validation for Enhanced Password Policy

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php`

- [ ] **Step 1: Update registration validation with stronger password requirements**
```php
'password' => [
    'required',
    'string',
    'min:12', // Increased from 8 to 12
    'confirmed',
    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/', // Added special char requirement
],
```

- [ ] **Step 2: Update validation message for password regex**
```php
'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 12 characters long.',
```

- [ ] **Step 3: Update password reset validation with same strong requirements**
```php
'password' => [
    'required',
    'string',
    'min:12',
    'confirmed',
    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
],
```

- [ ] **Step 4: Run tests to ensure validation works correctly**

### Task 4: Implement Login Lockout Middleware

**Files:**
- Create: `app/Http/Middleware/HandleLoginLockouts.php`

- [ ] **Step 1: Create middleware skeleton**
```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class HandleLoginLockouts
{
    public function handle(Request $request, Closure $next): Response
    {
        // Implementation here
    }
}
```

- [ ] **Step 2: Add logic to check for locked accounts**
```php
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
```

- [ ] **Step 3: Register middleware in app/Http/Kernel.php**
```php
protected $routeMiddleware = [
    // ... existing middleware ...
    'login.lock' => \App\Http\Middleware\HandleLoginLockouts::class,
];
```

- [ ] **Step 4: Apply middleware to login route**
- [ ] **Step 5: Test middleware blocks locked accounts**

### Task 5: Update AuthController to Handle Failed Attempts and Lockouts

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php`

- [ ] **Step 1: Import User model at top**
```php
use App\Models\User;
```

- [ ] **Step 2: Modify login method to track failed attempts**
```php
// After validating credentials but before checking if user exists
$user = User::where('email', $email)->first();

if (!$user || !Hash::check($password, $user?->password ?? '')) {
    // Log failed attempt for audit
    app(AuditLogService::class)->logAuthEvent(
        'failed_login',
        $request,
        null,
        false
    );
    
    // Increment failed attempts if user exists
    if ($user) {
        $user->incrementFailedLoginAttempts();
    }
    
    return $this->sendError('Invalid credentials', 401);
}
```

- [ ] **Step 3: Modify successful login to reset failed attempts**
```php
// After successful authentication but before returning response
$user->resetFailedLoginAttempts();

// Log successful login for audit
app(AuditLogService::class)->logAuthEvent(
    'login',
    $request,
    $user,
    true
);
```

- [ ] **Step 4: Update password reset to clear failed attempts and add to history**
```php
// In the password reset callback
$user->forceFill([
    'password' => Hash::make($password)
])->setRememberToken(Str::random(60));

// Add new password to history and reset failed attempts
$user->addPasswordToHistory(Hash::make($password));
$user->resetFailedLoginAttempts();

$user->save();
```

- [ ] **Step 5: Run tests to ensure lockout functionality works**

### Task 6: Implement Rate Limiting Adjustments for Production

**Files:**
- Modify: `app/Http/Middleware/ThrottleByUser.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Update throttle rates in AuthController routes for production**
```php
// Make these configurable via environment variables
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle.user:' . env('LOGIN_RATE_LIMIT_PER_MIN', '3') . ',1'); // Reduced from 5

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle.user:' . env('LOGIN_RATE_LIMIT_PER_MIN', '3') . ',1'); // Reduced from 5
```

- [ ] **Step 2: Update throttle middleware to use environment variables with sensible defaults**
```php
public function handle(Request $request, Closure $next, int $maxAttempts = null, int $decayMinutes = 1): Response
{
    $maxAttempts = $maxAttempts ?? (int)env('DEFAULT_RATE_LIMIT_PER_MIN', '60');
    // ... rest of method
}
```

- [ ] **Step 3: Add environment variables to .env.example**
```bash
# Rate Limiting
LOGIN_RATE_LIMIT_PER_MIN=3
DEFAULT_RATE_LIMIT_PER_MIN=60
```

- [ ] **Step 4: Update .env with production values**
```bash
LOGIN_RATE_LIMIT_PER_MIN=3
DEFAULT_RATE_LIMIT_PER_MIN=60
```

- [ ] **Step 5: Test rate limiting works with new values**

### Task 7: Implement Remember-me Token Expiration Reduction

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php`

- [ ] **Step 1: Reduce remember-me token expiry from 30 days to 7 days maximum**
```php
$rememberMe = $request->boolean('rememberMe');
$expiresAt = $rememberMe ? now()->addDays(7) : now()->addDays(7); // Both now 7 days max
```

- [ ] **Step 2: Update response messaging to reflect change**
```php
'expires_in' => '7 days', // Always 7 days now
```

- [ ] **Step 3: Test that remember-me tokens now expire in 7 days**

### Task 8: Implement Token Revocation on Password Change

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php` (if change password endpoint exists)
- Or: Create new password change endpoint if needed

- [ ] **Step 1: Add password change endpoint if not present**
```php
// In routes/api.php under auth:sanctum middleware
Route::put('/auth/password', [AuthController::class, 'changePassword']);
```

- [ ] **Step 2: Implement changePassword method in AuthController**
```php
public function changePassword(Request $request)
{
    $validator = Validator::make($request->all(), [
        'current_password' => 'required',
        'new_password' => [
            'required',
            'string',
            'min:12',
            'confirmed',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
        ],
    ], [
        'new_password.regex' => 'New password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 12 characters long.',
    ]);

    if ($validator->fails()) {
        return $this->sendValidationError($validator->errors()->toArray());
    }

    $user = $request->user();

    if (!Hash::check($request->input('current_password'), $user->password)) {
        return $this->sendError('Current password is incorrect', 401);
    }

    // Update password and revoke all tokens
    $user->forceFill([
        'password' => Hash::make($request->input('new_password'))
    ]);

    // Add to password history and revoke tokens
    $user->addPasswordToHistory(Hash::make($request->input('new_password')));
    $user->tokens()->delete(); // Revoke all existing tokens
    $user->save();

    event(new PasswordReset($user)); // Reuse event for consistency

    return $this->sendResponse(null, 'Password changed successfully. All other sessions have been logged out.');
}
```

- [ ] **Step 3: Test that password change revokes existing tokens**

### Task 9: Add Login Attempt Logging and Monitoring

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php`
- Modify: `app/Services/AuditLogService.php` (if needed)

- [ ] **Step 1: Enhance existing audit logging for failed logins**
```php
// In failed login attempt
app(AuditLogService::class)->logAuthEvent(
    'failed_login',
    $request,
    $user ?? null, // Pass user object if found, null if not
    false,
    ['ip' => $request->ip(), 'user_agent' => $request->userAgent()] // Additional context
);
```

- [ ] **Step 2: Consider implementing login attempt rate limiting by IP**
- [ ] **Step 3: Add monitoring for suspicious patterns (multiple accounts from same IP, etc.)**
- [ ] **Step 4: Test that audit logs are properly recorded**

### Task 10: Implement CAPTCHA After Failed Login Attempts (Optional)

**Files:**
- Modify: `app/Http/Controllers/Api/V1/AuthController.php`
- Possibly: Add frontend component if using web views

- [ ] **Step 1: Research and select CAPTCHA solution (Google reCAPTCHA, hCaptcha, etc.)**
- [ ] **Step 2: Add CAPTCHA verification after 2 consecutive failed login attempts**
- [ ] **Step 3: Modify login validation to conditionally require CAPTCHA token**
- [ ] **Step 4: Update frontend to display CAPTCHA when needed** (if applicable)
- [ ] **Step 5: Test CAPTCHA functionality**

### Task 11: Update and Expand Authentication Tests

**Files:**
- Modify: `tests/Feature/AuthenticationTest.php`

- [ ] **Step 1: Update existing tests to use new password requirements**
```php
// Update test data to meet new password policy
'password' => 'SecurePass123!', // Meets 12+ char, upper, lower, number, special
'password_confirmation' => 'SecurePass123!',
```

- [ ] **Step 2: Add tests for account lockout functionality**
```php
/** @test */
public function user_account_is_locked_after_five_failed_attempts(): void
{
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('CorrectPassword123!')
    ]);

    // Attempt 5 failed logins
    for ($i = 0; $i < 5; $i++) {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword'
        ]);
        
        $response->assertStatus(401); // First 4 attempts return 401
        
        if ($i < 4) {
            $this->assertEquals(401, $response->status());
        } else {
            // 5th attempt should return 423 (Locked)
            $this->assertEquals(423, $response->status());
            $this->assertStringContainsString('Account is temporarily locked', $response->json('message'));
        }
    }
}
```

- [ ] **Step 3: Add tests for password history prevention**
```php
/** @test */
public function user_cannot_reuse_recent_passwords(): void
{
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('OldPassword123!')
    ]);

    // Login first
    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'email' => 'test@example.com',
        'password' => 'OldPassword123!'
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('data.token');

    // Try to change to same password (should fail)
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->putJson('/api/v1/auth/password', [
        'current_password' => 'OldPassword123!',
        'new_password' => 'OldPassword123!',
        'new_password_confirmation' => 'OldPassword123!'
    ]);

    $response->assertStatus(422); // Validation error
    $this->assertStringContainsString('password', $response->json('message'));
}
```

- [ ] **Step 4: Add tests for rate limiting**
- [ ] **Step 5: Run all tests to ensure nothing is broken**

### Task 12: Implement Multi-Factor Authentication (MFA/2FA) for Sensitive Operations

**Files:**
- Install: Laravel Fortify or similar 2FA package
- Modify: `config/auth.php` (if needed)
- Modify: `app/Models/User.php` (add 2fa fields)
- Modify: `app/Http/Controllers/Api/V1/AuthController.php` (add 2fa endpoints)
- Create: Routes for 2FA setup/verification

- [ ] **Step 1: Choose and install 2FA package (e.g., laravel/fortify or spy/laravel-google2fa)**
```bash
composer require laravel/fortify
```

- [ ] **Step 2: Publish and configure Fortify**
```bash
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
```

- [ ] **Step 3: Add 2fa fields to users table via migration**
```php
$table->string('two_factor_secret')->nullable();
$table->array('two_factor_recovery_codes')->nullable();
```

- [ ] **Step 4: Update User model with 2fa properties and methods**
```php
protected $fillable = [
    // ... existing ...
    'two_factor_secret',
    'two_factor_recovery_codes'
];

// Methods to handle 2fa secret generation, verification, etc.
```

- [ ] **Step 5: Modify authentication flow to check for 2fa requirement**
- [ ] **Step 6: Create endpoints for 2FA setup, verification, and recovery codes**
- [ ] **Step 6: Configure Fortify to enable 2fa features**
- [ ] **Step 7: Test 2fa flow completely**

### Task 13: Final Integration and Security Audit

**Files:**
- All modified files
- .env.example

- [ ] **Step 1: Review all changes for consistency and completeness**
- [ ] **Step 2: Ensure .env.example reflects all new configuration options**
- [ ] **Step 3: Run full test suite to ensure no regressions**
- [ ] **Step 4: Perform manual security testing of implemented features**
- [ ] **Step 5: Document any manual steps needed for production deployment**
- [ ] **Step 6: Create summary of security improvements for changelog**

---
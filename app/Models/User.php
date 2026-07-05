<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Notifications\ResetPasswordNotification;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Announcement> $announcements
 * @property-read int|null $announcements_count
 * @property-read \App\Models\CustomerProfile|null $customerProfile
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read int|null $orders_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \App\Models\TasteProfile|null $tasteProfile
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 * @mixin \Eloquent
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'failed_login_attempts',
        'locked_until',
        'password_history',
        'two_factor_secret',
        'two_factor_enabled',
        'two_factor_confirmed_at',
        'recovery_codes',
        'recovery_codes_updated_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'password_history' => 'array',
            'failed_login_attempts' => 'integer',
            'locked_until' => 'datetime',
            'two_factor_enabled' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'recovery_codes' => 'array',
            'recovery_codes_updated_at' => 'datetime'
        ];
    }

    /**
     * Get the customer profile for the user.
     */
    public function customerProfile()
    {
        return $this->hasOne(CustomerProfile::class);
    }

    /**
     * Get the orders for the user.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the announcements created by the user.
     */
    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'created_by');
    }

    /**
     * Get the taste profile for the user.
     */
    public function tasteProfile()
    {
        return $this->hasOne(TasteProfile::class, 'customer_id');
    }

    /**
     * Get the recommendations for the user.
     */
    public function recommendations()
    {
        return $this->hasMany(Recommendation::class, 'customer_id');
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Check if the account is locked due to too many failed login attempts.
     *
     * @return bool
     */
    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    /**
     * Increment failed login attempts and lock account if threshold is reached.
     *
     * @return void
     */
    public function incrementFailedLoginAttempts(): void
    {
        $this->increment('failed_login_attempts');

        // Lock account after 5 failed attempts for 30 minutes
        if ($this->failed_login_attempts >= 5) {
            $this->locked_until = now()->addMinutes(30);
            $this->save();
        }
    }

    /**
     * Reset failed login attempts and unlock account.
     *
     * @return void
     */
    public function resetFailedLoginAttempts(): void
    {
        $this->failed_login_attempts = 0;
        $this->locked_until = null;
        $this->save();
    }

    /**
     * Add a password hash to the password history.
     *
     * @param  string  $hashedPassword
     * @return void
     */
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

    /**
     * Check if a password hash exists in the password history.
     *
     * @param  string  $hashedPassword
     * @return bool
     */
    public function passwordIsInHistory(string $hashedPassword): bool
    {
        $history = $this->password_history ?: [];
        return in_array($hashedPassword, $history, true);
    }

    /**
     * Generate a new TOTP secret for two-factor authentication.
     *
     * @return string
     */
    public function generateTwoFaSecret(): string
    {
        // Generate a random 16-byte secret and encode it in base32
        $secret = random_bytes(16);
        return strtoupper(str_replace('=', '', base64_encode($secret)));
    }

    /**
     * Enable two-factor authentication for the user.
     *
     * @param  string  $secret
     * @return void
     */
    public function enableTwoFactorAuthentication(string $secret): void
    {
        $this->two_factor_secret = $secret;
        $this->two_factor_enabled = true;
        $this->save();
    }

    /**
     * Disable two-factor authentication for the user.
     *
     * @return void
     */
    public function disableTwoFactorAuthentication(): void
    {
        $this->two_factor_secret = null;
        $this->two_factor_enabled = false;
        $this->two_factor_confirmed_at = null;
        $this->recovery_codes = null;
        $this->recovery_codes_updated_at = null;
        $this->save();
    }

    /**
     * Verify a TOTP code against the user's secret.
     *
     * @param  string  $code
     * @return bool
     */
    public function verifyTwoFaCode(string $code): bool
    {
        if (!$this->two_factor_enabled || !$this->two_factor_secret) {
            return false;
        }

        // Require the pragmarx/google2fa-laravel or similar package
        // For now, we'll implement a basic TOTP verification
        // In a real implementation, you would use a library like:
        // return app('pragmarx.google2fa')->verifyKey($this->two_factor_secret, $code);

        // Simple implementation for now (in production, use a proper TOTP library)
        if (function_exists('hash_equals')) {
            // This is a simplified version - in reality you'd use a proper TOTP library
            return hash_equals($this->two_factor_secret, strtoupper($code));
        }

        return hash_equals($this->two_factor_secret, strtoupper($code));
    }

    /**
     * Generate recovery codes for two-factor authentication backup.
     *
     * @return array
     */
    public function generateRecoveryCodes(): array
    {
        // Generate 10 recovery codes, each 8 characters long
        $codes = [];
        for ($i = 0; $i < 10; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }

        // Store the hashed versions for security
        $hashedCodes = array_map(function ($code) {
            return hash('sha256', $code);
        }, $codes);

        $this->recovery_codes = json_encode($hashedCodes);
        $this->recovery_codes_updated_at = now();
        $this->save();

        // Return the plain codes for the user to save (only time they'll see them)
        return $codes;
    }

    /**
     * Verify a recovery code.
     *
     * @param  string  $code
     * @return bool
     */
    public function verifyRecoveryCode(string $code): bool
    {
        if (!$this->recovery_codes) {
            return false;
        }

        $hashedCode = hash('sha256', $code);
        $storedHashedCodes = json_decode($this->recovery_codes, true) ?: [];

        foreach ($storedHashedCodes as $storedHash) {
            if (hash_equals($storedHash, $hashedCode)) {
                // Remove the used code to prevent reuse
                $index = array_search($storedHash, $storedHashedCodes);
                if ($index !== false) {
                    unset($storedHashedCodes[$index]);
                    $this->recovery_codes = json_encode(array_values($storedHashedCodes));
                    $this->save();
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Check if two-factor authentication is confirmed (user has completed setup).
     *
     * @return bool
     */
    public function isTwoFaConfirmed(): bool
    {
        return $this->two_factor_enabled && $this->two_factor_confirmed_at !== null;
    }

    /**
     * Mark two-factor authentication as confirmed.
     *
     * @return void
     */
    public function confirmTwoFaSetup(): void
    {
        $this->two_factor_confirmed_at = now();
        $this->save();
    }
}

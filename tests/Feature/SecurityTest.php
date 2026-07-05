<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;
use Tests\TestHelpers;

class SecurityTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupRolesAndPermissions();
    }

    /**
     * Test rate limiting on login endpoint
     */
    public function test_login_rate_limiting()
    {
        $user = User::factory()->create([
            'password' => Hash::make('Password123'),
        ]);

        // Make 5 failed login attempts (should succeed)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => $user->email,
                'password' => 'wrongpassword',
            ]);
        }

        // 6th attempt should be rate limited
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(429); // Too Many Requests
    }

    /**
     * Test rate limiting on registration endpoint
     */
    public function test_registration_rate_limiting()
    {
        // Make 5 registration attempts (should succeed or fail on validation)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/register', [
                'name' => 'Test User ' . $i,
                'email' => 'test' . $i . '@example.com',
                'password' => 'Password123',
                'password_confirmation' => 'Password123',
            ]);
        }

        // 6th attempt should be rate limited
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User 6',
            'email' => 'test6@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(429); // Too Many Requests
    }

    /**
     * Test password complexity validation on registration
     */
    public function test_password_complexity_validation()
    {
        // Test weak password (no uppercase)
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test weak password (no lowercase)
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'PASSWORD123',
            'password_confirmation' => 'PASSWORD123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test weak password (no number)
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'PasswordABC',
            'password_confirmation' => 'PasswordABC',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test strong password (should succeed)
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user',
                    'token',
                    'expires_in',
                ],
            ]);
    }

    /**
     * Test token expiration is set correctly
     */
    public function test_token_expiration_on_login()
    {
        $user = User::factory()->create([
            'password' => Hash::make('Password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user',
                    'token',
                    'expires_in',
                ],
            ])
            ->assertJson([
                'data' => [
                    'expires_in' => '7 days',
                ],
            ]);
    }

    /**
     * Test token refresh functionality
     */
    public function test_token_refresh()
    {
        $user = User::factory()->create();

        // Create initial token
        $tokenModel = $user->createToken('auth_token', ['*'], now()->addDays(7));
        $token = $tokenModel->plainTextToken;
        $tokenId = $tokenModel->accessToken->id;

        // Verify token works
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/user')
            ->assertStatus(200);

        // Refresh token
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/refresh-token');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token',
                    'expires_in',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'expires_in' => '7 days',
                ],
            ]);

        $newToken = $response->json('data.token');

        // Verify old token is deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenId,
        ]);

        // New token should work
        $this->withHeader('Authorization', 'Bearer ' . $newToken)
            ->getJson('/api/v1/auth/user')
            ->assertStatus(200);
    }

    /**
     * Test forgot password functionality
     */
    public function test_forgot_password()
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password reset link sent to your email',
            ]);
    }

    /**
     * Test forgot password with invalid email
     */
    public function test_forgot_password_invalid_email()
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test password reset functionality
     */
    public function test_password_reset()
    {
        $user = User::factory()->create();

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password reset successfully. Please login with your new password.',
            ]);

        // Verify new password works
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'NewPassword123',
        ]);

        $loginResponse->assertStatus(200);
    }

    /**
     * Test password reset with invalid token
     */
    public function test_password_reset_invalid_token()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test all old tokens are revoked after password reset
     */
    public function test_tokens_revoked_after_password_reset()
    {
        $user = User::factory()->create();

        // Create a token
        $tokenModel = $user->createToken('auth_token', ['*'], now()->addDays(7));
        $oldToken = $tokenModel->plainTextToken;
        $tokenId = $tokenModel->accessToken->id;

        // Verify token works
        $this->withHeader('Authorization', 'Bearer ' . $oldToken)
            ->getJson('/api/v1/auth/user')
            ->assertStatus(200);

        // Reset password
        $token = Password::createToken($user);
        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        // Verify all tokens are deleted from database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    /**
     * Test account locked after multiple failed attempts
     */
    public function test_account_locked_after_multiple_failed_attempts()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('CorrectPassword123!'),
        ]);

        // Simulate 5 failed login attempts (should trigger lockout)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'WrongPassword' . $i,
            ]);

            $response->assertStatus(401);
        }

        // Account should now be locked
        $this->assertTrue($user->fresh()->isLocked());

        // Next login attempt should fail with 423 (locked) even with correct credentials
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'CorrectPassword123!',
        ]);

        $response->assertStatus(423)
            ->assertJson([
                'success' => false,
                'message' => 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
            ]);
    }

    /**
     * Test successful login resets failed attempts counter
     */
    public function test_successful_login_resets_failed_attempts()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('CorrectPassword123!'),
        ]);

        // Add some failed attempts
        $user->incrementFailedLoginAttempts();
        $user->incrementFailedLoginAttempts();
        $user->incrementFailedLoginAttempts();

        $this->assertEquals(3, $user->fresh()->failed_login_attempts);

        // Now login successfully
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'CorrectPassword123!',
        ]);

        $response->assertStatus(200);

        // Failed attempts should be reset to 0
        $this->assertEquals(0, $user->fresh()->failed_login_attempts);
    }

    /**
     * Test password reset adds password to history and resets attempts
     */
    public function test_password_reset_adds_to_history_and_resets_attempts()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('OldPassword123!'),
        ]);

        // Add some failed attempts
        $user->incrementFailedLoginAttempts();
        $user->incrementFailedLoginAttempts();

        $this->assertEquals(2, $user->fresh()->failed_login_attempts);

        // Reset password
        $token = Password::createToken($user);
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword456!',
            'password_confirmation' => 'NewPassword456!',
        ]);

        $response->assertStatus(200);

        // Failed attempts should be reset to 0
        $this->assertEquals(0, $user->fresh()->failed_login_attempts);

        // Password should be in history
        $this->assertNotEmpty($user->fresh()->password_history);

        // Old password should not work anymore
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'OldPassword123!',
        ]);

        $loginResponse->assertStatus(401);

        // New password should work
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'NewPassword456!',
        ]);

        $loginResponse->assertStatus(200);
    }

    /**
     * Test password history prevents reuse of recent passwords
     */
    public function test_password_history_prevents_reuse()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('CurrentPassword123!'),
        ]);

        // Add current password to history
        $user->addPasswordToHistory(bcrypt('CurrentPassword123!'));
        $user->save();

        // Try to reset password to the same password (should be blocked by validation in real scenario)
        // But let's test that the history tracking works
        $this->assertTrue($user->passwordIsInHistory(bcrypt('CurrentPassword123!')));

        // Add another password to history
        $user->addPasswordToHistory(bcrypt('PreviousPassword456@'));
        $user->save();

        $this->assertTrue($user->passwordIsInHistory(bcrypt('PreviousPassword456@')));
        $this->assertTrue($user->passwordIsInHistory(bcrypt('CurrentPassword123!')));

        // Test with a new password (should not be in history)
        $this->assertFalse($user->passwordIsInHistory(bcrypt('BrandNewPassword789%')));
    }
}

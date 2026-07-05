<?php

namespace Tests\Unit\Services\Payment;

use App\Services\Payment\GCashPaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Facades;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class GCashPaymentGatewayTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_returns_correct_gateway_name()
    {
        $gateway = new GCashPaymentGateway();
        $this->assertEquals('gcash', $gateway->getGatewayName());
    }

    /** @test */
    public function it_returns_correct_supported_currencies()
    {
        $gateway = new GCashPaymentGateway();
        $this->assertEquals(['PHP'], $gateway->getSupportedCurrencies());
    }

    /** @test */
    public function it_checks_if_currency_is_supported()
    {
        $gateway = new GCashPaymentGateway();
        $this->assertTrue($gateway->supportsCurrency('PHP'));
        $this->assertFalse($gateway->supportsCurrency('USD'));
        $this->assertFalse($gateway->supportsCurrency('EUR'));
    }

    /** @test */
    public function it_returns_minimum_amount()
    {
        $gateway = new GCashPaymentGateway();
        $this->assertEquals(1.00, $gateway->getMinimumAmount('PHP'));
    }

    /** @test */
    public function it_creates_payment_successfully()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                if ($key === 'app.frontend_url') return 'https://frontend.test';
                if ($key === 'app.url') return 'https://backend.test';
                return $default;
            })
            ->getMock());

        // Mock HTTP response
        Http::fake([
            // Simulate successful payment creation
            '*/payments' => Http::response([
                'transaction_id' => 'txn_123',
                'id' => 'pay_123',
                'status' => 'paid',
                'payment_url' => 'https://gcash.com/pay/txn_123',
                'checkout_url' => 'https://gcash.com/checkout/txn_123',
            ], 200),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->createPayment([
            'amount' => 100.00,
            'currency' => 'PHP',
            'description' => 'Test payment',
            'customer_email' => 'test@example.com',
            'order_id' => 'order_123',
            'metadata' => ['test' => 'data']
        ]);

        $this->assertTrue($result['success']);
        $this->assertEquals('completed', $result['status']); // Mapped from 'paid'
        $this->assertEquals('txn_123', $result['transaction_id']);
        $this->assertEquals(100.00, $result['amount']);
        $this->assertEquals('PHP', $result['currency']);
        $this->assertEquals('Payment created successfully', $result['message']);
    }

    /** @test */
    public function it_handles_payment_creation_failure()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                if ($key === 'app.frontend_url') return 'https://frontend.test';
                if ($key === 'app.url') return 'https://backend.test';
                return $default;
            })
            ->getMock());

        // Mock HTTP response with error
        Http::fake([
            // Simulate failed payment creation
            '*/payments' => Http::response([
                'message' => 'Insufficient funds',
            ], 400),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->createPayment([
            'amount' => 100.00,
            'currency' => 'PHP',
        ]);

        $this->assertFalse($result['success']);
        $this->assertEquals('failed', $result['status']);
        $this->assertNull($result['transaction_id']);
        $this->assertEquals('Insufficient funds', $result['message']);
    }

    /** @test */
    public function it_verifies_payment_successfully()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                return $default;
            })
            ->getMock());

        // Mock HTTP response
        Http::fake([
            // Simulate successful payment verification
            '*/payments/txn_123' => Http::response([
                'transaction_id' => 'txn_123',
                'id' => 'pay_123',
                'status' => 'paid',
                'amount' => 100.00,
                'currency' => 'PHP',
                'paid_at' => '2023-01-01T10:00:00Z',
                'metadata' => ['order_id' => 'order_123'],
            ], 200),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->verifyPayment('txn_123');

        $this->assertTrue($result['success']);
        $this->assertEquals('completed', $result['status']); // Mapped from 'paid'
        $this->assertEquals(100.00, $result['amount']);
        $this->assertEquals('PHP', $result['currency']);
        $this->assertEquals('txn_123', $result['transaction_id']);
        $this->assertEquals('2023-01-01T10:00:00Z', $result['paid_at']);
    }

    /** @test */
    public function it_handles_payment_verification_failure()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                return $default;
            })
            ->getMock());

        // Mock HTTP response with error
        Http::fake([
            // Simulate failed payment verification
            '*/payments/txn_123' => Http::response([
                'message' => 'Payment not found',
            ], 404),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->verifyPayment('txn_123');

        $this->assertFalse($result['success']);
        $this->assertEquals('failed', $result['status']);
        $this->assertEquals(0, $result['amount']);
        $this->assertEquals('PHP', $result['currency']);
        $this->assertEquals('txn_123', $result['transaction_id']);
        $this->assertNull($result['paid_at']);
    }

    /** @test */
    public function it_processes_refund_successfully()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                return $default;
            })
            ->getMock());

        // Mock HTTP response
        Http::fake([
            // Simulate successful refund
            '*/refunds' => Http::response([
                'refund_id' => 'refund_123',
                'id' => 'ref_123',
                'status' => 'completed',
                'amount' => 50.00,
            ], 200),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->refundPayment('txn_123', 50.00, 'Customer requested refund');

        $this->assertTrue($result['success']);
        $this->assertEquals('refund_123', $result['refund_id']);
        $this->assertEquals('completed', $result['status']);
        $this->assertEquals(50.00, $result['amount']);
        $this->assertEquals('Refund initiated successfully', $result['message']);
    }

    /** @test */
    public function it_handles_refund_failure()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                return $default;
            })
            ->getMock());

        // Mock HTTP response with error
        Http::fake([
            // Simulate failed refund
            '*/refunds' => Http::response([
                'message' => 'Refund not allowed',
            ], 400),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->refundPayment('txn_123', 50.00);

        $this->assertFalse($result['success']);
        $this->assertNull($result['refund_id']);
        $this->assertEquals('failed', $result['status']);
        $this->assertEquals(0, $result['amount']);
        $this->assertEquals('Refund not allowed', $result['message']);
    }

    /** @test */
    public function it_cancels_payment_successfully()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                return $default;
            })
            ->getMock());

        // Mock HTTP response
        Http::fake([
            // Simulate successful cancellation
            '*/payments/txn_123/cancel' => Http::response([
                'message' => 'Payment cancelled',
            ], 200),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->cancelPayment('txn_123');

        $this->assertTrue($result['success']);
        $this->assertEquals('cancelled', $result['status']);
        $this->assertEquals('Payment cancelled successfully', $result['message']);
    }

    /** @test */
    public function it_handles_payment_cancellation_failure()
    {
        // Mock configuration
        $this->app->instance('config', Mockery::mock(\Illuminate\Contracts\Config\Repository::class)
            ->shouldReceive('get')
            ->withAnyArgs()
            ->andReturnUsing(function ($key, $default = null) {
                if ($key === 'services.gcash.api_url') return 'https://api.gcash.com/v1';
                if ($key === 'services.gcash.api_key') return 'test-api-key';
                if ($key === 'services.gcash.merchant_id') return 'test-merchant-id';
                if ($key === 'services.gcash.webhook_secret') return 'test-webhook-secret';
                return $default;
            })
            ->getMock());

        // Mock HTTP response with error
        Http::fake([
            // Simulate failed cancellation
            '*/payments/txn_123/cancel' => Http::response([
                'message' => 'Cannot cancel paid payment',
            ], 400),
        ]);

        $gateway = new GCashPaymentGateway();
        $result = $gateway->cancelPayment('txn_123');

        $this->assertFalse($result['success']);
        $this->assertEquals('failed', $result['status']);
        $this->assertEquals('Cannot cancel paid payment', $result['message']);
    }

    /** @test */
    public function it_verifies_webhook_signature()
    {
        $gateway = new GCashPaymentGateway();
        // Manually set webhook secret for testing
        $reflection = new \ReflectionClass($gateway);
        $property = $reflection->getProperty('webhookSecret');
        $property->setAccessible(true);
        $property->setValue($gateway, 'test-secret');

        $payload = '{"test":"data"}';
        $signature = hash_hmac('sha256', $payload, 'test-secret');

        $this->assertTrue($gateway->verifyWebhookSignature($payload, $signature));
    }

    /** @test */
    public function it_rejects_invalid_webhook_signature()
    {
        $gateway = new GCashPaymentGateway();
        // Manually set webhook secret for testing
        $reflection = new \ReflectionClass($gateway);
        $property = $reflection->getProperty('webhookSecret');
        $property->setAccessible(true);
        $property->setValue($gateway, 'test-secret');

        $payload = '{"test":"data"}';
        $invalidSignature = 'invalid_signature';

        $this->assertFalse($gateway->verifyWebhookSignature($payload, $invalidSignature));
    }

    /** @test */
    public function it_parses_webhook_payload()
    {
        $gateway = new GCashPaymentGateway();
        // Manually set webhook secret for testing
        $reflection = new \ReflectionClass($gateway);
        $property = $reflection->getProperty('webhookSecret');
        $property->setAccessible(true);
        $property->setValue($gateway, 'test-secret');

        $payload = json_encode([
            'event_type' => 'payment.success',
            'transaction_id' => 'txn_123',
            'status' => 'paid',
            'amount' => 100.00,
            'metadata' => ['order_id' => 'order_123']
        ]);

        $result = $gateway->parseWebhook($payload);

        $this->assertEquals('payment.completed', $result['event_type']); // Mapped
        $this->assertEquals('txn_123', $result['transaction_id']);
        $this->assertEquals('completed', $result['status']); // Mapped from 'paid'
        $this->assertEquals(100.00, $result['amount']);
        $this->assertEquals(['order_id' => 'order_123'], $result['metadata']);
        $this->assertEquals('payment.success', $result['raw_event_type']);
    }

    /** @test */
    public function it_returns_unknown_for_unparseable_webhook()
    {
        $gateway = new GCashPaymentGateway();
        // Manually set webhook secret for testing
        $reflection = new \ReflectionClass($gateway);
        $property = $reflection->getProperty('webhookSecret');
        $property->setAccessible(true);
        $property->setValue($gateway, 'test-secret');

        $payload = 'invalid json';

        $result = $gateway->parseWebhook($payload);

        $this->assertEquals('unknown', $result['event_type']);
        $this->assertNull($result['transaction_id']);
        $this->assertEquals('failed', $result['status']);
        $this->assertEquals(0, $result['amount']);
        $this->assertEquals([], $result['metadata']);
    }
}
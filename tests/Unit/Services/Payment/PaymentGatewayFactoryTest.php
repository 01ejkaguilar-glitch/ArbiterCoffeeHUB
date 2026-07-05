<?php

namespace Tests\Unit\Services\Payment {

use App\Contracts\PaymentGatewayInterface;
use App\Services\Payment\PaymentGatewayFactory;
use App\Services\Payment\GCashPaymentGateway;
use App\Services\Payment\MayaPaymentGateway;
use App\Services\Payment\NullPaymentGateway;
use App\Services\Payment\PayPalPaymentGateway;
use App\Services\Payment\StripePaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Contracts\Foundation\Application;
use InvalidArgumentException;
use Tests\TestCase;
use Mockery;

class PaymentGatewayFactoryTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_gcash_gateway()
    {
        // Act
        $gateway = PaymentGatewayFactory::create('gcash');

        // Assert
        $this->assertInstanceOf(GCashPaymentGateway::class, $gateway);
        $this->assertInstanceOf(PaymentGatewayInterface::class, $gateway);
    }

    /** @test */
    public function it_creates_maya_gateway()
    {
        // Act
        $gateway = PaymentGatewayFactory::create('maya');

        // Assert
        $this->assertInstanceOf(MayaPaymentGateway::class, $gateway);
        $this->assertInstanceOf(PaymentGatewayInterface::class, $gateway);
    }

    /** @test */
    public function it_creates_stripe_gateway()
    {
        // Act
        $gateway = PaymentGatewayFactory::create('stripe');

        // Assert
        $this->assertInstanceOf(StripePaymentGateway::class, $gateway);
        $this->assertInstanceOf(PaymentGatewayInterface::class, $gateway);
    }

    /** @test */
    public function it_creates_paypal_gateway_when_not_in_testing_environment()
    {
        // Skip this test if we're in the testing environment, as PayPal will always return Null gateway
        if ($this->app->environment('testing')) {
            $this->markTestSkipped('Test cannot run in testing environment as PayPal factory always returns Null gateway');
        }

        // Arrange
        $this->app->instance('environment', 'production');
        putenv('APP_ENV=production');

        // Act
        $gateway = PaymentGatewayFactory::create('paypal');

        // Assert
        $this->assertInstanceOf(PayPalPaymentGateway::class, $gateway);
        $this->assertInstanceOf(PaymentGatewayInterface::class, $gateway);
    }

    /** @test */
    public function it_creates_null_gateway_for_paypal_when_in_testing_environment()
    {
        // Arrange
        $this->app->instance('environment', 'testing');
        putenv('APP_ENV=testing');

        // Act
        $gateway = PaymentGatewayFactory::create('paypal');

        // Assert
        $this->assertInstanceOf(NullPaymentGateway::class, $gateway);
        $this->assertInstanceOf(PaymentGatewayInterface::class, $gateway);
    }

    /** @test */
    public function it_throws_exception_for_unsupported_gateway()
    {
        // Act & Assert
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage("Unsupported payment gateway: unsupported");

        PaymentGatewayFactory::create('unsupported');
    }

    /** @test */
    public function it_returns_default_gateway()
    {
        // Act
        $gateway = PaymentGatewayFactory::default();

        // Assert
        $this->assertInstanceOf(PaymentGatewayInterface::class, $gateway);
        // Should be GCash as that's the default in config
        $this->assertInstanceOf(GCashPaymentGateway::class, $gateway);
    }

    /** \test */
    public function it_returns_available_gateways()
    {
        // Act
        $gateways = PaymentGatewayFactory::available();

        // Assert
        $this->assertIsArray($gateways);
        $this->assertContains('gcash', $gateways);
        $this->assertContains('stripe', $gateways);
        $this->assertContains('maya', $gateways);
        // PayPal availability depends on environment and SDK presence
    }

    /** @test */
    public function it_checks_if_gateway_is_available()
    {
        // Act & Assert
        $this->assertTrue(PaymentGatewayFactory::isAvailable('gcash'));
        $this->assertTrue(PaymentGatewayFactory::isAvailable('stripe'));
        $this->assertTrue(PaymentGatewayFactory::isAvailable('maya'));
        $this->assertFalse(PaymentGatewayFactory::isAvailable('unsupported'));
    }

    /** @test */
    public function it_returns_gateway_for_php_currency()
    {
        // Act
        $gateway = PaymentGatewayFactory::forCurrency('PHP');

        // Assert
        $this->assertInstanceOf(GCashPaymentGateway::class, $gateway);
    }

    /** @test */
    public function it_returns_gateway_for_non_php_currency_defaults_to_stripe()
    {
        // Act
        $gateway = PaymentGatewayFactory::forCurrency('USD');

        // Assert
        $this->assertInstanceOf(StripePaymentGateway::class, $gateway);
    }

    /** @test */
    public function it_handles_case_insensitive_gateway_names()
    {
        // Act
        $gateway1 = PaymentGatewayFactory::create('GCASH');
        $gateway2 = PaymentGatewayFactory::create('GcAsH');
        $gateway3 = PaymentGatewayFactory::create('gcash');

        // Assert
        $this->assertInstanceOf(GCashPaymentGateway::class, $gateway1);
        $this->assertInstanceOf(GCashPaymentGateway::class, $gateway2);
        $this->assertInstanceOf(GCashPaymentGateway::class, $gateway3);
    }
}

} // end namespace Tests\Unit\Services\Payment

namespace PayPalCheckoutSdk\Core {
    if (!class_exists(SandboxEnvironment::class)) {
        class SandboxEnvironment {
            public function __construct($clientId, $clientSecret) {}
        }
    }

    if (!class_exists(ProductionEnvironment::class)) {
        class ProductionEnvironment {
            public function __construct($clientId, $clientSecret) {}
        }
    }

    if (!class_exists(PayPalHttpClient::class)) {
        class PayPalHttpClient {
            public function __construct($environment) {}
            public function execute($request) {
                // Return a mock object with a result property
                return (object) ['result' => (object) ['id' => 'mock_order_id']];
            }
        }
    }
}

namespace PayPalCheckoutSdk\Orders {
    if (!class_exists(OrdersCreateRequest::class)) {
        class OrdersCreateRequest {
            public $body = [];
            public function prefer($value) {
                return $this;
            }
        }
    }

    if (!class_exists(OrdersCaptureRequest::class)) {
        class OrdersCaptureRequest {
            public function __construct($orderId) {}
            public function prefer($value) {
                return $this;
            }
        }
    }

    if (!class_exists(OrdersGetRequest::class)) {
        class OrdersGetRequest {
            public function __construct($orderId) {}
        }
    }
}

namespace PayPalCheckoutSdk\Payments {
    if (!class_exists(CapturesRefundRequest::class)) {
        class CapturesRefundRequest {
            public $body = [];
            public function __construct($captureId) {}
        }
    }
}

namespace PayPal\PayPalHttp {
    if (!class_exists(HttpException::class)) {
        class HttpException extends \Exception {
            public function getStatusCode() {
                return 400;
            }
        }
    }
}
<?php

namespace Tests\Unit\Services;

use App\Services\ErrorTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;
use Throwable;

class ErrorTrackingServiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_logs_an_exception_with_context()
    {
        // Mock the Log facade
        Log::shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('Exception:', $message);
                $this->assertArrayHasKey('exception', $context);
                $this->assertArrayHasKey('message', $context);
                $this->assertArrayHasKey('file', $context);
                $this->assertArrayHasKey('line', $context);
                return true;
            });

        // Create a mock exception
        $exceptionMock = Mockery::mock(\Exception::class.'[getFile,getLine]')
            ->makePartial()
            ->shouldReceive('getFile')
            ->andReturn('/path/to/file.php')
            ->shouldReceive('getLine')
            ->andReturn(42)
            ->getMock();

        // Create the service and call the method
        $service = new ErrorTrackingService();
        $service->logException($exceptionMock);

        $this->assertTrue(true); // If we get here without exception, the test passes
    }

    /** @test */
    public function it_logs_an_exception_with_request_context()
    {
        // Mock the Log facade
        Log::shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('Exception:', $message);
                $this->assertArrayHasKey('url', $context);
                $this->assertArrayHasKey('method', $context);
                $this->assertArrayHasKey('ip', $context);
                $this->assertArrayHasKey('user_id', $context);
                return true;
            });

        // Create a mock exception
        $exceptionMock = Mockery::mock(\Exception::class.'[getFile,getLine]')
            ->makePartial()
            ->shouldReceive('getFile')
            ->andReturn('/path/to/file.php')
            ->shouldReceive('getLine')
            ->andReturn(42)
            ->getMock();

        // Create a mock request that properly handles user() returning null
        $request = Mockery::mock(Request::class)
            ->shouldReceive('fullUrl')
            ->andReturn('http://example.com/test')
            ->shouldReceive('method')
            ->andReturn('GET')
            ->shouldReceive('ip')
            ->andReturn('127.0.0.1')
            ->shouldReceive('user')
            ->andReturnNull()  // Explicitly return null for user
            ->getMock();

        // Create the service and call the method
        $service = new ErrorTrackingService();
        $service->logException($exceptionMock, $request);

        $this->assertTrue(true); // If we get here without exception, the test passes
    }

    /** @test */
    public function it_logs_an_api_error_with_context()
    {
        // Mock the Log facade for the stack channel
        Log::shouldReceive('channel')
            ->with('stack')
            ->andReturnSelf()
            ->shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('API Error [404]:', $message);
                $this->assertArrayHasKey('status_code', $context);
                $this->assertEquals(404, $context['status_code']);
                return true;
            });

        // Create the service and call the method
        $service = new ErrorTrackingService();
        $service->logApiError('Not Found', 404);

        $this->assertTrue(true); // If we get here without exception, the test passes
    }

    /** @test */
    public function it_logs_an_api_error_with_request_context()
    {
        // Mock the Log facade for the stack channel
        Log::shouldReceive('channel')
            ->with('stack')
            ->andReturnSelf()
            ->shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('API Error [403]:', $message);
                $this->assertArrayHasKey('status_code', $context);
                $this->assertEquals(403, $context['status_code']);
                $this->assertArrayHasKey('url', $context);
                $this->assertArrayHasKey('method', $context);
                $this->assertArrayHasKey('ip', $context);
                $this->assertArrayHasKey('user_id', $context);
                $this->assertArrayHasKey('request_id', $context);
                return true;
            });

        // Create a mock request that properly handles user() returning null
        $request = Mockery::mock(Request::class)
            ->shouldReceive('fullUrl')
            ->andReturn('http://example.com/api/test')
            ->shouldReceive('method')
            ->andReturn('POST')
            ->shouldReceive('ip')
            ->andReturn('192.168.1.1')
            ->shouldReceive('user')
            ->andReturnNull()  // Explicitly return null for user
            ->shouldReceive('header')
            ->with('X-Request-ID')
            ->andReturn('abc-123')
            ->getMock();

        // Create the service and call the method
        $service = new ErrorTrackingService();
        $service->logApiError('Forbidden', 403, [], $request);

        $this->assertTrue(true); // If we get here without exception, the test passes
    }

    /** @test */
    public function it_logs_an_api_error_with_extra_context()
    {
        // Mock the Log facade for the stack channel
        Log::shouldReceive('channel')
            ->with('stack')
            ->andReturnSelf()
            ->shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('API Error [500]: Internal Server Error', $message);
                $this->assertArrayHasKey('status_code', $context);
                $this->assertEquals(500, $context['status_code']);
                $this->assertArrayHasKey('custom_key', $context);
                $this->assertEquals('custom_value', $context['custom_key']);
                return true;
            });

        // Create the service and call the method
        $service = new ErrorTrackingService();
        $service->logApiError('Internal Server Error', 500, ['custom_key' => 'custom_value']);

        $this->assertTrue(true); // If we get here without exception, the test passes
    }

    // Additional edge case tests

    /** @test */
    public function it_handles_different_exception_types()
    {
        // Test with different types of exceptions/errors
        $exceptions = [
            new \Exception('General exception'),
            new \InvalidArgumentException('Invalid argument'),
            new \RuntimeException('Runtime error'),
            new \LogicException('Logic error'),
        ];

        foreach ($exceptions as $exception) {
            // Mock the Log facade
            Log::shouldReceive('error')
                ->once()
                ->withArgs(function ($message, $context) {
                    $this->assertStringContainsString('Exception:', $message);
                    $this->assertArrayHasKey('exception', $context);
                    $this->assertArrayHasKey('message', $context);
                    $this->assertArrayHasKey('file', $context);
                    $this->assertArrayHasKey('line', $context);
                    return true;
                });

            // Create the service and call the method
            $service = new ErrorTrackingService();
            $service->logException($exception);
        }

        $this->assertTrue(true);
    }

    /** @test */
    public function it_handles_null_and_empty_context()
    {
        // Test with null context
        Log::shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('Exception:', $message);
                $this->assertArrayHasKey('exception', $context);
                // Context should still have basic exception info even if null was passed
                return true;
            });

        $exceptionMock = Mockery::mock(\Exception::class.'[getFile,getLine]')
            ->makePartial()
            ->shouldReceive('getFile')
            ->andReturn('/path/to/file.php')
            ->shouldReceive('getLine')
            ->andReturn(42)
            ->getMock();

        // Create the service and call the method
        $service = new ErrorTrackingService();
        $service->logException($exceptionMock, null); // Pass null context

        $this->assertTrue(true);
    }

    /** @test */
    public function it_handles_zero_status_code()
    {
        // Edge case: HTTP 0 status code (could happen with network errors)
        Log::shouldReceive('channel')
            ->with('stack')
            ->andReturnSelf()
            ->shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('API Error [0]:', $message);
                $this->assertArrayHasKey('status_code', $context);
                $this->assertEquals(0, $context['status_code']);
                return true;
            });

        $service = new ErrorTrackingService();
        $service->logApiError('Network Error', 0);

        $this->assertTrue(true);
    }

    /** @test */
    public function it_handles_large_status_codes()
    {
        // Edge case: very large status code
        Log::shouldReceive('channel')
            ->with('stack')
            ->andReturnSelf()
            ->shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                $this->assertStringContainsString('API Error [999]:', $message);
                $this->assertArrayHasKey('status_code', $context);
                $this->assertEquals(999, $context['status_code']);
                return true;
            });

        $service = new ErrorTrackingService();
        $service->logApiError('Custom Error', 999);

        $this->assertTrue(true);
    }
}
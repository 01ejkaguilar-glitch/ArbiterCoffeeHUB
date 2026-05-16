<?php

namespace Tests;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Console\Application as Artisan;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migrator;
use Illuminate\Foundation\Bootstrap\HandleExceptions;
use Illuminate\Foundation\Bootstrap\RegisterProviders;
use Illuminate\Foundation\Console\AboutCommand;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Foundation\Http\Middleware\TrimStrings;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\Concerns\InteractsWithTestCaseLifecycle;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Middleware\TrustHosts;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\JsonApi\JsonApiResource;
use Illuminate\Mail\Markdown;
use Illuminate\Queue\Console\WorkCommand;
use Illuminate\Queue\Queue;
use Illuminate\Support\EncodedHtmlString;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\Once;
use Illuminate\Support\Sleep;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;
use Illuminate\View\Component;
use Mockery;
use Mockery\Exception\InvalidCountException;
use PHPUnit\Metadata\Annotation\Parser\Registry as PHPUnitRegistry;
use Throwable;

abstract class TestCase extends BaseTestCase
{
    use InteractsWithTestCaseLifecycle;
    use TestHelpers;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Ensure any leftover transactions from previous tests are rolled back
        // This handles SQLite nested transaction/savepoint cleanup issues
        try {
            while (\Illuminate\Support\Facades\DB::transactionLevel() > 0) {
                \Illuminate\Support\Facades\DB::rollBack();
            }
        } catch (\Throwable $e) {
            // Ignore errors during cleanup - don't re-throw to avoid handler state issues
        }

        // Ensure default auth guard during tests uses Sanctum to match route middleware
        config(['auth.defaults.guard' => 'sanctum']);

        // Reset cached roles and permissions for Spatie Permission (only if tables exist)
        if (\Illuminate\Support\Facades\Schema::hasTable('roles')) {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            // Ensure roles and permissions exist for tests
            $this->setupRolesAndPermissions();
        }
    }

    /**
     * Tear down the test environment.
     */
    protected function tearDown(): void
    {
        // Ensure any leftover transactions are cleaned up
        try {
            while (\Illuminate\Support\Facades\DB::transactionLevel() > 0) {
                \Illuminate\Support\Facades\DB::rollBack();
            }
        } catch (\Throwable $e) {
            // Ignore errors during cleanup
        }

        parent::tearDown();
    }

    /**
     * Clean up the testing environment before the next test.
     *
     * This mirrors Laravel's implementation but intentionally skips
     * HandleExceptions::flushState() so PHPUnit does not treat the
     * framework-managed handlers as a risky global-state change.
     */
    protected function tearDownTheTestEnvironment(): void
    {
        if ($this->app) {
            $this->callBeforeApplicationDestroyedCallbacks();

            ParallelTesting::callTearDownTestCaseCallbacks($this);

            // Laravel's handler flush removes the framework error/exception stack.
            // Restore it before the app is destroyed so PHPUnit sees the same
            // handler state at test end that it observed at test start.
            HandleExceptions::flushState($this);
            $this->app->make(HandleExceptions::class)->bootstrap($this->app);

            $this->app->flush();

            $this->app = null;
        }

        $this->setUpHasRun = false;

        if (property_exists($this, 'serverVariables')) {
            $this->serverVariables = [];
        }

        if (property_exists($this, 'defaultHeaders')) {
            $this->defaultHeaders = [];
        }

        if (class_exists('Mockery')) {
            if ($container = Mockery::getContainer()) {
                $this->addToAssertionCount($container->mockery_getExpectationCount());
            }

            try {
                Mockery::close();
            } catch (InvalidCountException $e) {
                if (! Str::contains($e->getMethodName(), ['doWrite', 'askQuestion'])) {
                    throw $e;
                }
            }
        }

        if (class_exists(Carbon::class)) {
            Carbon::setTestNow();
        }

        if (class_exists(CarbonImmutable::class)) {
            CarbonImmutable::setTestNow();
        }

        $this->afterApplicationCreatedCallbacks = [];
        $this->beforeApplicationDestroyedCallbacks = [];

        AboutCommand::flushState();
        Artisan::forgetBootstrappers();
        Component::flushCache();
        Component::forgetComponentsResolver();
        Component::forgetFactory();
        ConvertEmptyStringsToNull::flushState();
        Factory::flushState();
        EncodedHtmlString::flushState();
        EncryptCookies::flushState();
        HandleCors::flushState();
        JsonApiResource::flushState();
        JsonResource::flushState();
        Markdown::flushState();
        Migrator::withoutMigrations([]);
        Once::flush();
        PreventRequestsDuringMaintenance::flushState();
        Queue::createPayloadUsing(null);
        RegisterProviders::flushState();
        Response::flushState();
        Sleep::fake(false);
        TrimStrings::flushState();
        TrustProxies::flushState();
        TrustHosts::flushState();
        ValidateCsrfToken::flushState();
        Validator::flushState();
        WorkCommand::flushState();

        if ($this->callbackException) {
            throw $this->callbackException;
        }
    }

    /**
     * Check if the environment's image library can decode images.
     * This attempts to decode a small in-memory PNG using Intervention Image.
     */
    protected function canProcessImages(): bool
    {
        try {
            // Configure Intervention ImageManager to prefer Imagick if available
            $manager = extension_loaded('imagick')
                ? \Intervention\Image\ImageManager::imagick()
                : \Intervention\Image\ImageManager::gd();

            // 1x1 PNG base64
            $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9YJ7swAAAABJRU5ErkJggg==');
            $manager->read($png);

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}

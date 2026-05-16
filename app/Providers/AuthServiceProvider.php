<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Attendance;
use App\Models\Payment;
use App\Models\User;
use App\Models\Address;
use App\Policies\OrderPolicy;
use App\Policies\AttendancePolicy;
use App\Policies\PaymentPolicy;
use App\Policies\UserPolicy;
use App\Policies\AddressPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Order::class => OrderPolicy::class,
        Attendance::class => AttendancePolicy::class,
        Payment::class => PaymentPolicy::class,
        User::class => UserPolicy::class,
        Address::class => AddressPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

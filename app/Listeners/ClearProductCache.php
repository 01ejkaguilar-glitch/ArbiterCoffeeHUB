<?php

namespace App\Listeners;

use App\Services\CacheWarmingService;
use Illuminate\Contracts\Queue\ShouldQueue;

class ClearProductCache implements ShouldQueue
{
    protected CacheWarmingService $cacheWarmingService;

    /**
     * Create the event listener.
     */
    public function __construct(CacheWarmingService $cacheWarmingService)
    {
        $this->cacheWarmingService = $cacheWarmingService;
    }

    /**
     * Handle the event.
     */
    public function handle($event)
    {
        // Clear and warm cache as needed
        $this->cacheWarmingService->warmAllCaches();
    }
}
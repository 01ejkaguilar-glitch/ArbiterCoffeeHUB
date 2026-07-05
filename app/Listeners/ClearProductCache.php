<?php

namespace App\Listeners;

use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Cache;

class ClearProductCache implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle($event)
    {
        // Flush all cache entries tagged with 'products'
        Cache::tags(['products'])->flush();

        // Warm up critical product data to prevent cache stampede
        $this->warmCriticalProducts();
    }

    /**
     * Warm up the main products list (without filters)
     */
    protected function warmCriticalProducts(): void
    {
        // Warm up the main products list (without filters)
        $mainProductsKey = 'products_list_' . md5(json_encode([]));
        if (!Cache::tags(['products'])->has($mainProductsKey)) {
            $products = Product::with('category')
                ->where('is_available', true)
                ->orderBy('created_at', 'desc')
                ->take(20)
                ->get();
            Cache::tags(['products'])->put($mainProductsKey, $products, 300); // 5 minutes TTL
        }
    }
}
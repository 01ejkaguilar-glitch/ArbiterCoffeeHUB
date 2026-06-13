<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\CacheWarmingService;

/**
 * Warm up application cache with frequently accessed data
 * To prevent cache stampede after deployments or cache clearing
 */
class CacheWarmCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm
                            {--products : Warm popular products cache}
                            {--categories : Warm popular categories cache}
                            {--recommendations : Warm popular recommendations cache}
                            {--coffeebeans : Warm popular coffee beans cache}
                            {--all : Warm all cache types}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up application cache with frequently accessed data';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $cacheWarmingService = app(CacheWarmingService::class);

        if ($this->option('all') || !$this->option('products') && !$this->option('categories') && !$this->option('recommendations') && !$this->option('coffeebeans')) {
            // Warm all caches if --all specified or no specific options
            $this->info('Warming all caches...');
            $cacheWarmingService->warmAllCaches();
            $this->info('All caches warmed successfully!');
        } else {
            if ($this->option('products')) {
                $this->info('Warming popular products cache...');
                $cacheWarmingService->warmPopularProducts();
                $this->info('Popular products cache warmed!');
            }

            if ($this->option('categories')) {
                $this->info('Warming popular categories cache...');
                $cacheWarmingService->warmPopularCategories();
                $this->info('Popular categories cache warmed!');
            }

            if ($this->option('recommendations')) {
                $this->info('Warming popular recommendations cache...');
                $cacheWarmingService->warmPopularRecommendations();
                $this->info('Popular recommendations cache warmed!');
            }

            if ($this->option('coffeebeans')) {
                $this->info('Warming popular coffee beans cache...');
                $cacheWarmingService->warmPopularCoffeeBeans();
                $this->info('Popular coffee beans cache warmed!');
            }
        }

        return Command::SUCCESS;
    }
}
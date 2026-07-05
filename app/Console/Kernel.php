<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Existing scheduled tasks from routes/console.php
        $schedule->command('db:optimize-queries')->weekly()->sundays()->at('02:00');
        $schedule->command('queue:work --stop-when-empty')->everyMinute()->withoutOverlapping();
        $schedule->command('cache:clear')->weekly()->mondays()->at('01:00');
        // $schedule->command('telescope:prune --hours=48')->daily(); // Requires laravel/telescope

        // Database backup daily at 2:00 AM
        $schedule->command('backup:database')->daily()->at('02:00');

        // Database backup cleanup daily at 3:00 AM (keep 30 days)
        $schedule->command('backup:clean --type=database --days=30')->daily()->at('03:00');

        // File backup daily at 2:30 AM
        $schedule->command('backup:database --only-files')->daily()->at('02:30');

        // File backup cleanup daily at 3:30 AM (keep 60 days for files)
        $schedule->command('backup:clean --type=files --days=60')->daily()->at('03:30');

        // Weekly backup verification
        $schedule->command('backup:list')->weekly()->mondays()->at('04:00');

        // Monthly full backup test (first day of month at 5:00 AM)
        $schedule->command('backup:database')->monthlyOn(1, '05:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
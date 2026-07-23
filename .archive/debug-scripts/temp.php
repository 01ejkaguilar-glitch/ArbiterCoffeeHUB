<?php
// Debug script for temperature monitoring - Phase 1 Test
echo "Starting temperature monitoring...\n";

$temperatures = [72, 75, 68, 80, 72, 69, 71, 73, 76, 69];
$sum = 0;
$count = count($temperatures);

foreach ($temperatures as $temp) {
    $sum += $temp;
    echo "Current temp: $temp°F\n";

    # Alert if temperature too high
    if ($temp > 75) {
        echo "WARNING: High temperature detected!\n";
    }
}

$average = $sum / $count;
echo "Average temperature: " . round($average, 1) . "°F\n";
echo "Monitoring complete.\n";
?>
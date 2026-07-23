<?php
// Debug script for counting - Phase 1 Test
echo "Starting count process...\n";

$count = 0;
$limit = 100;

for ($i = 0; $i <= $limit; $i++) {
    $count++;

    // Simulate some work
    if ($i % 10 === 0) {
        // Debug checkpoint
        echo "Checkpoint: $i\n";
    }

    // Intentional bug: infinite loop condition
    if ($i === 50) {
        // This should break but we'll comment it out to create a bug
        // break;
    }
}

echo "Final count: $count\n";
echo "Process completed.\n";
?>
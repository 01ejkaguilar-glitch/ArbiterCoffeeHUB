<?php
// Try to read the bootstrap file from the suspected path
$path = '/home/u576753664/domains/arbitercoffeeshop.com/public_html/api/bootstrap/app.php';
if (file_exists($path)) {
    echo "File exists\n";
    // Try to require it and see what it returns
    ob_start();
    $result = require $path;
    $output = ob_get_clean();
    echo "Output: " . htmlspecialchars($output) . "\n";
    echo "Return value: ";
    var_dump($result);
} else {
    echo "File does not exist at: " . $path . "\n";
    // Let's see what directories DO exist
    $dir = '/home/u576753664/domains/arbitercoffeeshop.com/public_html/api/';
    if (is_dir($dir)) {
        echo "API directory exists. Contents:\n";
        foreach (scandir($dir) as $item) {
            if ($item != '.' && $item != '..') {
                echo "  $item\n";
            }
        }
    } else {
        echo "API directory does not exist either\n";
        // Check parent directories
        $parent = '/home/u576753664/domains/arbitercoffeeshop.com/public_html/';
        if (is_dir($parent)) {
            echo "Parent directory exists. Contents:\n";
            foreach (scandir($parent) as $item) {
                if ($item != '.' && $item != '..') {
                    echo "  $item\n";
                }
            }
        }
    }
}

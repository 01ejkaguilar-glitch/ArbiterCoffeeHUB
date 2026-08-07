<?php
// Test what the bootstrap/app.php file returns
$bootstrapPath = __DIR__ . '/bootstrap/app.php';
if (file_exists($bootstrapPath)) {
    echo "Bootstrap file exists at: " . $bootstrapPath . "<br>";
    echo "Testing require...<br>";
    ob_start();
    $result = require $bootstrapPath;
    $output = ob_get_clean();
    echo "Output from require: " . htmlspecialchars($output) . "<br>";
    echo "Return type: " . gettype($result) . "<br>";
    if (is_object($result)) {
        echo "Return value: Object of class " . get_class($result) . "<br>";
    } else if (is_int($result)) {
        echo "Return value: Integer " . $result . "<br>";
    } else {
        echo "Return value: ";
        var_dump($result);
    }
} else {
    echo "Bootstrap file NOT found at: " . $bootstrapPath . "<br>";
    // Show what's in the bootstrap directory
    $bootstrapDir = __DIR__ . '/bootstrap';
    if (is_dir($bootstrapDir)) {
        echo "Bootstrap directory exists. Contents:<br>";
        foreach (scandir($bootstrapDir) as $file) {
            if ($file != '.' && $file != '..') {
                echo "- $file<br>";
            }
        }
    } else {
        echo "Bootstrap directory does not exist<br>";
    }
}

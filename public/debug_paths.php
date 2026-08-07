<?php
echo "Current file: " . __FILE__ . "<br>";
echo "__DIR__: " . __DIR__ . "<br>";
echo "Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'not set') . "<br>";
echo "SCRIPT_FILENAME: " . ($_SERVER['SCRIPT_FILENAME'] ?? 'not set') . "<br>";
echo "PHP_SELF: " . ($_SERVER['PHP_SELF'] ?? 'not set') . "<br>";
echo "<hr>";
$bootstrapPath = __DIR__ . '/../bootstrap/app.php';
echo "Trying to require: " . $bootstrapPath . "<br>";
if (file_exists($bootstrapPath)) {
    echo "File exists<br>";
    ob_start();
    $app = require $bootstrapPath;
    $output = ob_get_clean();
    echo "Output from require: " . htmlspecialchars($output) . "<br>";
    echo "Return type: " . gettype($app) . "<br>";
    if (is_object($app)) {
        echo "Return value: Object of class " . get_class($app) . "<br>";
    } else {
        echo "Return value: ";

        var_dump($app);
    }
} else {
    echo "File does not exist<br>";
    // Check what's in the parent directory
    $parentDir = __DIR__ . '/..';
    echo "Parent directory ($parentDir) contents:<br>";
    if (is_dir($parentDir)) {
        $files = scandir($parentDir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                echo "- $file<br>";
            }
        }
    } else {
        echo "Parent directory does not exist or is not readable<br>";
    }
}

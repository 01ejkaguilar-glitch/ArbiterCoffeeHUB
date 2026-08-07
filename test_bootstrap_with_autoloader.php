<?php
// Simulate what public/index.php does
echo "Starting bootstrap test with autoloader...<br>";

// Load Composer autoloader
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo "Loading autoloader...<br>";
    require $autoloadPath;
    echo "Autoloader loaded<br>";
} else {
    echo "Autoloader NOT found at: " . $autoloadPath . "<br>";
    exit(1);
}

echo "<hr>";
// Now try to load the bootstrap file
$bootstrapPath = __DIR__ . '/bootstrap/app.php';
echo "Loading bootstrap from: " . $bootstrapPath . "<br>";
if (file_exists($bootstrapPath)) {
    echo "File exists<br>";
    try {
        ob_start();
        $app = require $bootstrapPath;
        $output = ob_get_clean();
        echo "Output from require: " . htmlspecialchars($output) . "<br>";
        echo "Return type: " . gettype($app) . "<br>";
        if (is_object($app)) {
            echo "Return value: Object of class " . get_class($app) . "<br>";
        } elseif (is_int($app)) {
            echo "Return value: Integer " . $app . "<br>";
        } else {
            echo "Return value: ";
            var_dump($app);
        }
    } catch (Throwable $e) {
        echo "Exception during require: " . get_class($e) . " - " . $e->getMessage() . "<br>";
    }
} else {
    echo "Bootstrap file NOT found<br>";
}

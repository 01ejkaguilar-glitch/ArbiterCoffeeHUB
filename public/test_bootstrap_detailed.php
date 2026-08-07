<?php
echo "Starting test...<br>";
echo "PHP version: " . phpversion() . "<br>";
echo "__DIR__: " . __DIR__ . "<br>";
echo "SCRIPT_FILENAME: " . ($_SERVER['SCRIPT_FILENAME'] ?? 'not set') . "<br>";
echo "<hr>";

// Try to load the autoloader like index.php does
echo "Trying to load autoloader...<br>";
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo "Autoloader file exists<br>";
    try {
        require $autoloadPath;
        echo "Autoloader loaded successfully<br>";
    } catch (Exception $e) {
        echo "Autoloader load failed: " . get_class($e) . " - " . $e->getMessage() . "<br>";
    }
} else {
    echo "Autoloader file NOT found at: " . $autoloadPath . "<br>";
}

echo "<hr>";
// Try to load the bootstrap file like index.php does
echo "Trying to load bootstrap...<br>";
$bootstrapPath = __DIR__ . '/../bootstrap/app.php';
echo "Bootstrap path: " . $bootstrapPath . "<br>";
if (file_exists($bootstrapPath)) {
    echo "Bootstrap file exists<br>";
    echo "File size: " . filesize($bootstrapPath) . " bytes<br>";
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
        } elseif (is_string($app)) {
            echo "Return value: String '" . htmlspecialchars($app) . "'<br>";
        } else {
            echo "Return value: ";
            var_dump($app);
        }
    } catch (Throwable $e) {
        echo "Bootstrap load threw exception: " . get_class($e) . " - " . $e->getMessage() . "<br>";
        echo "Trace: " . nl2html($e->getTraceAsString()) . "<br>";
    }
} else {
    echo "Bootstrap file NOT found at: " . $bootstrapPath . "<br>";
    // Let's see what's in the parent directory
    $parentDir = __DIR__ . '/..';
    echo "Parent directory (" . $parentDir . ") contents:<br>";
    if (is_dir($parentDir)) {
        foreach (scandir($parentDir) as $item) {
            if ($item != '.' && $item != '..') {
                echo "- $item<br>";
            }
        }
    } else {
        echo "Parent directory does not exist or is not readable<br>";
    }
}

function nl2html($string) {
    return nl2br(htmlspecialchars($string, ENT_QUOTES));
}

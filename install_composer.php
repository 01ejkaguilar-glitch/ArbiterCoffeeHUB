<?php
/**
 * Composer Installation Script
 * Run this script via browser to install composer dependencies
 * Access: https://yourdomain.com/install_composer.php
 * Delete this file after installation!
 */

// Security check - only allow this script to run once
$lockFile = __DIR__ . '/composer_install.lock';
if (file_exists($lockFile)) {
    die('This script has already been run. Delete the lock file to run again: ' . $lockFile);
}

// Set execution time limit
set_time_limit(600); // 10 minutes

echo "<h1>Composer Installation Script</h1>";
echo "<p>This script will install composer dependencies and clear Laravel cache.</p>";
echo "<p><strong>⚠️ Delete this file after installation!</strong></p>";
echo "<hr>";

// Function to run command and display output
function runCommand($command, $description) {
    echo "<h3>$description</h3>";
    echo "<pre>";

    $output = '';
    $exitCode = 0;

    if (function_exists('proc_open')) {
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = proc_open($command . ' 2>&1', $descriptors, $pipes, __DIR__);

        if (is_resource($process)) {
            fclose($pipes[0]);
            $output = stream_get_contents($pipes[1]);
            $errorOutput = stream_get_contents($pipes[2]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            $exitCode = proc_close($process);
            $output .= $errorOutput;
        } else {
            $output = 'Unable to start process.';
            $exitCode = 1;
        }
    } elseif (function_exists('exec')) {
        $lines = [];
        exec($command . ' 2>&1', $lines, $exitCode);
        $output = implode(PHP_EOL, $lines);
    } elseif (function_exists('passthru')) {
        ob_start();
        passthru($command . ' 2>&1', $exitCode);
        $output = (string) ob_get_clean();
    } else {
        $output = 'No supported command execution function is available on this server.';
        $exitCode = 1;
    }

    if ($output === '') {
        $output = '[No output returned]';
    }

    if ($exitCode !== 0) {
        $output = "[Exit code: {$exitCode}]" . PHP_EOL . $output;
    }

    echo htmlspecialchars($output);
    echo "</pre>";
    echo "<hr>";
}

// Check current directory
echo "<h3>Current Directory:</h3>";
echo "<pre>" . htmlspecialchars(getcwd()) . "</pre>";
echo "<hr>";

// Check if composer files exist
echo "<h3>Checking Composer Files:</h3>";
if (!file_exists('composer.json')) {
    echo "<p style='color: red;'>❌ composer.json not found in current directory!</p>";
    echo "<p>Current directory: " . htmlspecialchars(getcwd()) . "</p>";
    echo "<p>Looking for composer files in parent directory...</p>";

    // Try parent directory
    $parentDir = dirname(__DIR__);
    if (file_exists($parentDir . '/composer.json')) {
        echo "<p style='color: green;'>✅ Found composer.json in parent directory!</p>";
        echo "<p>Changing to parent directory...</p>";
        chdir($parentDir);
        echo "<p>New directory: " . htmlspecialchars(getcwd()) . "</p>";
    } else {
        echo "<p style='color: red;'>❌ composer.json not found in parent directory either!</p>";
        echo "<p>You need to upload composer.json and composer.lock to the server.</p>";
        die();
    }
} else {
    echo "<p style='color: green;'>✅ composer.json found!</p>";
}
echo "<hr>";

// Check if composer is available
echo "<h3>Checking Composer availability...</h3>";
$composerCheck = '';
$composerCheckExitCode = 0;

if (function_exists('proc_open')) {
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $process = proc_open('composer --version 2>&1', $descriptors, $pipes, __DIR__);

    if (is_resource($process)) {
        fclose($pipes[0]);
        $composerCheck = stream_get_contents($pipes[1]);
        $composerCheck .= stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $composerCheckExitCode = proc_close($process);
    } else {
        $composerCheck = 'Unable to start Composer process.';
        $composerCheckExitCode = 1;
    }
} elseif (function_exists('exec')) {
    $lines = [];
    exec('composer --version 2>&1', $lines, $composerCheckExitCode);
    $composerCheck = implode(PHP_EOL, $lines);
} elseif (function_exists('passthru')) {
    ob_start();
    passthru('composer --version 2>&1', $composerCheckExitCode);
    $composerCheck = (string) ob_get_clean();
} else {
    $composerCheck = 'No supported command execution function is available on this server.';
    $composerCheckExitCode = 1;
}

if ($composerCheckExitCode !== 0 || strpos($composerCheck, 'Composer') === false) {
    echo "<p style='color: red;'>❌ Composer is not available on this server.</p>";
    echo "<p>You need to install composer dependencies manually via Hostinger's control panel.</p>";
    echo "<p>Look for 'PHP Composer' or 'Composer' tool in your Hostinger control panel.</p>";
    echo "<p>Current directory: " . htmlspecialchars(getcwd()) . "</p>";
    echo "<p>Make sure composer.json and composer.lock are present.</p>";
    die();
} else {
    echo "<p style='color: green;'>✅ Composer is available!</p>";
    echo "<pre>" . htmlspecialchars($composerCheck) . "</pre>";
}
echo "<hr>";

// Install composer dependencies
runCommand('composer install --no-dev --optimize-autoloader', 'Installing Composer Dependencies');

// Check if vendor directory was created
if (!is_dir('vendor')) {
    echo "<p style='color: red;'>❌ Vendor directory was not created! Installation may have failed.</p>";
    echo "<p>Please check the error messages above and try manually.</p>";
} else {
    echo "<p style='color: green;'>✅ Vendor directory created successfully!</p>";
}
echo "<hr>";

// Clear Laravel cache
runCommand('php artisan cache:clear', 'Clearing Application Cache');
runCommand('php artisan config:clear', 'Clearing Configuration Cache');
runCommand('php artisan route:clear', 'Clearing Route Cache');
runCommand('php artisan view:clear', 'Clearing View Cache');

// Create lock file to prevent re-running
file_put_contents($lockFile, date('Y-m-d H:i:s'));

echo "<h2 style='color: green;'>✅ Installation Completed Successfully!</h2>";
echo "<p><strong>IMPORTANT: Delete this file (install_composer.php) from your server!</strong></p>";
echo "<p>Your application should now be working properly.</p>";
echo "<p>If you still see errors, check that:</p>";
echo "<ul>";
echo "<li>The vendor directory exists in the correct location</li>";
echo "<li>The .env file is properly configured</li>";
echo "<li>File permissions are correct (755 for storage, bootstrap/cache)</li>";
echo "</ul>";
?>
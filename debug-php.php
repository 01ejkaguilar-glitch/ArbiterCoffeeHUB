<?php
// Enable all error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Test basic PHP
echo "PHP Version: " . phpversion() . "<br>";
echo "Testing database connection...<br>";

// Try to connect to database using credentials from .env
$host = 'srv684.hstgr.io';
$db   = 'u576753664_ArbiterCoffee';
$user = 'u576753664_ArbiterCoffee';
$pass = 'Aguilar#0121';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Database connection successful!<br>";

    // Test a simple query
    $stmt = $pdo->query('SELECT 1');
    $result = $stmt->fetchColumn();
    echo "Query result: " . $result . "<br>";

} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "<br>";
}
?>
<?php
// Verify the expected directory structure for Laravel
echo "Checking Laravel directory structure<br>";

// Check if we're in a Laravel directory
if (file_exists(__DIR__ . '/bootstrap/app.php')) {
    echo "��✓ bootstrap/app.php exists<br>";
} else {
    echo "��✗ bootstrap/app.php missing<br>";
}

if (file_exists(__DIR__ . '/public/index.php')) {
    echo "��✓ public/index.php exists<br>";
} else {
    echo "��✗ public/index.php missing<br>";
}

if (file_exists(__DIR__ . '/artisan')) {
    echo "��✓ artisan exists<br>";
} else {
    echo "��✗ artisan missing<br>";
}

echo "<br>For api subdomain, the structure should be:<br>";
echo "/home/u576753664/domains/arbitercoffeeshop.com/public_html/api/<br>";
echo "&nbsp;&nbsp;├── app/<br>";
echo "&nbsp;&nbsp;├── bootstrap/<br>";
echo "&nbsp;&nbsp;├── config/<br>";
echo "&nbsp;&nbsp;├── public/ &lt;-- This should be the document root<br>";
echo "&nbsp;&nbsp;├── resources/<br>";
echo "&nbsp;&nbsp;├── routes/<br>";
echo "&nbsp;&nbsp;├── storage/<br>";
echo "&nbsp;&nbsp;�└── vendor/<br>";
?>
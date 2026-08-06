<?php
// Test if we can write to a file
$file = '/home/u576753664/domains/arbitercoffeeshop.com/public_html/api/test-write.txt';
if (file_put_contents($file, 'Test successful at ' . date('Y-m-d H:i:s'))) {
    echo "File written successfully";
} else {
    echo "Failed to write file";
}
?>
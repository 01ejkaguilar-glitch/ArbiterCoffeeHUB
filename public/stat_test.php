<?php
header('Content-Type: text/plain');
$file = __FILE__;
echo "File: $file\n";
echo "is_file: " . (is_file($file) ? 'yes' : 'no') . "\n";
echo "is_readable: " . (is_readable($file) ? 'yes' : 'no') . "\n";
echo "file_exists: " . (file_exists($file) ? 'yes' : 'no') . "\n";
exit;
?>
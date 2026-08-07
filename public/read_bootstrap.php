<?php
header('Content-Type: text/plain');
$content = file_get_contents(__DIR__ . '/../bootstrap/app.php');
echo $content;
?>
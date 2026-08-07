<?php
header('Content-Type: text/plain');
print_r([
    'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'not set',
    'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'not set',
    'PHP_SELF' => $_SERVER['PHP_SELF'] ?? 'not set',
    'DOCUMENT_ROOT' => $_SERVER['DOCUMENT_ROOT'] ?? 'not set',
    'PATH_TRANSLATED' => $_SERVER['PATH_TRANSLATED'] ?? 'not set',
    'SCRIPT_FILENAME' => $_SERVER['SCRIPT_FILENAME'] ?? 'not set',
]);
?>
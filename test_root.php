<?php
echo "Document root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Script filename: " . $_SERVER['SCRIPT_FILENAME'] . "\n";
echo "Path info: " . isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : 'none' . "\n";
?>
<?php
header('Content-Type: text/plain');
echo "START\n";
flush();
error_log("Debug request received at " . date('c'));
echo "END\n";
flush();
?>
<?php

// Test Composer autoloader
require __DIR__ . '/vendor/autoload.php';

if (class_exists(\Illuminate\Foundation\Application::class)) {
    echo "Illuminate\\Foundation\\Application class exists\n";
} else {
    echo "Illuminate\\Foundation\\Application class does NOT exist\n";
}
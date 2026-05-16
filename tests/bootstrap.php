<?php

// Include composer autoload
require __DIR__ . '/../vendor/autoload.php';

// Polyfill imagejpeg when GD extension is not available to allow Laravel FileFactory to generate images in tests
if (!function_exists('imagejpeg')) {
    function imagejpeg($image, $filename = null, $quality = null)
    {
        if ($filename !== null) {
            // Write a valid 1x1 JPEG image so image libraries can decode it during tests
            $jpg = base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9YJ7swAAAABJRU5ErkJggg=='
            );
            file_put_contents($filename, $jpg);
        }

        return true;
    }

}

<?php

namespace Tests\Unit\Traits;

use App\Traits\HasCacheKeyGeneration;
use Illuminate\Support\Str;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Mock class to test the HasCacheKeyGeneration trait
 */
class HasCacheKeyGenerationTestStub
{
    use HasCacheKeyGeneration;
}

class HasCacheKeyGenerationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_generates_cache_key_with_base_key_only()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';

        // Act
        $result = $stub->generateCacheKey($baseKey);

        // Assert
        $this->assertEquals($baseKey, $result);
    }

    /** @test */
    public function it_generates_cache_key_with_base_key_and_data()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';
        $data = ['id' => 1, 'name' => 'test'];

        // Act
        $result = $stub->generateCacheKey($baseKey, $data);

        // Assert
        $expected = $baseKey . '_' . md5(json_encode($data));
        $this->assertEquals($expected, $result);
    }

    /** @test */
    public function it_generates_same_cache_key_for_same_data()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';
        $data = ['id' => 1, 'name' => 'test'];

        // Act
        $result1 = $stub->generateCacheKey($baseKey, $data);
        $result2 = $stub->generateCacheKey($baseKey, $data);

        // Assert
        $this->assertEquals($result1, $result2);
    }

    /** @test */
    public function it_generates_different_cache_key_for_different_data()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';
        $data1 = ['id' => 1, 'name' => 'test'];
        $data2 = ['id' => 2, 'name' => 'test'];

        // Act
        $result1 = $stub->generateCacheKey($baseKey, $data1);
        $result2 = $stub->generateCacheKey($baseKey, $data2);

        // Assert
        $this->assertNotEquals($result1, $result2);
    }

    /** @test */
    public function it_generates_different_cache_key_for_different_data_order()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';
        $data1 = ['id' => 1, 'name' => 'test'];
        $data2 = ['name' => 'test', 'id' => 1]; // Same data, different order

        // Act
        $result1 = $stub->generateCacheKey($baseKey, $data1);
        $result2 = $stub->generateCacheKey($baseKey, $data2);

        // Assert
        // JSON encoding should produce the same string regardless of key order
        $this->assertEquals($result1, $result2);
    }

    /** @test */
    public function it_handles_null_data()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';

        // Act
        $result = $stub->generateCacheKey($baseKey, null);

        // Assert
        $this->assertEquals($baseKey, $result);
    }

    /** @test */
    public function it_handles_empty_array_data()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';
        $data = [];

        // Act
        $result = $stub->generateCacheKey($baseKey, $data);

        // Assert
        $expected = $baseKey . '_' . md5(json_encode($data));
        $this->assertEquals($expected, $result);
    }

    /** @test */
    public function it_handles_object_data()
    {
        // Arrange
        $stub = new HasCacheKeyGenerationTestStub();
        $baseKey = 'test_key';
        $data = (object) ['id' => 1, 'name' => 'test'];

        // Act
        $result = $stub->generateCacheKey($baseKey, $data);

        // Assert
        $expected = $baseKey . '_' . md5(json_encode($data));
        $this->assertEquals($expected, $result);
    }
}
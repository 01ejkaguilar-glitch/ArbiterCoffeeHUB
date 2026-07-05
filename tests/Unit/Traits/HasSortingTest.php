<?php

namespace Tests\Unit\Traits;

use App\Traits\HasSorting;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

/**
 * Mock class to test the HasSorting trait
 */
class HasSortingTestStub
{
    use HasSorting;
}

class HasSortingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_applies_sorting_with_valid_column_and_order()
    {
        // Arrange
        $stub = new HasSortingTestStub();
        $query = Mockery::mock(Builder::class);
        $query->shouldReceive('orderBy')
            ->with('name', 'asc')
            ->once()
            ->andReturnSelf();

        $request = Mockery::mock(Request::class);
        $request->shouldReceive('get')
            ->with('sort_by', 'name')
            ->andReturn('name');
        $request->shouldReceive('get')
            ->with('sort_order', 'desc')
            ->andReturn('asc');

        // Act
        $stub->applySorting($query, $request);

        // Assert (expectations already set in Mockery)
        $this->assertTrue(true);
    }

    /** @test */
    public function it_defaults_to_created_at_desc_when_no_parameters_provided()
    {
        // Arrange
        $stub = new HasSortingTestStub();
        $query = Mockery::mock(Builder::class);
        $query->shouldReceive('orderBy')
            ->with('created_at', 'desc')
            ->once()
            ->andReturnSelf();

        $request = Mockery::mock(Request::class);
        $request->shouldReceive('get')
            ->with('sort_by', 'created_at')
            ->andReturn(null);
        $request->shouldReceive('get')
            ->with('sort_order', 'desc')
            ->andReturn(null);

        // Act
        $stub->applySorting($query, $request);

        // Assert
        $this->assertTrue(true);
    }

    /** @test */
    public function it_ignores_invalid_sort_columns_and_defaults_to_created_at()
    {
        // Arrange
        $stub = new HasSortingTestStub();
        $query = Mockery::mock(Builder::class);
        $query->shouldReceive('orderBy')
            ->with('created_at', 'desc')
            ->once()
            ->andReturnSelf();

        $request = Mockery::mock(Request::class);
        $request->shouldReceive('get')
            ->with('sort_by', 'invalid_column')
            ->andReturn('invalid_column');
        $request->shouldReceive('get')
            ->with('sort_order', 'desc')
            ->andReturn('asc');

        // Act
        $stub->applySorting($query, $request);

        // Assert
        $this->assertTrue(true);
    }

    /** @test */
    public function it_allows_only_specified_sort_columns()
    {
        // Arrange
        $stub = new HasSortingTestStub();
        $allowedColumns = ['id', 'name', 'price', 'created_at', 'updated_at'];

        foreach ($allowedColumns as $column) {
            $query = Mockery::mock(Builder::class);
            $query->shouldReceive('orderBy')
                ->with($column, 'asc')
                ->once()
                ->andReturnSelf();

            $request = Mockery::mock(Request::class);
            $request->shouldReceive('get')
                ->with('sort_by', $column)
                ->andReturn($column);
            $request->shouldReceive('get')
                ->with('sort_order', 'desc')
                ->andReturn('asc');

            // Act
            $stub->applySorting($query, $request);

            // Assert (expectations already set in Mockery)
            $this->assertTrue(true);
        }
    }

    /** @test */
    public function it_handles_case_insensitive_sort_orders()
    {
        // Arrange
        $stub = new HasSortingTestStub();
        $query = Mockery::mock(Builder::class);
        $query->shouldReceive('orderBy')
            ->with('name', 'ASC')
            ->once()
            ->andReturnSelf();

        $request = Mockery::mock(Request::class);
        $request->shouldReceive('get')
            ->with('sort_by', 'name')
            ->andReturn('name');
        $request->shouldReceive('get')
            ->with('sort_order', 'desc')
            ->andReturn('ASC');

        // Act
        $stub->applySorting($query, $request);

        // Assert
        $this->assertTrue(true);
    }

    /** @test */
    public function it_defaults_to_desc_when_sort_order_is_empty()
    {
        // Arrange
        $stub = new HasSortingTestStub();
        $query = Mockery::mock(Builder::class);
        $query->shouldReceive('orderBy')
            ->with('name', 'desc')
            ->once()
            ->andReturnSelf();

        $request = Mockery::mock(Request::class);
        $request->shouldReceive('get')
            ->with('sort_by', 'name')
            ->andReturn('name');
        $request->shouldReceive('get')
            ->with('sort_order', 'desc')
            ->andReturn('');

        // Act
        $stub->applySorting($query, $request);

        // Assert
        $this->assertTrue(true);
    }
}
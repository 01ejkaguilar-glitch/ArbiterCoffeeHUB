<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Products table: name for search queries
        $this->addIndexIfNotExists('products', 'idx_products_name', function (Blueprint $table) {
            $table->index('name', 'idx_products_name');
        });

        // Categories table: is_active for filtering, sort_order for ordering
        $this->addIndexIfNotExists('categories', 'idx_categories_is_active', function (Blueprint $table) {
            $table->index('is_active', 'idx_categories_is_active');
        });
        $this->addIndexIfNotExists('categories', 'idx_categories_sort_order', function (Blueprint $table) {
            $table->index('sort_order', 'idx_categories_sort_order');
        });

        // Shifts table: status for filtering, composite indexes for common query patterns
        $this->addIndexIfNotExists('shifts', 'idx_shifts_status', function (Blueprint $table) {
            $table->index('status', 'idx_shifts_status');
        });
        $this->addIndexIfNotExists('shifts', 'idx_shifts_date_status', function (Blueprint $table) {
            $table->index(['date', 'status'], 'idx_shifts_date_status');
        });
        $this->addIndexIfNotExists('shifts', 'idx_shifts_employee_status', function (Blueprint $table) {
            $table->index(['employee_id', 'status'], 'idx_shifts_employee_status');
        });

        // Tasks table: priority for filtering, composite indexes for common query patterns
        $this->addIndexIfNotExists('tasks', 'idx_tasks_priority', function (Blueprint $table) {
            $table->index('priority', 'idx_tasks_priority');
        });
        $this->addIndexIfNotExists('tasks', 'idx_tasks_assigned_to_status', function (Blueprint $table) {
            $table->index(['assigned_to', 'status'], 'idx_tasks_assigned_to_status');
        });
        $this->addIndexIfNotExists('tasks', 'idx_tasks_assigned_to_due_date', function (Blueprint $table) {
            $table->index(['assigned_to', 'due_date'], 'idx_tasks_assigned_to_due_date');
        });

        // LeaveRequests table: type for filtering, date columns for range queries, composite indexes
        $this->addIndexIfNotExists('leave_requests', 'idx_leave_requests_type', function (Blueprint $table) {
            $table->index('type', 'idx_leave_requests_type');
        });
        $this->addIndexIfNotExists('leave_requests', 'idx_leave_requests_start_date', function (Blueprint $table) {
            $table->index('start_date', 'idx_leave_requests_start_date');
        });
        $this->addIndexIfNotExists('leave_requests', 'idx_leave_requests_end_date', function (Blueprint $table) {
            $table->index('end_date', 'idx_leave_requests_end_date');
        });
        $this->addIndexIfNotExists('leave_requests', 'idx_leave_requests_employee_type', function (Blueprint $table) {
            $table->index(['employee_id', 'type'], 'idx_leave_requests_employee_type');
        });
        $this->addIndexIfNotExists('leave_requests', 'idx_leave_requests_status_start_date', function (Blueprint $table) {
            $table->index(['status', 'start_date'], 'idx_leave_requests_status_start_date');
        });

        // Orders table: order_type and payment_method for filtering
        $this->addIndexIfNotExists('orders', 'idx_orders_order_type', function (Blueprint $table) {
            $table->index('order_type', 'idx_orders_order_type');
        });
        $this->addIndexIfNotExists('orders', 'idx_orders_payment_method', function (Blueprint $table) {
            $table->index('payment_method', 'idx_orders_payment_method');
        });
    }

    /**
     * Add index if it doesn't exist
     */
    private function addIndexIfNotExists(string $tableName, string $indexName, callable $callback): void
    {
        if (!$this->indexExists($tableName, $indexName)) {
            Schema::table($tableName, $callback);
        }
    }

    /**
     * Check if index exists
     */
    private function indexExists(string $tableName, string $indexName): bool
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('{$tableName}')");
            foreach ($indexes as $index) {
                if (($index->name ?? null) === $indexName) {
                    return true;
                }
            }

            return false;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            $indexes = DB::select("SHOW INDEX FROM {$tableName} WHERE Key_name = ?", [$indexName]);
            return !empty($indexes);
        }

        if ($driver === 'pgsql') {
            $indexes = DB::select(
                'SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?',
                [$tableName, $indexName]
            );

            return !empty($indexes);
        }

        return false;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_name');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_is_active');
            $table->dropIndex('idx_categories_sort_order');
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->dropIndex('idx_shifts_status');
            $table->dropIndex('idx_shifts_date_status');
            $table->dropIndex('idx_shifts_employee_status');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('idx_tasks_priority');
            $table->dropIndex('idx_tasks_assigned_to_status');
            $table->dropIndex('idx_tasks_assigned_to_due_date');
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropIndex('idx_leave_requests_type');
            $table->dropIndex('idx_leave_requests_start_date');
            $table->dropIndex('idx_leave_requests_end_date');
            $table->dropIndex('idx_leave_requests_employee_type');
            $table->dropIndex('idx_leave_requests_status_start_date');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_order_type');
            $table->dropIndex('idx_orders_payment_method');
        });
    }
};

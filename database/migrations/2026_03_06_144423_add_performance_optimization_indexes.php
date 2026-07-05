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
        // Cart items: queried by cart_id and product_id
        if (!$this->indexExists('cart_items', 'idx_cart_items_cart_id')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->index('cart_id', 'idx_cart_items_cart_id');
            });
        }
        if (!$this->indexExists('cart_items', 'idx_cart_items_product_id')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->index('product_id', 'idx_cart_items_product_id');
            });
        }

        // Carts: queried by user_id
        if (!$this->indexExists('carts', 'idx_carts_user_id')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->index('user_id', 'idx_carts_user_id');
            });
        }

        // Shifts: queried by employee_id and date ranges
        if (!$this->indexExists('shifts', 'idx_shifts_employee_id')) {
            Schema::table('shifts', function (Blueprint $table) {
                $table->index('employee_id', 'idx_shifts_employee_id');
            });
        }
        if (!$this->indexExists('shifts', 'idx_shifts_date')) {
            Schema::table('shifts', function (Blueprint $table) {
                $table->index('date', 'idx_shifts_date');
            });
        }
        if (!$this->indexExists('shifts', 'idx_shifts_employee_date')) {
            Schema::table('shifts', function (Blueprint $table) {
                $table->index(['employee_id', 'date'], 'idx_shifts_employee_date');
            });
        }

        // Tasks: queried by assigned_to, status, priority, due_date
        if (!$this->indexExists('tasks', 'idx_tasks_assigned_to')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->index('assigned_to', 'idx_tasks_assigned_to');
            });
        }
        if (!$this->indexExists('tasks', 'idx_tasks_status')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->index('status', 'idx_tasks_status');
            });
        }
        if (!$this->indexExists('tasks', 'idx_tasks_due_date')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->index('due_date', 'idx_tasks_due_date');
            });
        }
        if (!$this->indexExists('tasks', 'idx_tasks_status_due_date')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->index(['status', 'due_date'], 'idx_tasks_status_due_date');
            });
        }

        // Employees: filtered by status, position, department
        if (!$this->indexExists('employees', 'idx_employees_status')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->index('status', 'idx_employees_status');
            });
        }
        if (!$this->indexExists('employees', 'idx_employees_position')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->index('position', 'idx_employees_position');
            });
        }

        // Orders: composite indexes for common query patterns
        if (!$this->indexExists('orders', 'idx_orders_payment_status')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index('payment_status', 'idx_orders_payment_status');
            });
        }
        if (!$this->indexExists('orders', 'idx_orders_status_created_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['status', 'created_at'], 'idx_orders_status_created_at');
            });
        }
        if (!$this->indexExists('orders', 'idx_orders_user_created_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index(['user_id', 'created_at'], 'idx_orders_user_created_at');
            });
        }

        // Leave requests: queried by employee_id and status
        if (!$this->indexExists('leave_requests', 'idx_leave_requests_employee_id')) {
            Schema::table('leave_requests', function (Blueprint $table) {
                $table->index('employee_id', 'idx_leave_requests_employee_id');
            });
        }
        if (!$this->indexExists('leave_requests', 'idx_leave_requests_status')) {
            Schema::table('leave_requests', function (Blueprint $table) {
                $table->index('status', 'idx_leave_requests_status');
            });
        }
    }

    /**
     * Check if index exists for various database drivers
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
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex('idx_cart_items_cart_id');
            $table->dropIndex('idx_cart_items_product_id');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('idx_carts_user_id');
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->dropIndex('idx_shifts_employee_id');
            $table->dropIndex('idx_shifts_date');
            $table->dropIndex('idx_shifts_employee_date');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('idx_tasks_assigned_to');
            $table->dropIndex('idx_tasks_status');
            $table->dropIndex('idx_tasks_due_date');
            $table->dropIndex('idx_tasks_status_due_date');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex('idx_employees_status');
            $table->dropIndex('idx_employees_position');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_payment_status');
            $table->dropIndex('idx_orders_status_created_at');
            $table->dropIndex('idx_orders_user_created_at');
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropIndex('idx_leave_requests_employee_id');
            $table->dropIndex('idx_leave_requests_status');
        });
    }
};
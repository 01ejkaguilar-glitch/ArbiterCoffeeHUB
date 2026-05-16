<?php

namespace App\Http\Controllers\Api;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends BaseController
{
    /**
     * Get all employees
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Employee::with('user');

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            // Filter by position
            if ($request->has('position')) {
                $query->where('position', $request->input('position'));
            }

            // Filter by department
            if ($request->has('department')) {
                $query->where('department', $request->input('department'));
            }

            $employees = $query->orderBy('employee_number', 'asc')->paginate(20);

            return $this->sendResponse($employees, 'Employees retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve employees', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get single employee
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $employee = Employee::with(['user', 'attendances', 'shifts', 'tasks'])->findOrFail($id);

            return $this->sendResponse($employee, 'Employee retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Employee not found', 404, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Create new employee
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(\App\Http\Requests\StoreEmployeeRequest $request)
    {
        try {
            $data = $request->validated();

            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
            ]);

            // Assign role
            $user->assignRole($data['role']);

            // Generate employee number
            $latestEmployee = Employee::latest('id')->first();
            $nextNumber = $latestEmployee ? (int)substr($latestEmployee->employee_number, 3) + 1 : 1;
            $employeeNumber = 'EMP' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

            // Create employee record
            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_number' => $employeeNumber,
                'position' => $data['position'],
                'department' => $data['department'] ?? null,
                'hire_date' => $data['hire_date'],
                'salary' => $data['salary'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
            ]);

            DB::commit();

            $employee->load('user');

            return $this->sendResponse($employee, 'Employee created successfully', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Failed to create employee', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Update employee
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(\App\Http\Requests\UpdateEmployeeRequest $request, $id)
    {
        try {
            $data = $request->validated();

            DB::beginTransaction();

            $employee = Employee::findOrFail($id);
            $employee->update(array_filter($request->only([
                'position',
                'department',
                'hire_date',
                'salary',
                'status',
                'emergency_contact_name',
                'emergency_contact_phone',
            ]), function($v) { return $v !== null; }));

            // Update user info if provided
            $userData = array_filter($data, function($k) { return in_array($k, ['name','phone','email','password']); }, ARRAY_FILTER_USE_KEY);
            if (!empty($userData)) {
                if (isset($userData['password'])) {
                    $userData['password'] = Hash::make($userData['password']);
                }
                $employee->user->update($userData);
            }

            DB::commit();

            $employee->load('user');

            return $this->sendResponse($employee, 'Employee updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Failed to update employee', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete employee
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $employee = Employee::findOrFail($id);
            $user = $employee->user;

            // Delete employee record (will cascade)
            $employee->delete();

            // Delete user account
            $user->delete();

            DB::commit();

            return $this->sendResponse(null, 'Employee deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Failed to delete employee', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get employee statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'total_employees' => Employee::count(),
                'active_employees' => Employee::where('status', 'active')->count(),
                'on_leave' => Employee::where('status', 'on_leave')->count(),
                'by_position' => Employee::select(['position', DB::raw('count(*) as count')])
                    ->groupBy('position')
                    ->get(),
                'by_department' => Employee::select(['department', DB::raw('count(*) as count')])
                    ->whereNotNull('department')
                    ->groupBy('department')
                    ->get(),
            ];

            return $this->sendResponse($stats, 'Employee statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve statistics', 500, ['error' => $e->getMessage()]);
        }
    }
}

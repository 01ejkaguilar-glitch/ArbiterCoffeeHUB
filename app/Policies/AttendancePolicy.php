<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Attendance;
use App\Models\Employee;

class AttendancePolicy
{
    /**
     * Determine if the user can view attendance records
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super-admin', 'workforce-manager']);
    }

    /**
     * Determine if the user can view specific attendance record
     */
    public function view(User $user, Attendance $attendance): bool
    {
        // Employees can view their own attendance
        $employee = Employee::where('user_id', $user->id)->first();
        if ($employee && $employee->id === $attendance->employee_id) {
            return true;
        }

        // Managers and admins can view all attendance
        return $user->hasAnyRole(['admin', 'super-admin', 'workforce-manager']);
    }

    /**
     * Determine if the user can create attendance records
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super-admin', 'workforce-manager', 'barista', 'kitchen-staff']);
    }

    /**
     * Determine if the user can update attendance records
     */
    public function update(User $user, Attendance $attendance): bool
    {
        // Only managers and admins can update attendance
        return $user->hasAnyRole(['admin', 'super-admin', 'workforce-manager']);
    }

    /**
     * Determine if the user can delete attendance records
     */
    public function delete(User $user, Attendance $attendance): bool
    {
        // Only admins can delete/archive attendance records
        return $user->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Determine if the user can restore deleted attendance records
     */
    public function restore(User $user, Attendance $attendance): bool
    {
        return $user->hasAnyRole(['admin', 'super-admin']);
    }
}

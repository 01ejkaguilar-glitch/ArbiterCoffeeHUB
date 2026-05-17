<?php

namespace App\Http\Controllers\Api;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AttendanceController extends BaseController
{
    /**
     * Get attendance records
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Attendance::with(['employee.user']);

            // Filter by employee
            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->input('employee_id'));
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->whereDate('date', '>=', $request->input('start_date'));
            }
            if ($request->has('end_date')) {
                $query->whereDate('date', '<=', $request->input('end_date'));
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            $attendances = $query->orderBy('date', 'desc')->paginate(50);

            return $this->sendResponse($attendances, 'Attendance records retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve attendance records', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Clock in
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clockIn(Request $request)
    {
        try {
            $user = Auth::user();
            $employee = Employee::where('user_id', $user->id)->firstOrFail();

            $today = Carbon::today();

            // Check if already clocked in today
            $attendance = Attendance::where('employee_id', $employee->id)
                ->where('date', $today->format('Y-m-d'))
                ->first();

            if ($attendance && $attendance->clock_in) {
                return $this->sendError('Already clocked in today', 400);
            }

            // Create or update attendance
            if (!$attendance) {
                $attendance = Attendance::create([
                    'employee_id' => $employee->id,
                    'date' => $today,
                    'clock_in' => now(),
                    'status' => 'present',
                ]);
            } else {
                $attendance->clock_in = now();
                $attendance->status = 'present';
                $attendance->save();
            }

            return $this->sendResponse($attendance, 'Clocked in successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to clock in', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Clock out
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clockOut(Request $request)
    {
        try {
            $user = Auth::user();
            $employee = Employee::where('user_id', $user->id)->firstOrFail();

            $today = Carbon::today();

            $attendance = Attendance::where('employee_id', $employee->id)
                ->where('date', $today->format('Y-m-d'))
                ->firstOrFail();

            if (!$attendance->clock_in) {
                return $this->sendError('Must clock in first', 400);
            }

            if ($attendance->clock_out) {
                return $this->sendError('Already clocked out today', 400);
            }

            $attendance->clock_out = now();
            $attendance->save();

            return $this->sendResponse($attendance, 'Clocked out successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to clock out', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Mark attendance manually (for managers)
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAttendance(Request $request)
    {
        try {
            $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'date' => 'required|date',
                'status' => 'required|in:present,absent,late,half_day,on_leave',
                'clock_in' => 'nullable|date_format:H:i',
                'clock_out' => 'nullable|date_format:H:i',
                'notes' => 'nullable|string|max:500',
            ]);

            $attendance = Attendance::updateOrCreate(
                [
                    'employee_id' => $request->input('employee_id'),
                    'date' => $request->input('date'),
                ],
                [
                        'clock_in' => $request->input('clock_in') ? Carbon::parse($request->input('date') . ' ' . $request->input('clock_in')) : null,
                        'clock_out' => $request->input('clock_out') ? Carbon::parse($request->input('date') . ' ' . $request->input('clock_out')) : null,
                        'status' => $request->input('status'),
                        'notes' => $request->input('notes'),
                ]
            );

            $attendance->load('employee.user');

            return $this->sendResponse($attendance, 'Attendance marked successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to mark attendance', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get attendance summary
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSummary(Request $request)
    {
        try {
            // If no parameters provided, return today's summary for all employees
            if (!$request->has('employee_id') && !$request->has('month')) {
                $today = Carbon::today();

                $attendances = Attendance::whereDate('date', $today)->get();

                $summary = [
                    'present_today' => $attendances->where('status', 'present')->count(),
                    'absent_today' => $attendances->where('status', 'absent')->count(),
                    'late_today' => $attendances->where('status', 'late')->count(),
                    'total_employees' => Employee::count(),
                    'on_leave_today' => $attendances->where('status', 'on_leave')->count(),
                    'half_day_today' => $attendances->where('status', 'half_day')->count(),
                ];

                return $this->sendResponse($summary, 'Today\'s attendance summary retrieved successfully');
            }

            // Original validation for specific employee/month summary
            $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'month' => 'required|date_format:Y-m',
            ]);

            $startDate = Carbon::parse($request->input('month') . '-01')->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            $attendances = Attendance::where('employee_id', $request->input('employee_id'))
                ->whereBetween('date', [$startDate, $endDate])
                ->get();

            $summary = [
                'total_days' => $attendances->count(),
                'present' => $attendances->where('status', 'present')->count(),
                'absent' => $attendances->where('status', 'absent')->count(),
                'late' => $attendances->where('status', 'late')->count(),
                'half_day' => $attendances->where('status', 'half_day')->count(),
                'on_leave' => $attendances->where('status', 'on_leave')->count(),
                'total_hours' => round($attendances->sum('hours_worked'), 2),
            ];

            return $this->sendResponse($summary, 'Attendance summary retrieved successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve attendance summary', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get authenticated employee's attendance status (today + recent history)
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyAttendance(Request $request)
    {
        try {
            $user = $request->user();
            $employee = Employee::where('user_id', $user->id)->first();

            if (!$employee) {
                return $this->sendError('Employee record not found', 404);
            }

            $today = Carbon::today();

            // Today's record
            $todayRecord = Attendance::where('employee_id', $employee->id)
                ->where('date', $today->format('Y-m-d'))
                ->first();

            // Recent history – last 14 days (excluding today)
            $history = Attendance::where('employee_id', $employee->id)
                ->where('date', '<', $today->format('Y-m-d'))
                ->orderBy('date', 'desc')
                ->limit(14)
                ->get();

            // Monthly stats for current month
            $startOfMonth = $today->copy()->startOfMonth();
            $monthRecords = Attendance::where('employee_id', $employee->id)
                ->whereBetween('date', [$startOfMonth, $today])
                ->get();

            $stats = [
                'present'     => $monthRecords->where('status', 'present')->count(),
                'late'        => $monthRecords->where('status', 'late')->count(),
                'absent'      => $monthRecords->where('status', 'absent')->count(),
                'total_hours' => round($monthRecords->sum('hours_worked'), 1),
            ];

            return $this->sendResponse([
                'today'   => $todayRecord,
                'history' => $history,
                'stats'   => $stats,
            ], 'My attendance retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve attendance', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Update attendance record
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // Only managers and admins can update attendance records
            $user = Auth::user();

            if (!$user->hasAnyRole(['manager', 'workforce-manager', 'admin', 'super-admin'])) {
                return $this->sendError('Unauthorized', 403);
            }

            $attendance = Attendance::find($id);

            if (!$attendance) {
                return $this->sendError('Attendance record not found', 404);
            }

            // Only allow updates if not yet approved (to maintain audit integrity)
            if ($attendance->status === 'approved') {
                return $this->sendError('Cannot update approved attendance record', 400);
            }

            $request->validate([
                'employee_id' => 'sometimes|exists:employees,id',
                'date' => 'sometimes|date',
                'status' => 'sometimes|in:present,absent,late,half_day,on_leave',
                'clock_in' => 'nullable|date_format:H:i',
                'clock_out' => 'nullable|date_format:H:i',
                'notes' => 'nullable|string|max:500',
                'hours_worked' => 'nullable|numeric|min:0|max:24',
            ]);

            if ($request->has('employee_id')) {
                $attendance->employee_id = $request->input('employee_id');
            }

            if ($request->has('date')) {
                $attendance->date = $request->input('date');
            }

            if ($request->has('status')) {
                $attendance->status = $request->input('status');
            }

            if ($request->has('clock_in')) {
                $attendance->clock_in = $request->input('clock_in') ?
                    Carbon::parse($attendance->date . ' ' . $request->input('clock_in')) : null;
            }

            if ($request->has('clock_out')) {
                $attendance->clock_out = $request->input('clock_out') ?
                    Carbon::parse($attendance->date . ' ' . $request->input('clock_out')) : null;
            }

            if ($request->has('notes')) {
                $attendance->notes = $request->input('notes');
            }

            if ($request->has('hours_worked')) {
                $attendance->hours_worked = $request->input('hours_worked');
            }

            $attendance->save();

            $attendance->load('employee.user');

            return $this->sendResponse($attendance, 'Attendance record updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to update attendance record', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete attendance record
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            // Only managers and admins can delete attendance records
            $user = Auth::user();

            if (!$user->hasAnyRole(['manager', 'workforce-manager', 'admin', 'super-admin'])) {
                return $this->sendError('Unauthorized', 403);
            }

            $attendance = Attendance::find($id);

            if (!$attendance) {
                return $this->sendError('Attendance record not found', 404);
            }

            // Only allow deletion if not yet approved (to maintain audit integrity)
            if ($attendance->status === 'approved') {
                return $this->sendError('Cannot delete approved attendance record', 400);
            }

            $attendance->delete();

            return $this->sendResponse([], 'Attendance record deleted successfully');

        } catch (\Exception $e) {
            return $this->sendError('Failed to delete attendance record', 500, ['error' => $e->getMessage()]);
        }
    }
}
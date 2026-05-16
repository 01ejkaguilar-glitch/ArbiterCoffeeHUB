    
    public function show($id)
    {
        try {
            $attendance = Attendance::with(['employee.user'])->find($id);
            if (!$attendance) {
                return $this->sendError('Attendance record not found', 404);
            }
            if (!Auth::user()->hasAnyRole(['admin', 'super-admin', 'workforce-manager'])) {
                return $this->sendError('Unauthorized', 403);
            }
            return $this->sendResponse($attendance, 'Attendance record retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve attendance record', 500, ['error' => $e->getMessage()]);
        }
    }

    public function update($id, Request $request)
    {
        try {
            if (!Auth::user()->hasAnyRole(['admin', 'super-admin', 'workforce-manager'])) {
                return $this->sendError('Unauthorized - only managers can update attendance', 403);
            }
            $attendance = Attendance::find($id);
            if (!$attendance) {
                return $this->sendError('Attendance record not found', 404);
            }
            $request->validate([
                'status' => 'sometimes|in:present,absent,late,half_day,on_leave',
                'clock_in' => 'sometimes|nullable|date_format:H:i',
                'clock_out' => 'sometimes|nullable|date_format:H:i',
                'notes' => 'sometimes|nullable|string|max:500',
            ]);
            if ($request->has('status')) {
                $attendance->status = $request->input('status');
            }
            if ($request->has('clock_in') && $request->input('clock_in')) {
                $attendance->clock_in = Carbon::parse($attendance->date . ' ' . $request->input('clock_in'));
            }
            if ($request->has('clock_out') && $request->input('clock_out')) {
                $attendance->clock_out = Carbon::parse($attendance->date . ' ' . $request->input('clock_out'));
            }
            if ($request->has('notes')) {
                $attendance->notes = $request->input('notes');
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

    public function destroy($id)
    {
        try {
            if (!Auth::user()->hasAnyRole(['admin', 'super-admin'])) {
                return $this->sendError('Unauthorized - only admins can delete attendance records', 403);
            }
            $attendance = Attendance::find($id);
            if (!$attendance) {
                return $this->sendError('Attendance record not found', 404);
            }
            $attendance->delete();
            return $this->sendResponse(null, 'Attendance record deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete attendance record', 500, ['error' => $e->getMessage()]);
        }
    }
}

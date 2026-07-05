<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Models\Inquiry;
use App\Models\User;
use App\Notifications\NewInquirySubmission;
use App\Notifications\InquiryAutoReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Http\Requests\StoreInquiryRequest;
use App\Http\Requests\StoreArbiterExpressRequest;
use App\Http\Requests\UpdateInquiryRequest;

class InquiryController extends BaseController
{
    /**
     * Store a barista training inquiry (public).
     */
    public function storeBaristaTraining(StoreInquiryRequest $request)
    {
        $inquiry = Inquiry::create([
            'type' => 'barista_training',
            'full_name' => $request->validated('full_name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'details' => $request->only('experience_level', 'preferred_schedule', 'background', 'motivation'),
        ]);

        try {
            // Send email notification to admins
            $admins = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'super-admin']);
            })->get();

            if ($admins->isNotEmpty()) {
                Notification::send($admins, new NewInquirySubmission($inquiry));
            }

            // Send auto-reply email to customer
            Notification::route('mail', $inquiry->email)
                ->notify(new InquiryAutoReply($inquiry));
        } catch (\Exception $e) {
            \Log::error('Failed to send barista training inquiry notifications: ' . $e->getMessage());
        }

        return $this->sendCreated($inquiry, 'Your training inquiry has been submitted successfully. We will contact you soon.');
    }

    /**
     * Store an Arbiter Express inquiry (public).
     */
    public function storeArbiterExpress(StoreArbiterExpressRequest $request)
    {
        $inquiry = Inquiry::create([
            'type' => 'arbiter_express',
            'full_name' => $request->validated('full_name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'details' => $request->only('event_date', 'event_time', 'location', 'guest_count', 'service_type', 'menu_preferences', 'budget_range', 'special_requests'),
        ]);

        try {
            // Send email notification to admins
            $admins = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'super-admin']);
            })->get();

            if ($admins->isNotEmpty()) {
                Notification::send($admins, new NewInquirySubmission($inquiry));
            }

            // Send auto-reply email to customer
            Notification::route('mail', $inquiry->email)
                ->notify(new InquiryAutoReply($inquiry));
        } catch (\Exception $e) {
            \Log::error('Failed to send arbiter express inquiry notifications: ' . $e->getMessage());
        }

        return $this->sendCreated($inquiry, 'Your mobile coffee service inquiry has been submitted successfully. We will contact you soon.');
    }

    /**
     * Display a listing of inquiries (admin only).
     */
    public function index(Request $request)
    {
        $query = Inquiry::query();

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Sorting
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $inquiries = $query->paginate($perPage);

        return $this->sendResponse($inquiries, 'Inquiries retrieved successfully');
    }

    /**
     * Display the specified inquiry (admin only).
     */
    public function show($id)
    {
        $inquiry = Inquiry::find($id);

        if (!$inquiry) {
            return $this->sendNotFound('Inquiry not found');
        }

        return $this->sendResponse($inquiry, 'Inquiry retrieved successfully');
    }

    /**
     * Update inquiry status (admin only).
     */
    public function update(UpdateInquiryRequest $request, $id)
    {
        $inquiry = Inquiry::find($id);

        if (!$inquiry) {
            return $this->sendNotFound('Inquiry not found');
        }

        $inquiry->update($request->validated('status'));

        return $this->sendResponse($inquiry, 'Inquiry status updated successfully');
    }

    /**
     * Remove the specified inquiry (admin only).
     */
    public function destroy($id)
    {
        $inquiry = Inquiry::find($id);

        if (!$inquiry) {
            return $this->sendNotFound('Inquiry not found');
        }

        $inquiry->delete();

        return $this->sendResponse(null, 'Inquiry deleted successfully');
    }
}

<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Requests\GetReportRequest;
use App\Http\Requests\GetAttendanceRequest;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\AdjustStockRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\ProcessGCashRequest;
use App\Http\Requests\SendOrderNotificationRequest;

class RequestValidationTest extends TestCase
{
    public function test_report_request_rules()
    {
        $req = new GetReportRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('start_date', $rules);
        $this->assertArrayHasKey('end_date', $rules);
    }

    public function test_attendance_request_rules()
    {
        $req = new GetAttendanceRequest();
        $rules = $req->rules();

        $this->assertArrayHasKey('employee_id', $rules);
    }

    public function test_inventory_requests_rules()
    {
        $store = new StoreInventoryRequest();
        $adjust = new AdjustStockRequest();

        $this->assertArrayHasKey('name', $store->rules());
        $this->assertArrayHasKey('type', $adjust->rules());
    }

    public function test_profile_and_payment_requests()
    {
        $profile = new UpdateProfileRequest();
        $gcash = new ProcessGCashRequest();
        $notify = new SendOrderNotificationRequest();

        $this->assertArrayHasKey('name', $profile->rules());
        $this->assertArrayHasKey('order_id', $gcash->rules());
        $this->assertArrayHasKey('type', $notify->rules());
    }
}

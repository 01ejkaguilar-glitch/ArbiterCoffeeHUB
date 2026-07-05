<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\FailedJobController;

Route::get('/', function () {
    return view('welcome');
});

// SEO Routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

// Authentication Routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Password Reset Routes
Route::get('/password/reset', function () {
    return view('auth.passwords.email');
})->name('password.request');
Route::post('/password/email', function () {
    // In a real app, you would send the reset link email
    return back()->with('status', 'We have emailed your password reset link!');
})->name('password.email');
Route::get('/password/reset/{token}', function ($token) {
    return view('auth.passwords.reset', ['token' => $token]);
})->name('password.reset');
Route::post('/password/reset', function () {
    // In a real app, you would validate the token and reset the password
    return back()->with('status', 'Your password has been reset!');
})->name('password.update');

// Admin Routes
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/failed-jobs', [FailedJobController::class, 'index'])->name('admin.failed-jobs.index');
    Route::get('/failed-jobs/{id}', [FailedJobController::class, 'show'])->name('admin.failed-jobs.show');
    Route::post('/failed-jobs/{id}/retry', [FailedJobController::class, 'retry'])->name('admin.failed-jobs.retry');
    Route::delete('/failed-jobs/{id}', [FailedJobController::class, 'destroy'])->name('admin.failed-jobs.destroy');
    Route::post('/failed-jobs/retry-all', [FailedJobController::class, 'retryAll'])->name('admin.failed-jobs.retry-all');
    Route::delete('/failed-jobs/clear-all', [FailedJobController::class, 'clearAll'])->name('admin.failed-jobs.clear-all');
});

# Security Validation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement security validation improvements based on SECURITY_VALIDATION_FINDINGS.md including standardized Form Requests usage, fixing image validation inconsistencies (adding webp support), and implementing sort column validation.

**Architecture:** This plan follows Laravel best practices by centralizing validation logic in Form Request classes, standardizing validation rules across controllers, and adding whitelist validation for sortable columns to prevent potential SQL injection vectors.

**Tech Stack:** PHP Laravel, Form Requests, Validation Rules, Eloquent ORM

## Global Constraints
- Use Laravel's built-in validation mechanisms
- Follow existing code patterns in the codebase
- Maintain backward compatibility where possible
- All validation rules must be consistent across similar entities
- Sort column validation must use whitelists
- Image validation must include webp support
- All Form Requests must include proper authorization logic
---
## Task 1: Update RegisterUserRequest to match AuthController validation rules

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\RegisterUserRequest.php:20-30`

**Interfaces:**
- Consumes: `Illuminate\Foundation\Http\FormRequest`
- Produces: Validated registration data with updated password rules

**Why:** The AuthController's register method currently uses stronger password validation (min:12, special char regex) than the RegisterUserRequest Form Request (min:8). This creates inconsistency and potential security gaps.

### Steps
- [ ] **Step 1: Update password validation rule in RegisterUserRequest**

```php
'password' => 'required|string|min:12|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
```

- [ ] **Step 2: Update password confirmation message**

```php
'password.confirmed' => 'Password confirmation does not match.',
```

- [ ] **Step 3: Run existing tests to ensure no regression**
Run: `php artisan test --filter=RegisterUserRequest`
Expected: PASS

- [ ] **Step 4: Commit changes**
```bash
git add app/Http/Requests/RegisterUserRequest.php
git commit -m "feat: update RegisterUserRequest password validation to match AuthController"
```

## Task 2: Refactor AuthController to use RegisterUserRequest Form Request

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\V1\AuthController.php:23-41`

**Interfaces:**
- Consumes: `App\Http\Requests\RegisterUserRequest`
- Produces: Validated registration data via `$request->validated()`

**Why:** Currently AuthController uses inline validation instead of the Form Request, creating inconsistency with other controllers that properly use Form Requests.

### Steps
- [ ] **Step 1: Import RegisterUserRequest**
Add: `use App\Http\Requests\RegisterUserRequest;`

- [ ] **Step 2: Type-hint request parameter as RegisterUserRequest**
Change: `public function register(Request $request)` to `public function register(RegisterUserRequest $request)`

- [ ] **Step 3: Remove manual Validator::make validation block**
Remove lines 25-41 (the Validator::make block)

- [ ] **Step 4: Replace $request->all() with $request->validated()**
Change: 
```php
$user = User::create([
    'name' => $request->input('name'),
    'email' => $request->input('email'),
    'password' => Hash::make($request->input('password')),
]);
```
To:
```php
$user = User::create([
    'name' => $request->validated('name'),
    'email' => $request->validated('email'),
    'password' => Hash::make($request->validated('password')),
]);
```

- [ ] **Step 5: Run tests to ensure functionality remains intact**
Run: `php artisan test --filter=AuthController`
Expected: PASS

- [ ] **Step 6: Commit changes**
```bash
git add app/Http/Controllers/Api/V1/AuthController.php
git commit -m "feat: refactor AuthController to use RegisterUserRequest Form Request"
```

## Task 3: Fix image validation inconsistency in ProductController

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\V1\ProductController.php:106-109`
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\V1\ProductController.php:137-140`

**Interfaces:**
- Consumes: Image upload validation rules
- Produces: Consistent image validation with webp support

**Why:** ProductController uses inconsistent image validation compared to StoreProductRequest. The controller lacks webp support while the Form Request includes it.

### Steps
- [ ] **Step 1: Update image validation rule in store method**
Change: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',`
To: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',`

- [ ] **Step 2: Update image validation rule in update method**
Change: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',`
To: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',`

- [ ] **Step 3: Run tests to ensure image upload still works**
Run: `php artisan test --filter=ProductController`
Expected: PASS

- [ ] **Step 4: Commit changes**
```bash
git add app/Http/Controllers/Api/V1/ProductController.php
git commit -m "feat: fix image validation inconsistency in ProductController (add webp support)"
```

## Task 4: Fix image validation inconsistency in CoffeeBeanController

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\V1\CoffeeBeanController.php:93-94`
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\V1\CoffeeBeanController.php:152-153`

**Interfaces:**
- Consumes: Image upload validation rules
- Produces: Consistent image validation with webp support

**Why:** CoffeeBeanController uses inconsistent image validation missing webp support.

### Steps
- [ ] **Step 1: Update image validation rule in store method**
Change: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',`
To: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',`

- [ ] **Step 2: Update image validation rule in update method**
Change: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',`
To: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',`

- [ ] **Step 3: Run tests to ensure image upload still works**
Run: `php artisan test --filter=CoffeeBeanController`
Expected: PASS

- [ ] **Step 4: Commit changes**
```bash
git add app/Http/Controllers/Api/V1/CoffeeBeanController.php
git commit -m "feat: fix image validation inconsistency in CoffeeBeanController (add webp support)"
```

## Task 5: Fix image validation inconsistency in BaristaController

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\BaristaController.php:232-233`

**Interfaces:**
- Consumes: Image upload validation rules
- Produces: Consistent image validation with webp support

**Why:** BaristaController's addCoffeeBean method uses inconsistent image validation missing webp support.

### Steps
- [ ] **Step 1: Update image validation rule in addCoffeeBean method**
Change: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',`
To: `'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',`

- [ ] **Step 2: Run tests to ensure image upload still works**
Run: `php artisan test --filter=BaristaController`
Expected: PASS

- [ ] **Step 3: Commit changes**
```bash
git add app/Http/Controllers/Api/BaristaController.php
git commit -m "feat: fix image validation inconsistency in BaristaController (add webp support)"
```

## Task 6: Fix image validation inconsistency in CustomerController

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\CustomerController.php:325-326`

**Interfaces:**
- Consumes: Image upload validation rules
- Produces: Consistent image validation with webp support

**Why:** CustomerController's uploadProfilePicture method uses inconsistent image validation missing webp support.

### Steps
- [ ] **Step 1: Update image validation rule in uploadProfilePicture method**
Change: `'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',`
To: `'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',`

- [ ] **Step 2: Run tests to ensure image upload still works**
Run: `php artisan test --filter=CustomerController`
Expected: PASS

- [ ] **Step 3: Commit changes**
```bash
git add app/Http/Controllers/Api/CustomerController.php
git commit -m "feat: fix image validation inconsistency in CustomerController (add webp support)"
```

## Task 7: Implement sort column validation in ProductController

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\V1\ProductController.php:108-113`

**Interfaces:**
- Consumes: Request sort parameters
- Produces: Validated sort columns against whitelist

**Why:** ProductController uses user input directly in orderBy without validation, creating potential SQL injection risk.

### Steps
- [ ] **Step 1: Add sort column whitelist validation**
Replace:
```php
$sortBy = $request->get('sort_by', 'created_at');
$sortOrder = $request->get('sort_order', 'desc');
$query->orderBy($sortBy, $sortOrder);
```
With:
```php
$allowedSortColumns = ['id', 'name', 'price', 'created_at', 'updated_at'];
$sortBy = in_array($request->get('sort_by'), $allowedSortColumns) 
    ? $request->get('sort_by', 'created_at') 
    : 'created_at';
$sortOrder = in_array($request->get('sort_order'), ['asc', 'desc']) 
    ? $request->get('sort_order', 'desc') 
    : 'desc';
$query->orderBy($sortBy, $sortOrder);
```

- [ ] **Step 2: Run tests to ensure sorting still works**
Run: `php artisan test --filter=ProductController`
Expected: PASS

- [ ] **Step 3: Commit changes**
```bash
git add app/Http/Controllers/Api/V1/ProductController.php
git commit -m "feat: implement sort column validation in ProductController"
```

## Task 8: Implement sort column validation in AdminController::getUsers

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\AdminController.php:53-58`

**Interfaces:**
- Consumes: Request sort parameters
- Produces: Validated sort columns against whitelist

**Why:** AdminController::getUsers uses user input directly in orderBy without validation, creating potential SQL injection risk.

### Steps
- [ ] **Step 1: Add sort column whitelist validation**
Replace:
```php
$sortBy = $request->get('sort_by', 'created_at');
$sortOrder = $request->get('sort_order', 'desc');
$query->orderBy($sortBy, $sortOrder);
```
With:
```php
$allowedSortColumns = ['id', 'name', 'email', 'created_at', 'updated_at'];
$sortBy = in_array($request->get('sort_by'), $allowedSortColumns) 
    ? $request->get('sort_by', 'created_at') 
    : 'created_at';
$sortOrder = in_array($request->get('sort_order'), ['asc', 'desc']) 
    ? $request->get('sort_order', 'desc') 
    : 'desc';
$query->orderBy($sortBy, $sortOrder);
```

- [ ] **Step 2: Run tests to ensure sorting still works**
Run: `php artisan test --filter=AdminController`
Expected: PASS

- [ ] **Step 3: Commit changes**
```bash
git add app/Http/Controllers/Api/AdminController.php
git commit -m "feat: implement sort column validation in AdminController::getUsers"
```

## Task 9: Create Form Request classes for CustomerController

**Files:**
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\UpdateProfileRequest.php`
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\UpdateTastePreferencesRequest.php`
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\UploadProfilePictureRequest.php`
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\UpdateNotificationPreferencesRequest.php`
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\ChangePasswordRequest.php`
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\DeactivateAccountRequest.php`

**Interfaces:**
- Consumes: `Illuminate\Foundation\Http\FormRequest`
- Produces: Validated request data for CustomerController methods

**Why:** CustomerController currently uses inline validation in multiple methods instead of Form Requests, creating inconsistency.

### Steps for each Form Request:
- [ ] **Step 1: Create the Form Request file with proper namespace and use statements**
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class [RequestName]Request extends FormRequest
{
    // ...
}
```

- [ ] **Step 2: Implement authorize() method returning true (for public endpoints) or appropriate logic**
```php
public function authorize(): bool
{
    return true; // or Auth::check() for protected endpoints
}
```

- [ ] **Step 3: Implement rules() method with appropriate validation rules**
```php
public function rules(): array
{
    return [
        // validation rules
    ];
}
```

- [ ] **Step 4: Implement messages() and attributes() methods if needed**
```php
public function messages(): array
{
    return [
        // custom messages
    ];
}

public function attributes(): array
{
    return [
        // custom attributes
    ];
}
```

- [ ] **Step 5: Run tests to ensure validation works**
Run: `php artisan test --filter=CustomerController`
Expected: PASS

- [ ] **Step 6: Commit changes**
```bash
git add app/Http/Requests/[RequestName].php
git commit -m "feat: create [RequestName] Form Request"
```

## Task 10: Refactor CustomerController to use Form Requests

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\CustomerController.php`

**Interfaces:**
- Consumes: Various Form Request classes
- Produces: Validated request data via `$request->validated()`

**Why:** CustomerController currently uses inline validation in multiple methods instead of Form Requests, creating inconsistency.

### Steps
- [ ] **Step 1: Import all created Form Request classes**
Add use statements at the top:
```php
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdateTastePreferencesRequest;
// ... etc for all created requests
```

- [ ] **Step 2: Type-hint request parameters in each method**
Change each method signature from `public function method(Request $request)` to `public function method([SpecificRequest] $request)`

- [ ] **Step 3: Replace $request->validate() or $request->all() with $request->validated()**
Update each method to use validated data appropriately

- [ ] **Step 4: Run tests to ensure functionality remains intact**
Run: `php artisan test --filter=CustomerController`
Expected: PASS

- [ ] **Step 5: Commit changes**
```bash
git add app/Http/Controllers/Api/CustomerController.php
git commit -m "feat: refactor CustomerController to use Form Requests"
```

## Task 11: Create Form Request classes for InquiryController

**Files:**
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\StoreBaristaTrainingRequest.php`
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\StoreArbiterExpressRequest.php`
- Create: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Requests\UpdateInquiryRequest.php`

**Interfaces:**
- Consumes: `Illuminate\Foundation\Http\FormRequest`
- Produces: Validated request data for InquiryController methods

**Why:** InquiryController currently uses inline validation in multiple methods and lacks corresponding Form Request classes.

### Steps for each Form Request:
(Same as Task 9)

- [ ] **Step 1-5: Create each Form Request following the same pattern**
- [ ] **Step 6: Commit changes**
```bash
git add app/Http/Requests/StoreBaristaTrainingRequest.php
git add app/Http/Requests/StoreArbiterExpressRequest.php
git add app/Http/Requests/UpdateInquiryRequest.php
git commit -m "feat: create Form Request classes for InquiryController"
```

## Task 12: Refactor InquiryController to use Form Requests

**Files:**
- Modify: `C:\Users\01ker\ArbiterCoffeeHUB\app\Http\Controllers\Api\V1\InquiryController.php`

**Interfaces:**
- Consumes: Various Form Request classes
- Produces: Validated request data via `$request->validated()`

**Why:** InquiryController currently uses inline validation in multiple methods instead of Form Requests, creating inconsistency.

### Steps
(Same as Task 10)

- [ ] **Step 1-5: Import Form Requests, update method signatures, replace validation**
- [ ] **Step 6: Commit changes**
```bash
git add app/Http/Controllers/Api/V1/InquiryController.php
git commit -m "feat: refactor InquiryController to use Form Requests"
```

## Verification and Completion

After completing all tasks, run the full test suite to ensure no regressions:
```bash
php artisan test
```

All tests should pass, confirming that the security validation improvements have been successfully implemented without breaking existing functionality.

**Note:** Tasks can be executed in any order, but Tasks 1-8 should be completed before Tasks 9-12 to establish the foundation of updated validation rules before creating and using the Form Request classes.
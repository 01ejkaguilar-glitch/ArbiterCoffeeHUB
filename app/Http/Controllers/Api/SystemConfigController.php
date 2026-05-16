<?php

namespace App\Http\Controllers\Api;

use App\Models\SystemConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class SystemConfigController extends BaseController
{
    /**
     * Keys that are allowed to be managed through the API.
     *
     * @var array<int, string>
     */
    private array $allowedKeys = [
        'operating_hours',
        'contact_info',
        'team_members',
        'company_timeline',
    ];

    /**
     * Get all system configurations
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $configs = SystemConfig::all();

            return $this->sendResponse($configs, 'System configurations retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve configurations', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get specific configuration by key
     *
     * @param string $key
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($key)
    {
        try {
            $config = SystemConfig::where('key', $key)->firstOrFail();

            return $this->sendResponse($config, 'Configuration retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Configuration not found', 404);
        }
    }

    /**
     * Update or create configuration
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(\App\Http\Requests\UpdateSystemConfigRequest $request)
    {
        try {
            $data = $request->validated();

            $config = SystemConfig::setValue(
                $data['key'],
                $data['value'] ?? null,
                $data['type'] ?? 'json',
                $data['description'] ?? ''
            );

            $this->forgetPublicConfigCache($data['key']);

            return $this->sendResponse($config, 'Configuration updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendValidationError($e->errors());
        } catch (\Exception $e) {
            return $this->sendError('Failed to update configuration', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get validation rules for the config value based on the key.
     *
     * @param string|null $key
     * @return array<string, mixed>
     */
    private function getValueRules(?string $key): array
    {
        return match ($key) {
            'operating_hours' => [
                'value' => 'required|array',
                'value.monday.open' => 'required|string|max:5',
                'value.monday.close' => 'required|string|max:5',
                'value.tuesday.open' => 'required|string|max:5',
                'value.tuesday.close' => 'required|string|max:5',
                'value.wednesday.open' => 'required|string|max:5',
                'value.wednesday.close' => 'required|string|max:5',
                'value.thursday.open' => 'required|string|max:5',
                'value.thursday.close' => 'required|string|max:5',
                'value.friday.open' => 'required|string|max:5',
                'value.friday.close' => 'required|string|max:5',
                'value.saturday.open' => 'required|string|max:5',
                'value.saturday.close' => 'required|string|max:5',
                'value.sunday.open' => 'required|string|max:5',
                'value.sunday.close' => 'required|string|max:5',
            ],
            'contact_info' => [
                'value' => 'required|array',
                'value.phone' => 'required|string|max:50',
                'value.email' => 'required|email|max:255',
                'value.address' => 'required|string|max:500',
                'value.social_media' => 'nullable|array',
                'value.social_media.facebook' => 'nullable|url|max:255',
                'value.social_media.instagram' => 'nullable|url|max:255',
                'value.social_media.twitter' => 'nullable|url|max:255',
            ],
            'team_members' => [
                'value' => 'required|array|min:1',
                'value.*.name' => 'required|string|max:255',
                'value.*.position' => 'required|string|max:255',
                'value.*.bio' => 'required|string|max:1000',
                'value.*.image' => 'nullable|string|max:255',
            ],
            'company_timeline' => [
                'value' => 'required|array|min:1',
                'value.*.year' => 'required|string|max:10',
                'value.*.title' => 'required|string|max:255',
                'value.*.description' => 'required|string|max:1000',
            ],
            default => [],
        };
    }

    /**
     * Delete configuration
     *
     * @param string $key
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($key)
    {
        try {
            $config = SystemConfig::where('key', $key)->firstOrFail();
            $config->delete();

            $this->forgetPublicConfigCache($key);

            return $this->sendResponse(null, 'Configuration deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete configuration', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get operating hours
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOperatingHours()
    {
        try {
            $hours = SystemConfig::getValue('operating_hours', [
                'monday' => ['open' => '08:00', 'close' => '20:00'],
                'tuesday' => ['open' => '08:00', 'close' => '20:00'],
                'wednesday' => ['open' => '08:00', 'close' => '20:00'],
                'thursday' => ['open' => '08:00', 'close' => '20:00'],
                'friday' => ['open' => '08:00', 'close' => '22:00'],
                'saturday' => ['open' => '09:00', 'close' => '22:00'],
                'sunday' => ['open' => '09:00', 'close' => '20:00'],
            ]);

            return $this->sendResponse($hours, 'Operating hours retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve operating hours', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get contact information
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getContactInfo()
    {
        try {
            $contactInfo = SystemConfig::getValue('contact_info', [
                'phone' => '+63 123 456 7890',
                'email' => 'info@arbitercoffee.com',
                'address' => 'Arbiter Coffee Hub, Main Street, City',
                'social_media' => [
                    'facebook' => 'https://facebook.com/arbitercoffee',
                    'instagram' => 'https://instagram.com/arbitercoffee',
                    'twitter' => 'https://twitter.com/arbitercoffee',
                ],
            ]);

            return $this->sendResponse($contactInfo, 'Contact information retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve contact information', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get team members
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTeamMembers()
    {
        try {
            $team = SystemConfig::getValue('team_members', [
                [
                    'name' => 'John Doe',
                    'position' => 'Master Barista',
                    'bio' => 'With 10 years of experience...',
                    'image' => '/images/team/john.jpg',
                ],
            ]);

            return $this->sendResponse($team, 'Team members retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve team members', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get company timeline
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCompanyTimeline()
    {
        try {
            $timeline = SystemConfig::getValue('company_timeline', [
                [
                    'year' => '2020',
                    'title' => 'Founded',
                    'description' => 'Arbiter Coffee Hub was established...',
                ],
            ]);

            return $this->sendResponse($timeline, 'Company timeline retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve company timeline', 500, ['error' => $e->getMessage()]);
        }
    }

    /**
     * Clear cached public settings for a specific config key.
     */
    private function forgetPublicConfigCache(string $key): void
    {
        $cacheKey = match ($key) {
            'operating_hours' => 'public.settings.operating_hours',
            'contact_info' => 'public.settings.contact_info',
            'team_members' => 'public.settings.team_members',
            'company_timeline' => 'public.settings.company_timeline',
            default => null,
        };

        if ($cacheKey !== null) {
            Cache::forget($cacheKey);
        }
    }
}

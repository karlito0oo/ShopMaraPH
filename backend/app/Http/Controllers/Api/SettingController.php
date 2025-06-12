<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // Middleware should be applied in routes, not in the controller
    }

    /**
     * Get all settings
     */
    public function index()
    {
        $settings = Setting::all();
        
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Get public settings (delivery fee, etc.)
     */
    public function getPublicSettings()
    {
        $publicSettings = [
            'delivery_fee_ncr' => Setting::get('delivery_fee_ncr', 80),
            'delivery_fee_outside_ncr' => Setting::get('delivery_fee_outside_ncr', 120),
            'free_delivery_threshold' => Setting::get('free_delivery_threshold', 0),
            'payment_options_description' => Setting::get('payment_options_description', ''),
            'what_happens_after_payment' => Setting::get('what_happens_after_payment', ''),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $publicSettings
        ]);
    }

    /**
     * Update a setting
     */
    public function update(Request $request, $key)
    {
        $setting = Setting::where('key', $key)->first();
        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'value' => 'required',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $value = $request->value;
        
        // Validate value based on type
        switch ($setting->type) {
            case 'integer':
                if (!is_numeric($value)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Value must be a number'
                    ], 422);
                }
                break;
            case 'boolean':
                if (!in_array($value, ['0', '1', 'true', 'false'], true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Value must be a boolean'
                    ], 422);
                }
                break;
            case 'json':
                if (!is_array($value) && !is_object($value)) {
                    try {
                        json_decode($value);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            throw new \Exception('Invalid JSON');
                        }
                    } catch (\Exception $e) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Value must be valid JSON'
                        ], 422);
                    }
                }
                break;
        }
        
        // Update the setting
        $success = Setting::set($key, $value);
        
        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update setting'
            ], 500);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => [
                'key' => $key,
                'value' => Setting::get($key),
                'type' => $setting->type
            ]
        ]);
    }

    /**
     * Update multiple settings at once
     */
    public function updateMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:settings,key',
            'settings.*.value' => 'required',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $settings = $request->settings;
        $updatedSettings = [];
        $errors = [];
        
        foreach ($settings as $settingData) {
            $key = $settingData['key'];
            $value = $settingData['value'];
            
            $setting = Setting::where('key', $key)->first();
            
            if (!$setting) {
                $errors[$key] = 'Setting not found';
                continue;
            }
            
            // Validate value based on type (simplified validation)
            $isValid = true;
            switch ($setting->type) {
                case 'integer':
                    $isValid = is_numeric($value);
                    break;
                case 'boolean':
                    $isValid = in_array($value, ['0', '1', 'true', 'false'], true);
                    break;
            }
            
            if (!$isValid) {
                $errors[$key] = 'Invalid value for this setting type';
                continue;
            }
            
            // Update the setting
            $success = Setting::set($key, $value);
            
            if ($success) {
                $updatedSettings[$key] = Setting::get($key);
            } else {
                $errors[$key] = 'Failed to update setting';
            }
        }
        
        return response()->json([
            'success' => count($errors) === 0,
            'data' => [
                'updated' => $updatedSettings,
                'errors' => $errors
            ]
        ]);
    }
}

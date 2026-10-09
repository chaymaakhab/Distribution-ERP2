<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanySettingController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = CompanySetting::first();

        if (!$setting) {
            $setting = CompanySetting::create([
                'company_name' => 'DISTRI-MAROC LOGISTIQUE SARL',
                'brand_name' => 'Atlas Distribution',
                'ice' => '002874195000038',
                'rc' => '54210 Casablanca',
                'if_tax' => '40192837',
                'patente' => '38291045',
                'cnss' => '7819203',
                'capital' => 5000000.00,
                'address' => 'Zone Industrielle Ain Sebaâ, Route 110',
                'city' => 'Casablanca',
                'phone' => '+212 522 35 44 00',
                'email' => 'contact@atlasdistribution.ma',
                'website' => 'https://atlasdistribution.ma',
                'bank_name' => 'Attijariwafa Bank',
                'rib' => '007 780 0001234567890123 45',
                'default_tva_rate' => 20.00,
            ]);
        }

        return response()->json($setting);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'sometimes|string',
            'brand_name' => 'nullable|string',
            'ice' => 'sometimes|string',
            'rc' => 'sometimes|string',
            'if_tax' => 'sometimes|string',
            'patente' => 'nullable|string',
            'cnss' => 'nullable|string',
            'capital' => 'nullable|numeric',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'email' => 'sometimes|email',
            'website' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'rib' => 'nullable|string',
            'swift' => 'nullable|string',
            'default_tva_rate' => 'nullable|numeric',
        ]);

        $setting = CompanySetting::first();
        if (!$setting) {
            $setting = new CompanySetting();
        }

        $setting->fill($validated);
        $setting->save();

        return response()->json([
            'message' => 'Paramètres entreprise mis à jour avec succès.',
            'setting' => $setting,
        ]);
    }
}

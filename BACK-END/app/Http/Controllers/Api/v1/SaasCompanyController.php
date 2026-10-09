<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SaasCompanyController extends Controller
{
    /**
     * List all companies (Super Admin SaaS Master view).
     */
    public function index(Request $request)
    {
        $query = Company::with(['adminUser', 'warehouses'])->withCount(['users', 'warehouses']);

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('code', 'like', "%{$q}%")
                  ->orWhere('city', 'like', "%{$q}%")
                  ->orWhere('ice', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('subscription_status', $request->query('status'));
        }

        if ($request->filled('plan')) {
            $query->where('subscription_plan', $request->query('plan'));
        }

        $companies = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $companies,
            'total' => $companies->count(),
        ]);
    }

    /**
     * Create a new company + company admin user + subscription (Super Admin action).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand_name' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:companies,code'],
            'ice' => ['nullable', 'string', 'max:25'],
            'rc' => ['nullable', 'string', 'max:50'],
            'if_tax' => ['nullable', 'string', 'max:50'],
            'patente' => ['nullable', 'string', 'max:50'],
            'cnss' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            // Subscription data
            'subscription_plan' => ['required', 'string', 'in:starter,pro,enterprise,custom'],
            'subscription_status' => ['nullable', 'string', 'in:active,trial,expired,suspended'],
            'subscription_start_date' => ['nullable', 'date'],
            'subscription_end_date' => ['nullable', 'date'],
            'subscription_price' => ['nullable', 'numeric', 'min:0'],
            'subscription_billing_cycle' => ['nullable', 'string', 'in:mensuel,annuel'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_warehouses' => ['nullable', 'integer', 'min:1'],
            // Company Admin User data
            'admin_name' => ['nullable', 'string', 'max:255'],
            'admin_email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'admin_phone' => ['nullable', 'string', 'max:50'],
            'admin_password' => ['nullable', 'string', 'min:6'],
        ]);

        return DB::transaction(function () use ($data) {
            $code = $data['code'] ?? ('SOC-' . str_pad((Company::max('id') ?? 0) + 1, 3, '0', STR_PAD_LEFT));
            $startDate = $data['subscription_start_date'] ?? now()->toDateString();
            
            // Default 1 year subscription if not specified
            $cycle = $data['subscription_billing_cycle'] ?? 'annuel';
            $endDate = $data['subscription_end_date'] ?? (
                $cycle === 'mensuel' 
                    ? Carbon::parse($startDate)->addMonth()->toDateString() 
                    : Carbon::parse($startDate)->addYear()->toDateString()
            );

            // Default pricing & quotas per plan if not supplied
            $plan = $data['subscription_plan'];
            $defaultPrice = match ($plan) {
                'starter' => 18000.00,
                'pro' => 45000.00,
                'enterprise' => 95000.00,
                default => 30000.00,
            };
            $defaultMaxUsers = match ($plan) {
                'starter' => 5,
                'pro' => 20,
                'enterprise' => 60,
                default => 15,
            };
            $defaultMaxDepots = match ($plan) {
                'starter' => 1,
                'pro' => 4,
                'enterprise' => 12,
                default => 3,
            };

            $company = Company::create([
                'code' => $code,
                'name' => $data['name'],
                'brand_name' => $data['brand_name'] ?? $data['name'],
                'ice' => $data['ice'] ?? null,
                'rc' => $data['rc'] ?? null,
                'if_tax' => $data['if_tax'] ?? null,
                'patente' => $data['patente'] ?? null,
                'cnss' => $data['cnss'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'city' => $data['city'],
                'address' => $data['address'] ?? null,
                'subscription_plan' => $plan,
                'subscription_status' => $data['subscription_status'] ?? 'active',
                'subscription_start_date' => $startDate,
                'subscription_end_date' => $endDate,
                'subscription_price' => $data['subscription_price'] ?? $defaultPrice,
                'subscription_billing_cycle' => $cycle,
                'max_users' => $data['max_users'] ?? $defaultMaxUsers,
                'max_warehouses' => $data['max_warehouses'] ?? $defaultMaxDepots,
                'status' => 'active',
            ]);

            // Create Company Admin User if provided
            if (!empty($data['admin_email'])) {
                $adminUser = User::create([
                    'name' => $data['admin_name'] ?? ('Admin ' . $company->name),
                    'email' => $data['admin_email'],
                    'phone' => $data['admin_phone'] ?? $company->phone,
                    'password' => Hash::make($data['admin_password'] ?? 'Admin@2026!'),
                    'is_active' => true,
                    'company_id' => $company->id,
                ]);

                // Assign 'admin' role
                $adminRole = Role::firstOrCreate(['code' => 'admin'], [
                    'name' => 'Administrateur d’Entreprise',
                    'permissions' => ['*'],
                ]);

                $adminUser->roles()->attach($adminRole->id, ['is_primary' => true]);
                $company->update(['admin_user_id' => $adminUser->id]);
            }

            // Create initial main depot for this company
            $depotCode = 'DEP-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $company->city), 0, 3)) . '-' . $company->id;
            Warehouse::create([
                'code' => $depotCode,
                'name' => 'Dépôt Central ' . $company->city,
                'city' => $company->city,
                'address' => $company->address ?? ('Zone Industrielle, ' . $company->city),
                'company_id' => $company->id,
                'status' => 'Actif',
                'manager_name' => $data['admin_name'] ?? 'Responsable Dépôt',
                'phone' => $company->phone,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Entreprise et son administrateur créés avec succès.',
                'data' => $company->fresh(['adminUser', 'warehouses']),
            ], 201);
        });
    }

    /**
     * Show single company.
     */
    public function show($id)
    {
        $company = Company::with(['adminUser', 'users.roles', 'warehouses'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $company,
        ]);
    }

    /**
     * Update company details.
     */
    public function update(Request $request, $id)
    {
        $company = Company::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'brand_name' => ['nullable', 'string', 'max:255'],
            'ice' => ['nullable', 'string', 'max:25'],
            'rc' => ['nullable', 'string', 'max:50'],
            'if_tax' => ['nullable', 'string', 'max:50'],
            'patente' => ['nullable', 'string', 'max:50'],
            'cnss' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'city' => ['sometimes', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'admin_user_id' => ['nullable', 'exists:users,id'],
            'status' => ['nullable', 'string', 'in:active,suspended'],
        ]);

        $company->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Société mise à jour.',
            'data' => $company->fresh(['adminUser', 'warehouses']),
        ]);
    }

    /**
     * Update / Renew SaaS Subscription.
     */
    public function updateSubscription(Request $request, $id)
    {
        $company = Company::findOrFail($id);

        $data = $request->validate([
            'subscription_plan' => ['sometimes', 'string', 'in:starter,pro,enterprise,custom'],
            'subscription_status' => ['sometimes', 'string', 'in:active,trial,expired,suspended'],
            'subscription_start_date' => ['nullable', 'date'],
            'subscription_end_date' => ['sometimes', 'date'],
            'subscription_price' => ['nullable', 'numeric', 'min:0'],
            'subscription_billing_cycle' => ['nullable', 'string', 'in:mensuel,annuel'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_warehouses' => ['nullable', 'integer', 'min:1'],
        ]);

        $company->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Abonnement SaaS mis à jour avec succès.',
            'data' => $company->fresh(),
        ]);
    }

    /**
     * SaaS Master Platform Metrics (Super Admin Dashboard).
     */
    public function overview()
    {
        $companies = Company::withCount(['users', 'warehouses'])->get();

        $totalCompanies = $companies->count();
        $activeCount = $companies->where('subscription_status', 'active')->count();
        $trialCount = $companies->where('subscription_status', 'trial')->count();
        $expiredCount = $companies->where('subscription_status', 'expired')->count();
        $suspendedCount = $companies->where('subscription_status', 'suspended')->count();

        // Calculate MRR (Monthly Recurring Revenue in MAD)
        $mrr = 0.0;
        foreach ($companies as $c) {
            if ($c->subscription_status === 'active') {
                if ($c->subscription_billing_cycle === 'annuel') {
                    $mrr += (float) ($c->subscription_price / 12);
                } else {
                    $mrr += (float) $c->subscription_price;
                }
            }
        }
        $arr = $mrr * 12;

        $totalUsers = User::count();
        $totalWarehouses = Warehouse::count();

        // Subscriptions expiring soon (less than 30 days remaining)
        $expiringSoon = $companies->filter(fn ($c) => $c->days_remaining <= 30 && $c->days_remaining > 0)->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_companies' => $totalCompanies,
                'active_subscriptions' => $activeCount,
                'trial_subscriptions' => $trialCount,
                'expired_subscriptions' => $expiredCount,
                'suspended_subscriptions' => $suspendedCount,
                'mrr_mad' => round($mrr, 2),
                'arr_mad' => round($arr, 2),
                'total_users_across_saas' => $totalUsers,
                'total_warehouses_across_saas' => $totalWarehouses,
                'expiring_soon_count' => $expiringSoon->count(),
                'expiring_soon' => $expiringSoon,
            ],
        ]);
    }

    /**
     * Return logged-in user's company information and subscription details.
     */
    public function myCompany(Request $request)
    {
        /** @var User $user */
        $user = $request->user('staff');
        if (!$user || !$user->company_id) {
            // If superadmin or unassigned, return default master company
            $master = Company::first();
            return response()->json(['status' => 'success', 'data' => $master]);
        }

        $company = Company::with(['warehouses', 'adminUser'])->withCount(['users', 'warehouses'])->findOrFail($user->company_id);

        return response()->json([
            'status' => 'success',
            'data' => $company,
        ]);
    }
}

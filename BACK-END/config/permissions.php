<?php

/*
|--------------------------------------------------------------------------
| Permissions catalogue & role matrix
|--------------------------------------------------------------------------
|
| Granular permissions are grouped per module. Each internal role is mapped
| to a set of permissions and to its landing dashboard. The 'customer' role
| is external (handled by the Customer model / customer guard) and is listed
| here only for reference and for the role switcher.
|
| A user may hold several roles; effective permissions are the union of the
| permissions of all assigned roles. The wildcard '*' grants everything.
|
*/

return [

    // Every granular permission, grouped by module (source of truth).
    'catalog' => [
        'dashboard' => ['dashboard.view'],

        'products' => ['products.view', 'products.create', 'products.update', 'products.delete'],
        'categories' => ['categories.view', 'categories.manage'],
        'brands' => ['brands.view', 'brands.manage'],

        'customers' => ['customers.view', 'customers.create', 'customers.update', 'customers.delete', 'customer_accounts.manage'],
        'suppliers' => ['suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete'],

        'orders' => ['orders.view', 'orders.create', 'orders.update', 'orders.validate', 'orders.confirm', 'orders.cancel', 'orders.assign'],
        'quotes' => ['quotes.view', 'quotes.create', 'quotes.update', 'quotes.convert'],
        'visits' => ['visits.view', 'visits.create', 'visits.update'],

        'stock' => ['stock.view', 'stock.transfer', 'stock.adjust', 'stock.inventory'],
        'warehouses' => ['warehouses.view', 'warehouses.manage'],
        'purchases' => ['purchases.view', 'purchases.create', 'purchases.receive'],

        'preparation' => ['preparation.view', 'preparation.start', 'preparation.complete'],
        'deliveries' => ['deliveries.view', 'deliveries.assign', 'deliveries.start', 'deliveries.complete'],

        'invoices' => ['invoices.view', 'invoices.create', 'invoices.cancel'],
        'credit_notes' => ['credit_notes.view', 'credit_notes.create'],
        'payments' => ['payments.view', 'payments.create'],
        'cheques' => ['cheques.view', 'cheques.manage'],
        'cash_closings' => ['cash_closings.view', 'cash_closings.create', 'cash_closings.validate'],
        'returns' => ['returns.view', 'returns.create', 'returns.confirm'],

        'reports' => ['reports.view'],

        'users' => ['users.view', 'users.create', 'users.update', 'users.delete'],
        'roles' => ['roles.view', 'roles.manage'],
        'settings' => ['settings.view', 'settings.manage'],
        'audit' => ['audit.view'],
    ],

    // Role matrix: code => [name, home, permissions].
    'roles' => [
        'superadmin' => [
            'name' => 'SuperAdmin',
            'home' => '/superadmin',
            'permissions' => ['*'],
        ],

        'admin' => [
            'name' => 'Administrateur',
            'home' => '/administrator/dashboard',
            'permissions' => [
                'dashboard.view',
                'products.view', 'products.create', 'products.update',
                'categories.view', 'categories.manage', 'brands.view', 'brands.manage',
                'customers.view', 'customers.create', 'customers.update', 'customer_accounts.manage',
                'suppliers.view', 'suppliers.create', 'suppliers.update',
                'orders.view', 'orders.create', 'orders.update', 'orders.validate', 'orders.confirm', 'orders.cancel', 'orders.assign',
                'stock.view', 'stock.transfer', 'stock.adjust', 'stock.inventory',
                'warehouses.view', 'warehouses.manage',
                'purchases.view', 'purchases.create', 'purchases.receive',
                'preparation.view', 'deliveries.view', 'deliveries.assign',
                'invoices.view', 'invoices.create', 'payments.view', 'payments.create',
                'cheques.view', 'returns.view', 'returns.create', 'returns.confirm',
                'cash_closings.view', 'cash_closings.create', 'cash_closings.validate',
                'reports.view',
                'users.view', 'users.create', 'users.update',
                'roles.view', 'settings.view', 'settings.manage', 'audit.view',
            ],
        ],

        'warehouse' => [
            'name' => 'Responsable dépôt',
            'home' => '/warehouse/dashboard',
            'permissions' => [
                'dashboard.view',
                'products.view', 'categories.view',
                'customers.view', 'customers.create', 'customers.update', 'customer_accounts.manage',
                'orders.view', 'orders.assign',
                'stock.view', 'stock.transfer', 'stock.adjust', 'stock.inventory',
                'warehouses.view',
                'purchases.view', 'purchases.receive',
                'preparation.view', 'preparation.start', 'preparation.complete',
                'deliveries.view', 'deliveries.assign',
                'returns.view', 'returns.create', 'returns.confirm',
                'cash_closings.view', 'cash_closings.create',
                'reports.view',
            ],
        ],

        'commercial' => [
            'name' => 'Commercial',
            'home' => '/sales/dashboard',
            'permissions' => [
                'dashboard.view',
                'products.view', 'categories.view',
                'customers.view', 'customers.create', 'customers.update', 'customer_accounts.manage',
                'orders.view', 'orders.create', 'orders.update', 'orders.validate', 'orders.confirm', 'orders.cancel',
                'visits.view', 'visits.create', 'visits.update',
                'quotes.view', 'quotes.create',
                'invoices.view', 'payments.view', 'payments.create',
                'returns.view', 'returns.create',
                'reports.view',
            ],
        ],

        'preparation' => [
            'name' => 'Préparateur',
            'home' => '/preparation/dashboard',
            'permissions' => [
                'dashboard.view',
                'products.view',
                'orders.view',
                'stock.view',
                'preparation.view', 'preparation.start', 'preparation.complete',
            ],
        ],

        'delivery' => [
            'name' => 'Livreur',
            'home' => '/delivery/dashboard',
            'permissions' => [
                'dashboard.view',
                'customers.view',
                'orders.view',
                'deliveries.view', 'deliveries.start', 'deliveries.complete',
                'payments.view', 'payments.create',
                'returns.view', 'returns.create',
                'cash_closings.view', 'cash_closings.create',
            ],
        ],

        'pre_seller' => [
            'name' => 'Livreur-pré-vendeur',
            'home' => '/delivery/dashboard',
            'permissions' => [
                'dashboard.view',
                'customers.view', 'customers.create',
                'orders.view', 'orders.create',
                'deliveries.view', 'deliveries.start', 'deliveries.complete',
                'payments.view', 'payments.create',
                'returns.view', 'returns.create',
                'cash_closings.view', 'cash_closings.create',
            ],
        ],

        'accounting' => [
            'name' => 'Comptable',
            'home' => '/accounting/dashboard',
            'permissions' => [
                'dashboard.view',
                'customers.view', 'customer_accounts.manage',
                'suppliers.view',
                'orders.view', 'orders.create',
                'quotes.view', 'quotes.create', 'quotes.update', 'quotes.convert',
                'invoices.view', 'invoices.create', 'invoices.cancel',
                'credit_notes.view', 'credit_notes.create',
                'payments.view', 'payments.create',
                'cheques.view', 'cheques.manage',
                'cash_closings.view', 'cash_closings.create', 'cash_closings.validate',
                'returns.view', 'returns.confirm',
                'reports.view',
            ],
        ],
    ],

];

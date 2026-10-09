import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/sync_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/catalog/product_catalog_screen.dart';
import '../screens/customers/customer_list_screen.dart';
import '../screens/dashboard/home_screen.dart';
import '../screens/delivery/delivery_tour_screen.dart';
import '../screens/orders/new_order_screen.dart';
import '../screens/orders/order_list_screen.dart';
import '../screens/payments/payment_collection_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/sync/sync_center_screen.dart';
import '../screens/visits/visits_screen.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authProv = Provider.watch<AuthProvider>(context);
    final user = authProv.user;
    final syncProv = Provider.watch<SyncProvider>(context);

    String roleTitle = 'Opérateur ERP';
    if (user != null) {
      if (user.isCommercial) roleTitle = 'Commercial Terrain (Vente)';
      else if (user.isDriver) roleTitle = 'Chauffeur-Livreur';
      else if (user.isWarehouse) roleTitle = 'Gestionnaire Stock';
      else if (user.isAdmin) roleTitle = 'Superviseur / Admin';
    }

    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryDark, AppTheme.primary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                (user?.name.isNotEmpty == true) ? user!.name[0].toUpperCase() : 'U',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primary,
                ),
              ),
            ),
            accountName: Text(
              user?.name ?? 'Utilisateur',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            accountEmail: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  user?.email ?? '',
                  style: const TextStyle(fontSize: 13, color: Colors.white70),
                ),
                const SizedBox(height: 2),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.accent,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    roleTitle,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                ListTile(
                  leading: const Icon(Icons.dashboard_outlined, color: AppTheme.primary),
                  title: const Text('Tableau de Bord'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const HomeScreen()),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.people_alt_outlined, color: AppTheme.primary),
                  title: const Text('Clients & Portefeuille'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const CustomerListScreen()),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.inventory_2_outlined, color: AppTheme.primary),
                  title: const Text('Catalogue & Stocks'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ProductCatalogScreen()),
                    );
                  },
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.add_shopping_cart, color: Colors.green),
                  title: const Text('Prise de Commande'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const NewOrderScreen()),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.receipt_long_outlined, color: AppTheme.primary),
                  title: const Text('Bons de Commande'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const OrderListScreen()),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.location_on_outlined, color: Colors.blue),
                  title: const Text('Visites & Check-in GPS'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const VisitsScreen()),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.local_shipping_outlined, color: Colors.orange),
                  title: const Text('Tournée de Livraison'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const DeliveryTourScreen()),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.payments_outlined, color: Colors.teal),
                  title: const Text('Encaissements & Règlements'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const PaymentCollectionScreen()),
                    );
                  },
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.sync, color: Colors.indigo),
                  title: const Text('Synchronisation Hors-Ligne'),
                  trailing: syncProv.pendingCount > 0
                      ? Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade700,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${syncProv.pendingCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        )
                      : null,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const SyncCenterScreen()),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.settings_outlined, color: Colors.grey),
                  title: const Text('Paramètres / Serveur'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const SettingsScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Déconnexion', style: TextStyle(color: Colors.red)),
            onTap: () async {
              await authProv.logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
    );
  }
}

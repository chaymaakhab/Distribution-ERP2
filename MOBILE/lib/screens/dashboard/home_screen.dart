import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/customer_provider.dart';
import '../../providers/order_provider.dart';
import '../../providers/visit_provider.dart';
import '../../providers/sync_provider.dart';
import '../../widgets/app_drawer.dart';
import '../../widgets/kpi_card.dart';
import '../../widgets/offline_banner.dart';
import '../catalog/product_catalog_screen.dart';
import '../customers/customer_list_screen.dart';
import '../delivery/delivery_tour_screen.dart';
import '../orders/new_order_screen.dart';
import '../orders/order_list_screen.dart';
import '../payments/payment_collection_screen.dart';
import '../sync/sync_center_screen.dart';
import '../visits/visits_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProv = Provider.watch<AuthProvider>(context);
    final user = authProv.user;
    final orderProv = Provider.watch<OrderProvider>(context);
    final visitProv = Provider.watch<VisitProvider>(context);
    final custProv = Provider.watch<CustomerProvider>(context);

    // Calculate totals
    final todayOrders = orderProv.orders;
    final totalCa = todayOrders.fold(0.0, (sum, o) => sum + o.total);
    final completedVisits = visitProv.visits.where((v) => v.status == 'realisee').length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('ERP Distribution'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            tooltip: 'Synchronisation',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SyncCenterScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
            onPressed: () {
              orderProv.fetchOrders();
              visitProv.fetchVisits();
              custProv.fetchCustomers();
            },
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            orderProv.fetchOrders(),
            visitProv.fetchVisits(),
            custProv.fetchCustomers(),
          ]);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Offline Alert Banner
              const OfflineBanner(),

              // User Welcome Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(24),
                    bottomRight: Radius.circular(24),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Bonjour, ${user?.name ?? 'Opérateur'} 👋',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.warehouse != null
                          ? 'Dépôt: ${user!.warehouse!.name} (${user.warehouse!.city})'
                          : 'Distribution Maroc - Force de Vente Mobile',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // KPI Summary Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Indicateurs du Jour',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textDark,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: KpiCard(
                            title: 'CA Réalisé',
                            value: Formatters.currency(totalCa),
                            subtitle: '${todayOrders.length} commande(s)',
                            icon: Icons.monetization_on,
                            color: Colors.emerald if (false) Colors.green else const Color(0xFF0F766E),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: KpiCard(
                            title: 'Visites Clients',
                            value: '$completedVisits / ${visitProv.visits.length}',
                            subtitle: 'Terrain aujourd\'hui',
                            icon: Icons.pin_drop,
                            color: const Color(0xFFF59E0B),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: KpiCard(
                            title: 'Clients Actifs',
                            value: '${custProv.customers.length}',
                            subtitle: 'Portefeuille affecté',
                            icon: Icons.people,
                            color: const Color(0xFF3B82F6),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: KpiCard(
                            title: 'Taux Visite',
                            value: visitProv.visits.isNotEmpty
                                ? '${((completedVisits / visitProv.visits.length) * 100).toInt()}%'
                                : '100%',
                            subtitle: 'Couverture du plan',
                            icon: Icons.trending_up,
                            color: const Color(0xFF10B981),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Quick Actions Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Actions Rapides Terrain',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textDark,
                      ),
                    ),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 3,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      children: [
                        _QuickActionTile(
                          title: 'Nouvelle Commande',
                          icon: Icons.add_shopping_cart,
                          color: const Color(0xFF10B981),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const NewOrderScreen()),
                          ),
                        ),
                        _QuickActionTile(
                          title: 'Visites Terrain',
                          icon: Icons.location_on,
                          color: const Color(0xFF3B82F6),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const VisitsScreen()),
                          ),
                        ),
                        _QuickActionTile(
                          title: 'Clients & CRM',
                          icon: Icons.people_alt,
                          color: const Color(0xFF6366F1),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const CustomerListScreen()),
                          ),
                        ),
                        _QuickActionTile(
                          title: 'Catalogue & Stock',
                          icon: Icons.inventory_2,
                          color: const Color(0xFF0F766E),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ProductCatalogScreen()),
                          ),
                        ),
                        _QuickActionTile(
                          title: 'Livraisons (BL)',
                          icon: Icons.local_shipping,
                          color: const Color(0xFFF97316),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const DeliveryTourScreen()),
                          ),
                        ),
                        _QuickActionTile(
                          title: 'Encaissement',
                          icon: Icons.payments,
                          color: const Color(0xFF14B8A6),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const PaymentCollectionScreen()),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Recent Orders Preview
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Dernières Commandes',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textDark,
                      ),
                    ),
                    TextButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const OrderListScreen()),
                      ),
                      child: const Text('Voir tout'),
                    ),
                  ],
                ),
              ),

              if (orderProv.orders.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(
                    child: Text(
                      'Aucune commande enregistrée aujourd\'hui.',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: orderProv.orders.take(4).length,
                  itemBuilder: (ctx, idx) {
                    final order = orderProv.orders[idx];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: order.isOffline
                              ? Colors.amber.shade100
                              : AppTheme.primary.withOpacity(0.1),
                          child: Icon(
                            order.isOffline ? Icons.cloud_off : Icons.receipt,
                            color: order.isOffline ? Colors.amber.shade800 : AppTheme.primary,
                          ),
                        ),
                        title: Text(
                          order.customerName ?? 'Client #${order.customerId}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          '${order.ref} • ${order.city ?? 'Casablanca'}',
                          style: const TextStyle(fontSize: 12),
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              Formatters.currency(order.total),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primary,
                              ),
                            ),
                            Text(
                              order.status,
                              style: TextStyle(
                                fontSize: 11,
                                color: order.isOffline ? Colors.orange : Colors.green,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionTile({
    required this.title,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1E293B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

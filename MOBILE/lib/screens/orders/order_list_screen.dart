import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/order_model.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/order_provider.dart';
import '../../widgets/status_badge.dart';
import 'new_order_screen.dart';

class OrderListScreen extends StatelessWidget {
  const OrderListScreen({super.key});

  void _showOrderDetails(BuildContext context, OrderModel order) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  order.ref,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                StatusBadge(status: order.status),
              ],
            ),
            const SizedBox(height: 6),
            Text('Client: ${order.customerName ?? 'Client #${order.customerId}'}'),
            Text('Date: ${Formatters.date(order.date)}'),
            const Divider(height: 24),
            const Text(
              'Articles Commandés:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (order.items.isEmpty)
              const Text('Aucun détail d\'article disponible.', style: TextStyle(color: Colors.grey))
            else
              ...order.items.map((it) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text('${it.quantity}x ${it.productName}'),
                        ),
                        Text(
                          Formatters.currency(it.total),
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  )),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total Général TTC:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(
                  Formatters.currency(order.total),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primary),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final orderProv = Provider.watch<OrderProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bons de Commande'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => orderProv.fetchOrders(),
          ),
        ],
      ),
      body: orderProv.isLoading && orderProv.orders.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : orderProv.orders.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.receipt_long, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text(
                        'Aucune commande trouvée.',
                        style: TextStyle(color: Colors.grey, fontSize: 16),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => orderProv.fetchOrders(),
                  child: ListView.builder(
                    itemCount: orderProv.orders.length,
                    itemBuilder: (ctx, idx) {
                      final order = orderProv.orders[idx];
                      return Card(
                        child: ListTile(
                          onTap: () => _showOrderDetails(context, order),
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
                            '${order.ref} • ${Formatters.date(order.date)}',
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
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              StatusBadge(status: order.status),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primary,
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NewOrderScreen()),
          );
        },
        icon: const Icon(Icons.add),
        label: const Text('Nouvelle Commande'),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/customer_model.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../orders/new_order_screen.dart';
import '../payments/payment_collection_screen.dart';
import '../visits/visits_screen.dart';

class CustomerDetailScreen extends StatelessWidget {
  final CustomerModel customer;

  const CustomerDetailScreen({super.key, required this.customer});

  @override
  Widget build(BuildContext context) {
    final orderProv = Provider.watch<OrderProvider>(context);
    final customerOrders = orderProv.orders.where((o) => o.customerId == customer.id).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(customer.name),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            Container(
              width: double.infinity,
              color: Colors.white,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        customer.name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textDark,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: customer.status == 'Actif' ? Colors.green.shade50 : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: customer.status == 'Actif' ? Colors.green : Colors.red,
                          ),
                        ),
                        child: Text(
                          customer.status,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: customer.status == 'Actif' ? Colors.green.shade800 : Colors.red.shade800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Code Client: ${customer.code} • Barème: ${customer.priceTier.toUpperCase()}',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                  ),
                  if (customer.ice != null && customer.ice!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Identifiant Commun de l\'Entreprise (ICE): ${customer.ice}',
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ],
                  const SizedBox(height: 12),
                  if (customer.phone != null)
                    Row(
                      children: [
                        const Icon(Icons.phone, size: 16, color: AppTheme.primary),
                        const SizedBox(width: 8),
                        Text(customer.phone!, style: const TextStyle(fontWeight: FontWeight.w600)),
                      ],
                    ),
                  if (customer.address != null) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 16, color: Colors.orange),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${customer.address}, ${customer.city}',
                            style: const TextStyle(color: Color(0xFF475569)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Financial Health Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Situation Financière & Crédit',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    const Divider(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Solde Actuel Dû', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text(
                                Formatters.currency(customer.balance),
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: customer.balance > 0 ? Colors.red.shade700 : Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Plafond de Crédit', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text(
                                Formatters.currency(customer.creditLimit),
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Crédit Restant Disponible', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text(
                                Formatters.currency(customer.availableCredit),
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: customer.availableCredit > 0 ? Colors.blue.shade700 : Colors.red,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Quick Actions
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      icon: const Icon(Icons.add_shopping_cart, size: 18),
                      label: const Text('Commander'),
                      onPressed: () {
                        final cart = Provider.of<CartProvider>(context, listen: false);
                        cart.clear();
                        cart.selectCustomer(customer);
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const NewOrderScreen()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF14B8A6),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      icon: const Icon(Icons.payments, size: 18),
                      label: const Text('Encaisser'),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const PaymentCollectionScreen()),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Orders History
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Historique des Commandes (${customerOrders.length})',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),

            if (customerOrders.isEmpty)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(
                  child: Text(
                    'Aucune commande récente pour ce client.',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: customerOrders.length,
                itemBuilder: (ctx, idx) {
                  final order = customerOrders[idx];
                  return Card(
                    child: ListTile(
                      title: Text(order.ref, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('Date: ${Formatters.date(order.date)}'),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            Formatters.currency(order.total),
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary),
                          ),
                          Text(
                            order.status,
                            style: const TextStyle(fontSize: 11, color: Colors.green),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

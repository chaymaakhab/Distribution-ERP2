import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/customer_model.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/cart_provider.dart';
import '../../providers/customer_provider.dart';
import '../orders/new_order_screen.dart';
import 'customer_detail_screen.dart';

class CustomerListScreen extends StatelessWidget {
  const CustomerListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final custProv = Provider.watch<CustomerProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Clients & Portefeuille'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => custProv.fetchCustomers(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => custProv.setSearchQuery(val),
                  decoration: InputDecoration(
                    hintText: 'Rechercher par nom, code ou tél...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: custProv.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () => custProv.setSearchQuery(''),
                          )
                        : null,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                ),
                if (custProv.cities.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        FilterChip(
                          label: const Text('Toutes les villes'),
                          selected: custProv.selectedCity == null,
                          onSelected: (_) => custProv.setSelectedCity(null),
                        ),
                        const SizedBox(width: 6),
                        ...custProv.cities.map((city) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: FilterChip(
                              label: Text(city),
                              selected: custProv.selectedCity == city,
                              onSelected: (_) => custProv.setSelectedCity(city),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Customers List
          Expanded(
            child: custProv.isLoading && custProv.customers.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : custProv.customers.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.person_search, size: 64, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            const Text(
                              'Aucun client trouvé',
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => custProv.fetchCustomers(),
                        child: ListView.builder(
                          itemCount: custProv.customers.length,
                          itemBuilder: (ctx, idx) {
                            final customer = custProv.customers[idx];
                            return _CustomerCard(customer: customer);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _CustomerCard extends StatelessWidget {
  final CustomerModel customer;

  const _CustomerCard({required this.customer});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => CustomerDetailScreen(customer: customer),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          customer.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textDark,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${customer.code} • ${customer.city}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (customer.isCreditOverLimit)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red.shade100,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'Plafond Dépassé',
                        style: TextStyle(
                          color: Colors.red,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const Divider(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Solde Dû', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      Text(
                        Formatters.currency(customer.balance),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: customer.balance > 0 ? Colors.red.shade700 : Colors.green.shade700,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Plafond Crédit', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      Text(
                        Formatters.currency(customer.creditLimit),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      backgroundColor: AppTheme.primary,
                      minimumSize: Size.zero,
                    ),
                    icon: const Icon(Icons.add_shopping_cart, size: 16),
                    label: const Text('Commander', style: TextStyle(fontSize: 12)),
                    onPressed: () {
                      final cartProv = Provider.of<CartProvider>(context, listen: false);
                      cartProv.clear();
                      cartProv.selectCustomer(customer);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const NewOrderScreen()),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

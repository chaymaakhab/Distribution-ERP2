import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/visit_model.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/customer_provider.dart';
import '../../providers/visit_provider.dart';
import '../../widgets/status_badge.dart';

class VisitsScreen extends StatelessWidget {
  const VisitsScreen({super.key});

  void _showNewVisitDialog(BuildContext context) {
    final custProv = Provider.of<CustomerProvider>(context, listen: false);
    final visitProv = Provider.of<VisitProvider>(context, listen: false);

    int? selectedCustId = custProv.customers.isNotEmpty ? custProv.customers.first.id : null;
    String visitType = 'commande';
    final notesCtrl = TextEditingController();
    final amountCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: const Text('Programmer / Noter une Visite'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<int>(
                  value: selectedCustId,
                  decoration: const InputDecoration(labelText: 'Client'),
                  items: custProv.customers.map((c) {
                    return DropdownMenuItem<int>(
                      value: c.id,
                      child: Text(c.name, overflow: TextOverflow.ellipsis),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => selectedCustId = val),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: visitType,
                  decoration: const InputDecoration(labelText: 'Motif de visite'),
                  items: const [
                    DropdownMenuItem(value: 'commande', child: Text('Prise de Commande')),
                    DropdownMenuItem(value: 'prospection', child: Text('Prospection Client')),
                    DropdownMenuItem(value: 'recouvrement', child: Text('Recouvrement / Encaissement')),
                    DropdownMenuItem(value: 'routine', child: Text('Visite de Routine')),
                  ],
                  onChanged: (val) => setState(() => visitType = val ?? 'commande'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: amountCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Montant Encaissé (DH) - Optionnel',
                    prefixText: 'DH ',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Compte-rendu / Remarques'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (selectedCustId == null) return;
                final cust = custProv.getById(selectedCustId!);
                final amount = double.tryParse(amountCtrl.text.trim()) ?? 0.0;

                await visitProv.createVisit(
                  customerId: selectedCustId!,
                  customerName: cust?.name ?? 'Client',
                  customerCity: cust?.city ?? 'Casablanca',
                  visitType: visitType,
                  notes: notesCtrl.text.trim(),
                  amountCollected: amount,
                );

                if (ctx.mounted) Navigator.pop(ctx);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Visite enregistrée (Mode en ligne ou hors-ligne).')),
                  );
                }
              },
              child: const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );
  }

  void _showCompleteDialog(BuildContext context, VisitModel visit) {
    final visitProv = Provider.of<VisitProvider>(context, listen: false);
    final notesCtrl = TextEditingController(text: visit.notes);
    final amountCtrl = TextEditingController(
      text: visit.amountCollected > 0 ? visit.amountCollected.toString() : '',
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Clôturer Visite - ${visit.customerName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amountCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Montant encaissé (DH)',
                prefixText: 'DH ',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: notesCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Rapport de visite',
                hintText: 'Ex: Client intéressé par la nouvelle promo...',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              final amount = double.tryParse(amountCtrl.text.trim()) ?? 0.0;
              if (visit.id != null) {
                await visitProv.completeVisit(
                  visit.id!,
                  notes: notesCtrl.text.trim(),
                  amountCollected: amount,
                );
              }
              if (ctx.mounted) Navigator.pop(ctx);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Visite clôturée avec succès !')),
                );
              }
            },
            child: const Text('Clôturer Visite'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final visitProv = Provider.watch<VisitProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Visites & Check-in GPS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => visitProv.fetchVisits(),
          ),
        ],
      ),
      body: visitProv.isLoading && visitProv.visits.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : visitProv.visits.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.location_off_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text(
                        'Aucune visite programmée aujourd\'hui.',
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => _showNewVisitDialog(context),
                        icon: const Icon(Icons.add_location_alt),
                        label: const Text('Programmer une Visite'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => visitProv.fetchVisits(),
                  child: ListView.builder(
                    itemCount: visitProv.visits.length,
                    itemBuilder: (ctx, idx) {
                      final visit = visitProv.visits[idx];
                      final isRealisee = visit.status == 'realisee';

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      visit.customerName ?? 'Client #${visit.customerId}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                  ),
                                  StatusBadge(status: visit.status),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${visit.ref} • ${visit.customerCity ?? 'Casablanca'} • Motif: ${visit.visitType.toUpperCase()}',
                                style: const TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                              if (visit.notes != null && visit.notes!.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade50,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'Note: ${visit.notes}',
                                    style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                                  ),
                                ),
                              ],
                              if (visit.amountCollected > 0) ...[
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.payments, size: 16, color: Colors.green),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Encaissé: ${Formatters.currency(visit.amountCollected)}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                                    ),
                                  ],
                                ),
                              ],
                              const Divider(height: 20),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  if (!isRealisee) ...[
                                    OutlinedButton.icon(
                                      icon: const Icon(Icons.my_location, size: 16),
                                      label: const Text('Check-in GPS'),
                                      onPressed: () async {
                                        if (visit.id != null) {
                                          await visitProv.checkIn(visit.id!);
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Check-in GPS validé !')),
                                            );
                                          }
                                        }
                                      },
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton.icon(
                                      icon: const Icon(Icons.check, size: 16),
                                      label: const Text('Terminer'),
                                      onPressed: () => _showCompleteDialog(context, visit),
                                    ),
                                  ] else
                                    const Row(
                                      children: [
                                        Icon(Icons.check_circle, color: Colors.green, size: 18),
                                        SizedBox(width: 6),
                                        Text('Visite clôturée', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primary,
        onPressed: () => _showNewVisitDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }
}

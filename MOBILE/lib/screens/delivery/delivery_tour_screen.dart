import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/delivery_model.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/delivery_provider.dart';
import '../../widgets/status_badge.dart';

class DeliveryTourScreen extends StatelessWidget {
  const DeliveryTourScreen({super.key});

  void _showProofOfDeliveryModal(BuildContext context, int tourId, DeliveryStopModel stop) {
    final delivProv = Provider.of<DeliveryProvider>(context, listen: false);
    final receiverCtrl = TextEditingController(text: stop.customerName);
    final amountCtrl = TextEditingController(text: stop.totalAmount.toString());
    String method = 'Cash';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            top: 20,
            left: 20,
            right: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Validation de Livraison - ${stop.customerName}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text('Commande: ${stop.orderRef ?? 'N/A'} • Arrêt #${stop.stopOrder}'),
              const Divider(height: 20),
              TextField(
                controller: receiverCtrl,
                decoration: const InputDecoration(labelText: 'Nom du Réceptionnaire'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: method,
                decoration: const InputDecoration(labelText: 'Mode de Règlement'),
                items: const [
                  DropdownMenuItem(value: 'Cash', child: Text('Espèces (Cash à la livraison)')),
                  DropdownMenuItem(value: 'Cheque', child: Text('Chèque Bancaire')),
                  DropdownMenuItem(value: 'Credit', child: Text('À terme (Crédit validé)')),
                ],
                onChanged: (v) => setState(() => method = v ?? 'Cash'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: amountCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Montant Encaissé (DH)',
                  prefixText: 'DH ',
                ),
              ),
              const SizedBox(height: 16),
              // Simulated signature pad
              Container(
                height: 90,
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade400, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey.shade50,
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.draw, color: Colors.grey),
                      SizedBox(height: 4),
                      Text('Émargement & Signature Client', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Annuler'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                      onPressed: () async {
                        final amount = double.tryParse(amountCtrl.text.trim()) ?? 0.0;
                        await delivProv.completeStop(
                          tourId: tourId,
                          stopId: stop.id,
                          amountCollected: amount,
                          paymentMethod: method,
                          receiverName: receiverCtrl.text.trim(),
                          signatureBase64: 'SIG_VERIFIED',
                        );
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Livraison validée et émargée avec succès !'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      },
                      child: const Text('Valider & Signer'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final delivProv = Provider.watch<DeliveryProvider>(context);
    final tour = delivProv.currentTour;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tournée de Livraison'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => delivProv.fetchTours(),
          ),
        ],
      ),
      body: delivProv.isLoading
          ? const Center(child: CircularProgressIndicator())
          : tour == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.local_shipping_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text(
                        'Aucune tournée de livraison assignée.',
                        style: TextStyle(color: Colors.grey, fontSize: 16),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Tour Header Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      color: Colors.white,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Tournée: ${tour.code}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              Text('Date: ${tour.date} • Véhicule: ${tour.vehiclePlate ?? 'Camion #1'}'),
                            ],
                          ),
                          StatusBadge(status: tour.status),
                        ],
                      ),
                    ),
                    const Divider(height: 1),

                    // Stops List
                    Expanded(
                      child: tour.stops.isEmpty
                          ? const Center(child: Text('Aucun arrêt dans cette tournée.'))
                          : ListView.builder(
                              itemCount: tour.stops.length,
                              itemBuilder: (ctx, idx) {
                                final stop = tour.stops[idx];
                                final isDelivered = stop.status == 'delivered';

                                return Card(
                                  child: Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                CircleAvatar(
                                                  radius: 14,
                                                  backgroundColor: AppTheme.primary,
                                                  child: Text(
                                                    '${stop.stopOrder}',
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  stop.customerName,
                                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                                ),
                                              ],
                                            ),
                                            StatusBadge(status: stop.status),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            const Icon(Icons.location_on, size: 16, color: Colors.orange),
                                            const SizedBox(width: 6),
                                            Expanded(
                                              child: Text('${stop.address}, ${stop.city}'),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'À encaisser: ${Formatters.currency(stop.totalAmount)}',
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color: Colors.red.shade700,
                                              ),
                                            ),
                                            if (!isDelivered)
                                              ElevatedButton.icon(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.green,
                                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                                  minimumSize: Size.zero,
                                                ),
                                                icon: const Icon(Icons.check_circle_outline, size: 16),
                                                label: const Text('Livrer & Émarger', style: TextStyle(fontSize: 12)),
                                                onPressed: () => _showProofOfDeliveryModal(context, tour.id, stop),
                                              )
                                            else
                                              const Row(
                                                children: [
                                                  Icon(Icons.verified, color: Colors.green, size: 18),
                                                  SizedBox(width: 4),
                                                  Text('Livré & Signé', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
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
                  ],
                ),
    );
  }
}

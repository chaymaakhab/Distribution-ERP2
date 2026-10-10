import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/sync_provider.dart';
import '../../widgets/status_badge.dart';

class SyncCenterScreen extends StatefulWidget {
  const SyncCenterScreen({super.key});

  @override
  State<SyncCenterScreen> createState() => _SyncCenterScreenState();
}

class _SyncCenterScreenState extends State<SyncCenterScreen> {
  bool _testingConnection = false;
  String? _connectionStatus;

  void _testConnection() async {
    setState(() {
      _testingConnection = true;
      _connectionStatus = null;
    });

    final res = await ApiClient.get('/roles');

    setState(() {
      _testingConnection = false;
      if (res.success || res.statusCode == 401 || res.statusCode == 403) {
        _connectionStatus = 'Connecté au serveur ERP avec succès !';
      } else {
        _connectionStatus = 'Échec: ${res.message}';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final syncProv = Provider.watch<SyncProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Centre de Synchronisation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Nettoyer l\'historique synchronisé',
            onPressed: () => syncProv.clearSynced(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'File d\'attente Hors-Ligne',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${syncProv.pendingCount} opération(s) en attente',
                              style: TextStyle(
                                color: syncProv.pendingCount > 0 ? Colors.amber.shade800 : Colors.green,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: (syncProv.pendingCount > 0 ? Colors.amber : Colors.green).withOpacity(0.12),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            syncProv.pendingCount > 0 ? Icons.cloud_off : Icons.cloud_done,
                            color: syncProv.pendingCount > 0 ? Colors.amber.shade800 : Colors.green,
                            size: 28,
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        minimumSize: const Size(double.infinity, 48),
                      ),
                      onPressed: syncProv.isSyncing ? null : () => syncProv.syncNow(),
                      icon: syncProv.isSyncing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Icon(Icons.sync),
                      label: Text(
                        syncProv.isSyncing ? 'Synchronisation en cours...' : 'Synchroniser Tout Maintenant',
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Connection Diagnostic
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Test de Connexion Serveur', style: TextStyle(fontWeight: FontWeight.bold)),
                        TextButton(
                          onPressed: _testingConnection ? null : _testConnection,
                          child: _testingConnection
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Text('Tester'),
                        ),
                      ],
                    ),
                    Text(
                      'Serveur: ${ApiClient.baseUrl}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    if (_connectionStatus != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        _connectionStatus!,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _connectionStatus!.startsWith('Connecté') ? Colors.green : Colors.red,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Queue Operations List
            const Text(
              'Opérations dans la file locale',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            if (syncProv.queue.isEmpty)
              const Padding(
                padding: EdgeInsets.all(32),
                child: Center(
                  child: Text(
                    'Aucune opération dans la file d\'attente.',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: syncProv.queue.length,
                itemBuilder: (ctx, idx) {
                  final op = syncProv.queue[idx];
                  IconData icon = Icons.pending_actions;
                  String typeLabel = op.type;

                  if (op.type == 'create_order') {
                    icon = Icons.receipt;
                    typeLabel = 'Bon de Commande';
                  } else if (op.type == 'record_payment') {
                    icon = Icons.payments;
                    typeLabel = 'Encaissement Client';
                  } else if (op.type == 'create_visit') {
                    icon = Icons.location_on;
                    typeLabel = 'Visite Commerciale';
                  } else if (op.type == 'record_delivery_stop') {
                    icon = Icons.local_shipping;
                    typeLabel = 'Livraison (BL)';
                  }

                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: op.status == 'synced'
                            ? Colors.green.shade50
                            : Colors.amber.shade50,
                        child: Icon(
                          icon,
                          color: op.status == 'synced' ? Colors.green : Colors.amber.shade800,
                        ),
                      ),
                      title: Text(
                        typeLabel,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('UUID: ${op.uuid.substring(0, 8)}...'),
                          Text('Date: ${Formatters.dateTime(op.createdAt)}'),
                        ],
                      ),
                      trailing: StatusBadge(status: op.status),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}

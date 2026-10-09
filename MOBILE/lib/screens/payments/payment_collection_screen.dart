import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_constants.dart';
import '../../core/services/offline_sync_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/customer_provider.dart';

class PaymentCollectionScreen extends StatefulWidget {
  const PaymentCollectionScreen({super.key});

  @override
  State<PaymentCollectionScreen> createState() => _PaymentCollectionScreenState();
}

class _PaymentCollectionScreenState extends State<PaymentCollectionScreen> {
  int? _selectedCustomerId;
  final _amountController = TextEditingController();
  final _chequeDocController = TextEditingController();
  final _bankController = TextEditingController();
  final _notesController = TextEditingController();
  String _paymentMethod = 'Cash'; // 'Cash', 'Cheque', 'Virement'
  bool _isSubmitting = false;

  final List<String> _moroccanBanks = [
    'Attijariwafa bank',
    'Banque Populaire (BCP)',
    'Bank of Africa (BMCE)',
    'Société Générale Maroc',
    'CIH Bank',
    'Crédit du Maroc',
    'Crédit Agricole du Maroc',
    'CFG Bank',
    'Autre banque',
  ];

  @override
  void dispose() {
    _amountController.dispose();
    _chequeDocController.dispose();
    _bankController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    final custProv = Provider.of<CustomerProvider>(context, listen: false);

    if (_selectedCustomerId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner un client.'), backgroundColor: Colors.orange),
      );
      return;
    }

    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez saisir un montant valide.'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final payload = {
      'customer_id': _selectedCustomerId,
      'amount': amount,
      'method': _paymentMethod,
      'bank': _paymentMethod == 'Cheque' ? _bankController.text.trim() : null,
      'doc_number': _paymentMethod == 'Cheque' ? _chequeDocController.text.trim() : null,
      'notes': _notesController.text.trim(),
    };

    // Try online API first
    final response = await ApiClient.post(ApiConstants.payments, body: payload);

    if (response.success) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        _showSuccessReceipt(amount);
      }
      return;
    }

    // Offline fallback
    await OfflineSyncService.enqueuePayment(payload);

    setState(() => _isSubmitting = false);
    if (mounted) {
      _showSuccessReceipt(amount, isOffline: true);
    }
  }

  void _showSuccessReceipt(double amount, {bool isOffline = false}) {
    final custProv = Provider.of<CustomerProvider>(context, listen: false);
    final cust = custProv.getById(_selectedCustomerId!);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Reçu de Paiement'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Client: ${cust?.name ?? 'Client'}', style: const TextStyle(fontWeight: FontWeight.bold)),
            Text('Ville: ${cust?.city ?? 'Casablanca'}'),
            const Divider(height: 16),
            Text('Montant: ${Formatters.currency(amount)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primary)),
            Text('Mode de règlement: $_paymentMethod'),
            if (_paymentMethod == 'Cheque') ...[
              Text('N° Chèque: ${_chequeDocController.text}'),
              Text('Banque: ${_bankController.text}'),
            ],
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isOffline ? Colors.amber.shade50 : Colors.green.shade50,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                isOffline
                    ? 'Enregistré hors-ligne ! Sera synchronisé avec le serveur.'
                    : 'Enregistré sur le serveur ERP avec succès.',
                style: TextStyle(
                  fontSize: 12,
                  color: isOffline ? Colors.amber.shade900 : Colors.green.shade900,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context); // Back to previous screen
            },
            child: const Text('Fermer & Terminer'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final custProv = Provider.watch<CustomerProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Encaissements & Règlements'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Client Dropdown
            DropdownButtonFormField<int>(
              value: _selectedCustomerId,
              decoration: const InputDecoration(
                labelText: 'Client Payeur',
                prefixIcon: Icon(Icons.person_outline),
              ),
              items: custProv.customers.map((c) {
                return DropdownMenuItem<int>(
                  value: c.id,
                  child: Text(
                    '${c.name} (${Formatters.currency(c.balance)})',
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedCustomerId = val),
            ),
            const SizedBox(height: 16),

            // Amount
            TextField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Montant du Règlement (DH)',
                prefixIcon: Icon(Icons.monetization_on_outlined),
                suffixText: 'DH',
              ),
            ),
            const SizedBox(height: 16),

            // Payment Mode
            DropdownButtonFormField<String>(
              value: _paymentMethod,
              decoration: const InputDecoration(
                labelText: 'Mode de Paiement',
                prefixIcon: Icon(Icons.payment),
              ),
              items: const [
                DropdownMenuItem(value: 'Cash', child: Text('Espèces (Cash)')),
                DropdownMenuItem(value: 'Cheque', child: Text('Chèque Bancaire')),
                DropdownMenuItem(value: 'Virement', child: Text('Virement Bancaire')),
              ],
              onChanged: (val) => setState(() => _paymentMethod = val ?? 'Cash'),
            ),
            const SizedBox(height: 16),

            // Cheque specific fields
            if (_paymentMethod == 'Cheque') ...[
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Banque Émettrice',
                  prefixIcon: Icon(Icons.account_balance),
                ),
                items: _moroccanBanks.map((b) => DropdownMenuItem(value: b, child: Text(b))).toList(),
                onChanged: (val) => _bankController.text = val ?? '',
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _chequeDocController,
                decoration: const InputDecoration(
                  labelText: 'Numéro du Chèque',
                  prefixIcon: Icon(Icons.confirmation_number_outlined),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Notes
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Remarques ou Référence bordereau',
                prefixIcon: Icon(Icons.note_alt_outlined),
              ),
            ),
            const SizedBox(height: 28),

            // Submit Button
            ElevatedButton(
              onPressed: _isSubmitting ? null : _handleSubmit,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Enregistrer le Règlement'),
            ),
          ],
        ),
      ),
    );
  }
}

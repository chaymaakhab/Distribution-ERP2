import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;

    switch (status.toLowerCase()) {
      case 'validée':
      case 'validee':
      case 'livré':
      case 'livre':
      case 'realisee':
      case 'payé':
      case 'actif':
      case 'synced':
        bg = const Color(0xFFDCFCE7);
        text = const Color(0xFF166534);
        break;
      case 'en cours':
      case 'à valider':
      case 'a valider':
      case 'en_cours':
      case 'planifiee':
      case 'pending':
        bg = const Color(0xFFFEF3C7);
        text = const Color(0xFF92400E);
        break;
      case 'en attente synchro':
      case 'offline':
        bg = const Color(0xFFE0E7FF);
        text = const Color(0xFF3730A3);
        break;
      case 'annulée':
      case 'annulee':
      case 'échoué':
      case 'failed':
      case 'bloqué':
      case 'inactif':
        bg = const Color(0xFFFEE2E2);
        text = const Color(0xFF991B1B);
        break;
      default:
        bg = const Color(0xFFF1F5F9);
        text = const Color(0xFF475569);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: text,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

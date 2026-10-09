import 'package:intl/intl.dart';

class Formatters {
  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'fr_FR',
    symbol: 'DH',
    decimalDigits: 2,
  );

  static final DateFormat _dateFormat = DateFormat('dd/MM/yyyy');
  static final DateFormat _dateTimeFormat = DateFormat('dd/MM/yyyy HH:mm');
  static final DateFormat _timeFormat = DateFormat('HH:mm');

  /// Formats amount in Moroccan Dirhams (e.g., "1 250,00 DH")
  static String currency(dynamic amount) {
    if (amount == null) return '0,00 DH';
    double val = 0.0;
    if (amount is num) {
      val = amount.toDouble();
    } else if (amount is String) {
      val = double.tryParse(amount) ?? 0.0;
    }
    return _currencyFormat.format(val).replaceAll('\u00A0', ' ');
  }

  /// Formats date to dd/MM/yyyy
  static String date(dynamic date) {
    if (date == null) return '-';
    if (date is DateTime) return _dateFormat.format(date);
    if (date is String) {
      try {
        final parsed = DateTime.parse(date);
        return _dateFormat.format(parsed);
      } catch (_) {
        return date;
      }
    }
    return '-';
  }

  /// Formats date and time to dd/MM/yyyy HH:mm
  static String dateTime(dynamic date) {
    if (date == null) return '-';
    if (date is DateTime) return _dateTimeFormat.format(date);
    if (date is String) {
      try {
        final parsed = DateTime.parse(date);
        return _dateTimeFormat.format(parsed);
      } catch (_) {
        return date;
      }
    }
    return '-';
  }

  /// Formats time to HH:mm
  static String time(dynamic date) {
    if (date == null) return '-';
    if (date is DateTime) return _timeFormat.format(date);
    if (date is String) {
      try {
        final parsed = DateTime.parse(date);
        return _timeFormat.format(parsed);
      } catch (_) {
        return date;
      }
    }
    return '-';
  }
}

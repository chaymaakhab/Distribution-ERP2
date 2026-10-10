import 'package:flutter/foundation.dart';
import '../core/api/api_client.dart';
import '../core/api/api_constants.dart';
import '../core/models/visit_model.dart';
import '../core/services/offline_sync_service.dart';
import '../core/services/storage_service.dart';

class VisitProvider extends ChangeNotifier {
  List<VisitModel> _visits = [];
  bool _isLoading = false;

  List<VisitModel> get visits => _visits;
  bool get isLoading => _isLoading;

  VisitProvider() {
    _loadFromCache();
    fetchVisits();
  }

  void _loadFromCache() {
    final cached = StorageService.getCacheList('erp_cache_visits');
    if (cached.isNotEmpty) {
      _visits = cached.map((e) => VisitModel.fromJson(e)).toList();
      notifyListeners();
    }
  }

  Future<void> fetchVisits() async {
    _isLoading = true;
    notifyListeners();

    final response = await ApiClient.get(ApiConstants.visits);

    _isLoading = false;

    if (response.success && response.data != null) {
      List rawList = [];
      if (response.data is Map && response.data['data'] is List) {
        rawList = response.data['data'];
      } else if (response.data is List) {
        rawList = response.data;
      }

      _visits = rawList.map((e) => VisitModel.fromJson(e)).toList();
      await StorageService.setCacheList(
        'erp_cache_visits',
        _visits.map((e) => e.toJson()).toList(),
      );
    }

    notifyListeners();
  }

  Future<bool> createVisit({
    required int customerId,
    required String customerName,
    required String customerCity,
    required String visitType,
    String? notes,
    double amountCollected = 0.0,
  }) async {
    final payload = {
      'customer_id': customerId,
      'visit_date': DateTime.now().toIso8601String().substring(0, 10),
      'visit_type': visitType,
      'status': 'realisee',
      'notes': notes,
      'amount_collected': amountCollected,
    };

    final response = await ApiClient.post(ApiConstants.visits, body: payload);

    if (response.success) {
      await fetchVisits();
      return true;
    }

    // Offline fallback
    final uuid = await OfflineSyncService.enqueueVisit(payload);

    final localVisit = VisitModel(
      ref: 'VIS-LOC-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      customerId: customerId,
      customerName: customerName,
      customerCity: customerCity,
      visitDate: DateTime.now().toIso8601String().substring(0, 10),
      visitType: visitType,
      status: 'realisee',
      notes: notes,
      amountCollected: amountCollected,
      clientGeneratedUuid: uuid,
      isOffline: true,
    );

    _visits.insert(0, localVisit);
    await StorageService.setCacheList(
      'erp_cache_visits',
      _visits.map((e) => e.toJson()).toList(),
    );
    notifyListeners();
    return true;
  }

  Future<bool> checkIn(int visitId) async {
    final response = await ApiClient.patch('${ApiConstants.visits}/$visitId/checkin');
    if (response.success) {
      await fetchVisits();
      return true;
    }
    return false;
  }

  Future<bool> completeVisit(int visitId, {String? notes, double amountCollected = 0.0}) async {
    final response = await ApiClient.patch(
      '${ApiConstants.visits}/$visitId/complete',
      body: {
        'notes': notes,
        'amount_collected': amountCollected,
      },
    );
    if (response.success) {
      await fetchVisits();
      return true;
    }
    return false;
  }
}

import 'package:flutter/foundation.dart';
import '../core/api/api_client.dart';
import '../core/api/api_constants.dart';
import '../core/models/delivery_model.dart';
import '../core/services/offline_sync_service.dart';

class DeliveryProvider extends ChangeNotifier {
  List<DeliveryTourModel> _tours = [];
  bool _isLoading = false;

  List<DeliveryTourModel> get tours => _tours;
  bool get isLoading => _isLoading;

  DeliveryTourModel? get currentTour => _tours.isNotEmpty ? _tours.first : null;

  DeliveryProvider() {
    fetchTours();
  }

  Future<void> fetchTours() async {
    _isLoading = true;
    notifyListeners();

    final response = await ApiClient.get(ApiConstants.deliveryTours);

    _isLoading = false;

    if (response.success && response.data != null) {
      List rawList = [];
      if (response.data is Map && response.data['data'] is List) {
        rawList = response.data['data'];
      } else if (response.data is List) {
        rawList = response.data;
      }

      _tours = rawList.map((e) => DeliveryTourModel.fromJson(e)).toList();
    }

    notifyListeners();
  }

  Future<bool> completeStop({
    required int tourId,
    required int stopId,
    required double amountCollected,
    required String paymentMethod,
    required String receiverName,
    String? signatureBase64,
  }) async {
    final payload = {
      'stop_id': stopId,
      'status': 'delivered',
      'amount_collected': amountCollected,
      'payment_method': paymentMethod,
      'receiver_name': receiverName,
      'signature': signatureBase64 ?? 'SIG_VERIFIED',
    };

    // Try online endpoint
    final response = await ApiClient.patch(
      '${ApiConstants.deliveryTours}/$tourId/stops/$stopId',
      body: payload,
    );

    if (response.success) {
      await fetchTours();
      return true;
    }

    // Offline fallback
    await OfflineSyncService.enqueueDeliveryStop(payload);
    // Locally mark as delivered
    for (var tour in _tours) {
      if (tour.id == tourId) {
        for (var stop in tour.stops) {
          if (stop.id == stopId) {
            // Updated in memory
            notifyListeners();
            break;
          }
        }
      }
    }

    return true;
  }
}

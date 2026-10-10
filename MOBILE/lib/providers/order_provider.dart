import 'package:flutter/foundation.dart';
import '../core/api/api_client.dart';
import '../core/api/api_constants.dart';
import '../core/models/order_model.dart';
import '../core/services/offline_sync_service.dart';
import '../core/services/storage_service.dart';
import 'cart_provider.dart';

class OrderProvider extends ChangeNotifier {
  List<OrderModel> _orders = [];
  bool _isLoading = false;

  List<OrderModel> get orders => _orders;
  bool get isLoading => _isLoading;

  OrderProvider() {
    _loadFromCache();
    fetchOrders();
  }

  void _loadFromCache() {
    final cached = StorageService.getCacheList('erp_cache_orders');
    if (cached.isNotEmpty) {
      _orders = cached.map((e) => OrderModel.fromJson(e)).toList();
      notifyListeners();
    }
  }

  Future<void> fetchOrders() async {
    _isLoading = true;
    notifyListeners();

    final response = await ApiClient.get(ApiConstants.orders);

    _isLoading = false;

    if (response.success && response.data != null) {
      List rawList = [];
      if (response.data is Map && response.data['data'] is List) {
        rawList = response.data['data'];
      } else if (response.data is List) {
        rawList = response.data;
      }

      _orders = rawList.map((e) => OrderModel.fromJson(e)).toList();
      await StorageService.setCacheList(
        'erp_cache_orders',
        _orders.map((e) => e.toJson()).toList(),
      );
    }

    notifyListeners();
  }

  /// Create and submit an order (Online or Offline Fallback)
  Future<bool> createOrder({
    required int customerId,
    required String customerName,
    required String city,
    required List<CartItem> cartItems,
    String? notes,
  }) async {
    final itemsPayload = cartItems
        .map((ci) => {
              'product_id': ci.product.id,
              'quantity': ci.quantity,
              'unit_price': ci.discountedUnitPriceHt,
              'total': ci.totalHt,
            })
        .toList();

    final totalTtc = cartItems.fold(0.0, (sum, i) => sum + i.totalTtc);

    final payload = {
      'customer_id': customerId,
      'city': city,
      'notes': notes,
      'total': totalTtc,
      'items': itemsPayload,
    };

    // Try online submission first
    final response = await ApiClient.post(ApiConstants.orders, body: payload);

    if (response.success) {
      await fetchOrders();
      return true;
    }

    // Network error or server offline: Fallback to Offline Sync Queue
    final uuid = await OfflineSyncService.enqueueOrder(payload);

    final localOrder = OrderModel(
      ref: 'CMD-LOC-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      customerId: customerId,
      customerName: customerName,
      city: city,
      total: totalTtc,
      status: 'En attente synchro',
      date: DateTime.now().toIso8601String(),
      items: cartItems
          .map((ci) => OrderItemModel(
                productId: ci.product.id,
                productName: ci.product.name,
                quantity: ci.quantity,
                unitPrice: ci.discountedUnitPriceHt,
                discountRate: ci.discountRate,
                total: ci.totalHt,
              ))
          .toList(),
      clientGeneratedUuid: uuid,
      isOffline: true,
    );

    _orders.insert(0, localOrder);
    await StorageService.setCacheList(
      'erp_cache_orders',
      _orders.map((e) => e.toJson()).toList(),
    );
    notifyListeners();
    return true;
  }
}

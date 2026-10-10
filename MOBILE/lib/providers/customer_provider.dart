import 'package:flutter/foundation.dart';
import '../core/api/api_client.dart';
import '../core/api/api_constants.dart';
import '../core/models/customer_model.dart';
import '../core/services/storage_service.dart';

class CustomerProvider extends ChangeNotifier {
  List<CustomerModel> _customers = [];
  bool _isLoading = false;
  String _searchQuery = '';
  String? _selectedCity;

  List<CustomerModel> get customers {
    return _customers.where((c) {
      final matchesSearch = _searchQuery.isEmpty ||
          c.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c.code.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (c.phone != null && c.phone!.contains(_searchQuery));
      final matchesCity = _selectedCity == null || _selectedCity!.isEmpty || c.city == _selectedCity;
      return matchesSearch && matchesCity;
    }).toList();
  }

  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String? get selectedCity => _selectedCity;
  List<String> get cities => _customers.map((c) => c.city).toSet().toList();

  CustomerProvider() {
    _loadFromCache();
    fetchCustomers();
  }

  void _loadFromCache() {
    final cached = StorageService.getCacheList('erp_cache_customers');
    if (cached.isNotEmpty) {
      _customers = cached.map((e) => CustomerModel.fromJson(e)).toList();
      notifyListeners();
    }
  }

  Future<void> fetchCustomers() async {
    _isLoading = true;
    notifyListeners();

    final response = await ApiClient.get(ApiConstants.customers);

    _isLoading = false;

    if (response.success && response.data != null) {
      List rawList = [];
      if (response.data is Map && response.data['data'] is List) {
        rawList = response.data['data'];
      } else if (response.data is List) {
        rawList = response.data;
      }

      _customers = rawList.map((e) => CustomerModel.fromJson(e)).toList();
      await StorageService.setCacheList(
        'erp_cache_customers',
        _customers.map((e) => e.toJson()).toList(),
      );
    }

    notifyListeners();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void setSelectedCity(String? city) {
    _selectedCity = city;
    notifyListeners();
  }

  CustomerModel? getById(int id) {
    try {
      return _customers.firstWhere((c) => c.id == id);
    } catch (_) {
      return null;
    }
  }
}

import 'package:flutter/foundation.dart';
import '../core/api/api_client.dart';
import '../core/api/api_constants.dart';
import '../core/models/product_model.dart';
import '../core/services/storage_service.dart';

class ProductProvider extends ChangeNotifier {
  List<ProductModel> _products = [];
  bool _isLoading = false;
  String _searchQuery = '';
  String? _selectedCategory;

  List<ProductModel> get products {
    return _products.where((p) {
      final matchesSearch = _searchQuery.isEmpty ||
          p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (p.barcode != null && p.barcode!.contains(_searchQuery));
      final matchesCategory = _selectedCategory == null ||
          _selectedCategory!.isEmpty ||
          _selectedCategory == 'Tous' ||
          p.category == _selectedCategory;
      return matchesSearch && matchesCategory;
    }).toList();
  }

  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String? get selectedCategory => _selectedCategory;

  List<String> get categories {
    final list = _products.map((p) => p.category).toSet().toList();
    list.insert(0, 'Tous');
    return list;
  }

  ProductProvider() {
    _loadFromCache();
    fetchProducts();
  }

  void _loadFromCache() {
    final cached = StorageService.getCacheList('erp_cache_products');
    if (cached.isNotEmpty) {
      _products = cached.map((e) => ProductModel.fromJson(e)).toList();
      notifyListeners();
    }
  }

  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();

    final response = await ApiClient.get(ApiConstants.products);

    _isLoading = false;

    if (response.success && response.data != null) {
      List rawList = [];
      if (response.data is Map && response.data['data'] is List) {
        rawList = response.data['data'];
      } else if (response.data is List) {
        rawList = response.data;
      }

      _products = rawList.map((e) => ProductModel.fromJson(e)).toList();
      await StorageService.setCacheList(
        'erp_cache_products',
        _products.map((e) => e.toJson()).toList(),
      );
    }

    notifyListeners();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void setSelectedCategory(String? category) {
    _selectedCategory = category;
    notifyListeners();
  }

  ProductModel? getById(int id) {
    try {
      return _products.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }
}

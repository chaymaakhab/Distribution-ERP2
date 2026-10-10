import 'package:flutter/foundation.dart';
import '../core/models/customer_model.dart';
import '../core/models/product_model.dart';

class CartItem {
  final ProductModel product;
  int quantity;
  double discountRate; // In percent (e.g. 5.0 for 5%)

  CartItem({
    required this.product,
    this.quantity = 1,
    this.discountRate = 0.0,
  });

  double get unitPriceHt => product.price;
  double get discountedUnitPriceHt => unitPriceHt * (1 - (discountRate / 100));
  double get totalHt => discountedUnitPriceHt * quantity;
  double get totalTtc => totalHt * (1 + (product.vatRate / 100));
}

class CartProvider extends ChangeNotifier {
  CustomerModel? _selectedCustomer;
  final Map<int, CartItem> _items = {};

  CustomerModel? get selectedCustomer => _selectedCustomer;
  List<CartItem> get items => _items.values.toList();
  int get itemCount => _items.values.fold(0, (sum, i) => sum + i.quantity);
  bool get isEmpty => _items.isEmpty;

  void selectCustomer(CustomerModel? customer) {
    _selectedCustomer = customer;
    notifyListeners();
  }

  void addProduct(ProductModel product, {int quantity = 1, double discountRate = 0.0}) {
    if (_items.containsKey(product.id)) {
      _items[product.id]!.quantity += quantity;
      if (discountRate > 0) {
        _items[product.id]!.discountRate = discountRate;
      }
    } else {
      _items[product.id] = CartItem(
        product: product,
        quantity: quantity,
        discountRate: discountRate,
      );
    }
    notifyListeners();
  }

  void updateQuantity(int productId, int quantity) {
    if (!_items.containsKey(productId)) return;
    if (quantity <= 0) {
      _items.remove(productId);
    } else {
      _items[productId]!.quantity = quantity;
    }
    notifyListeners();
  }

  void updateDiscount(int productId, double discount) {
    if (_items.containsKey(productId)) {
      _items[productId]!.discountRate = discount;
      notifyListeners();
    }
  }

  void removeItem(int productId) {
    _items.remove(productId);
    notifyListeners();
  }

  void clear() {
    _items.clear();
    _selectedCustomer = null;
    notifyListeners();
  }

  double get totalHt => _items.values.fold(0.0, (sum, i) => sum + i.totalHt);

  double get totalTva => _items.values.fold(
        0.0,
        (sum, i) => sum + (i.totalHt * (i.product.vatRate / 100)),
      );

  double get totalTtc => totalHt + totalTva;
}

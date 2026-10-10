class ProductModel {
  final int id;
  final String sku;
  final String name;
  final String category;
  final double price; // Prix unitaire HT
  final int stock;
  final String unit; // Cartons, Packs, Bouteilles, Unités, Kg
  final double vatRate; // 20.0, 14.0, etc.
  final String? barcode;
  final String? imageUrl;
  final bool isActive;

  ProductModel({
    required this.id,
    required this.sku,
    required this.name,
    this.category = 'Général',
    required this.price,
    this.stock = 0,
    this.unit = 'Unité',
    this.vatRate = 20.0,
    this.barcode,
    this.imageUrl,
    this.isActive = true,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      sku: json['sku'] ?? json['code'] ?? '',
      name: json['name'] ?? '',
      category: json['category']?['name'] ?? json['category_name'] ?? json['category'] ?? 'Général',
      price: (json['price'] != null) ? double.tryParse(json['price'].toString()) ?? 0.0 : 0.0,
      stock: (json['stock'] != null) ? int.tryParse(json['stock'].toString()) ?? 0 : 0,
      unit: json['unit'] ?? 'Unité',
      vatRate: (json['vat_rate'] != null) ? double.tryParse(json['vat_rate'].toString()) ?? 20.0 : 20.0,
      barcode: json['barcode'],
      imageUrl: json['image_url'],
      isActive: json['is_active'] == true || json['is_active'] == 1 || json['status'] == 'active',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'sku': sku,
    'name': name,
    'category': category,
    'price': price,
    'stock': stock,
    'unit': unit,
    'vat_rate': vatRate,
    'barcode': barcode,
    'image_url': imageUrl,
    'is_active': isActive,
  };

  double get priceTtc => price * (1 + (vatRate / 100));
}

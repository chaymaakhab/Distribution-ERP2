class OrderModel {
  final int? id;
  final String ref;
  final int customerId;
  final String? customerName;
  final String? city;
  final double total;
  final String status;
  final String date;
  final List<OrderItemModel> items;
  final String? clientGeneratedUuid;
  final bool isOffline;

  OrderModel({
    this.id,
    required this.ref,
    required this.customerId,
    this.customerName,
    this.city,
    required this.total,
    this.status = 'À valider',
    required this.date,
    this.items = const [],
    this.clientGeneratedUuid,
    this.isOffline = false,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'],
      ref: json['ref'] ?? '',
      customerId: json['customer_id'] ?? 0,
      customerName: json['customer']?['name'] ?? json['customer_name'],
      city: json['city'] ?? json['customer']?['city'],
      total: (json['total'] != null) ? double.tryParse(json['total'].toString()) ?? 0.0 : 0.0,
      status: json['status'] ?? 'À valider',
      date: json['date'] ?? json['created_at'] ?? '',
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => OrderItemModel.fromJson(item))
              .toList() ??
          [],
      clientGeneratedUuid: json['client_generated_uuid'],
      isOffline: json['is_offline'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'ref': ref,
    'customer_id': customerId,
    'customer_name': customerName,
    'city': city,
    'total': total,
    'status': status,
    'date': date,
    'items': items.map((e) => e.toJson()).toList(),
    'client_generated_uuid': clientGeneratedUuid,
    'is_offline': isOffline,
  };
}

class OrderItemModel {
  final int productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double discountRate; // in percent
  final double total;

  OrderItemModel({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    this.discountRate = 0.0,
    required this.total,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    final qty = (json['quantity'] != null) ? int.tryParse(json['quantity'].toString()) ?? 1 : 1;
    final price = (json['unit_price'] != null) ? double.tryParse(json['unit_price'].toString()) ?? 0.0 : 0.0;
    final total = (json['total'] != null) ? double.tryParse(json['total'].toString()) ?? (qty * price) : (qty * price);

    return OrderItemModel(
      productId: json['product_id'] ?? 0,
      productName: json['product']?['name'] ?? json['product_name'] ?? 'Article',
      quantity: qty,
      unitPrice: price,
      discountRate: (json['discount_rate'] != null) ? double.tryParse(json['discount_rate'].toString()) ?? 0.0 : 0.0,
      total: total,
    );
  }

  Map<String, dynamic> toJson() => {
    'product_id': productId,
    'product_name': productName,
    'quantity': quantity,
    'unit_price': unitPrice,
    'discount_rate': discountRate,
    'total': total,
  };
}

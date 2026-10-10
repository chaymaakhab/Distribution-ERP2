class DeliveryTourModel {
  final int id;
  final String code;
  final String date;
  final String status;
  final String? vehiclePlate;
  final List<DeliveryStopModel> stops;

  DeliveryTourModel({
    required this.id,
    required this.code,
    required this.date,
    required this.status,
    this.vehiclePlate,
    this.stops = const [],
  });

  factory DeliveryTourModel.fromJson(Map<String, dynamic> json) {
    return DeliveryTourModel(
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      date: json['date'] ?? '',
      status: json['status'] ?? 'En cours',
      vehiclePlate: json['vehicle']?['license_plate'] ?? json['vehicle_plate'],
      stops: (json['stops'] as List<dynamic>?)
              ?.map((s) => DeliveryStopModel.fromJson(s))
              .toList() ??
          [],
    );
  }
}

class DeliveryStopModel {
  final int id;
  final int tourId;
  final int stopOrder;
  final String customerName;
  final String? customerPhone;
  final String address;
  final String city;
  final String? orderRef;
  final double totalAmount;
  final String status; // 'pending', 'delivered', 'failed'
  final double amountCollected;
  final String? paymentMethod; // 'Cash', 'Cheque'
  final String? receiverName;
  final String? signature;
  final String? deliveredAt;

  DeliveryStopModel({
    required this.id,
    required this.tourId,
    required this.stopOrder,
    required this.customerName,
    this.customerPhone,
    required this.address,
    required this.city,
    this.orderRef,
    required this.totalAmount,
    this.status = 'pending',
    this.amountCollected = 0.0,
    this.paymentMethod,
    this.receiverName,
    this.signature,
    this.deliveredAt,
  });

  factory DeliveryStopModel.fromJson(Map<String, dynamic> json) {
    return DeliveryStopModel(
      id: json['id'] ?? 0,
      tourId: json['delivery_tour_id'] ?? json['tour_id'] ?? 0,
      stopOrder: json['stop_order'] ?? 1,
      customerName: json['customer']?['name'] ?? json['customer_name'] ?? 'Client',
      customerPhone: json['customer']?['phone'] ?? json['customer_phone'],
      address: json['address'] ?? json['customer']?['address'] ?? '',
      city: json['city'] ?? json['customer']?['city'] ?? 'Casablanca',
      orderRef: json['order']?['ref'] ?? json['order_ref'],
      totalAmount: (json['amount_to_collect'] != null)
          ? double.tryParse(json['amount_to_collect'].toString()) ?? 0.0
          : ((json['order']?['total'] != null)
              ? double.tryParse(json['order']['total'].toString()) ?? 0.0
              : 0.0),
      status: json['status'] ?? 'pending',
      amountCollected: (json['amount_collected'] != null)
          ? double.tryParse(json['amount_collected'].toString()) ?? 0.0
          : 0.0,
      paymentMethod: json['payment_method'],
      receiverName: json['receiver_name'],
      signature: json['signature'],
      deliveredAt: json['delivered_at'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tour_id': tourId,
    'stop_order': stopOrder,
    'customer_name': customerName,
    'customer_phone': customerPhone,
    'address': address,
    'city': city,
    'order_ref': orderRef,
    'total_amount': totalAmount,
    'status': status,
    'amount_collected': amountCollected,
    'payment_method': paymentMethod,
    'receiver_name': receiverName,
    'signature': signature,
    'delivered_at': deliveredAt,
  };
}

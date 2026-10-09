class CustomerModel {
  final int id;
  final String code;
  final String name;
  final String city;
  final String? phone;
  final String? address;
  final double creditLimit;
  final double balance;
  final String priceTier; // standard, wholesale, vip, etc.
  final String? ice;
  final double? lat;
  final double? lng;
  final String status;

  CustomerModel({
    required this.id,
    required this.code,
    required this.name,
    required this.city,
    this.phone,
    this.address,
    this.creditLimit = 0.0,
    this.balance = 0.0,
    this.priceTier = 'standard',
    this.ice,
    this.lat,
    this.lng,
    this.status = 'Actif',
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      city: json['city'] ?? 'Casablanca',
      phone: json['phone'],
      address: json['address'],
      creditLimit: (json['credit_limit'] != null) ? double.tryParse(json['credit_limit'].toString()) ?? 0.0 : 0.0,
      balance: (json['balance'] != null) ? double.tryParse(json['balance'].toString()) ?? 0.0 : 0.0,
      priceTier: json['price_tier'] ?? 'standard',
      ice: json['ice'],
      lat: json['lat'] != null ? double.tryParse(json['lat'].toString()) : null,
      lng: json['lng'] != null ? double.tryParse(json['lng'].toString()) : null,
      status: json['status'] ?? 'Actif',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'name': name,
    'city': city,
    'phone': phone,
    'address': address,
    'credit_limit': creditLimit,
    'balance': balance,
    'price_tier': priceTier,
    'ice': ice,
    'lat': lat,
    'lng': lng,
    'status': status,
  };

  /// Check if customer exceeded credit limit
  bool get isCreditOverLimit => creditLimit > 0 && balance >= creditLimit;
  double get availableCredit => creditLimit > balance ? creditLimit - balance : 0.0;
}

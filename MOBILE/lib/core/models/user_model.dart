class UserModel {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String? primaryRole;
  final String? commercialCode;
  final WarehouseInfo? warehouse;
  final CompanyInfo? company;
  final List<String> permissions;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.primaryRole,
    this.commercialCode,
    this.warehouse,
    this.company,
    this.permissions = const [],
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      avatar: json['avatar'],
      primaryRole: json['primary_role'],
      commercialCode: json['commercial_code'],
      warehouse: json['warehouse'] != null ? WarehouseInfo.fromJson(json['warehouse']) : null,
      company: json['company'] != null ? CompanyInfo.fromJson(json['company']) : null,
      permissions: (json['permissions'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phone': phone,
    'avatar': avatar,
    'primary_role': primaryRole,
    'commercial_code': commercialCode,
    'warehouse': warehouse?.toJson(),
    'company': company?.toJson(),
    'permissions': permissions,
  };

  bool get isCommercial => primaryRole == 'commercial' || primaryRole == 'pre_seller';
  bool get isDriver => primaryRole == 'delivery';
  bool get isWarehouse => primaryRole == 'warehouse' || primaryRole == 'preparation';
  bool get isAdmin => primaryRole == 'admin' || primaryRole == 'superadmin';
}

class WarehouseInfo {
  final int id;
  final String code;
  final String name;
  final String city;

  WarehouseInfo({
    required this.id,
    required this.code,
    required this.name,
    required this.city,
  });

  factory WarehouseInfo.fromJson(Map<String, dynamic> json) {
    return WarehouseInfo(
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      city: json['city'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'name': name,
    'city': city,
  };
}

class CompanyInfo {
  final int id;
  final String code;
  final String name;
  final String? brandName;
  final String? ice;

  CompanyInfo({
    required this.id,
    required this.code,
    required this.name,
    this.brandName,
    this.ice,
  });

  factory CompanyInfo.fromJson(Map<String, dynamic> json) {
    return CompanyInfo(
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      brandName: json['brand_name'],
      ice: json['ice'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'name': name,
    'brand_name': brandName,
    'ice': ice,
  };
}

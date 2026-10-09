class VisitModel {
  final int? id;
  final String ref;
  final int customerId;
  final String? customerName;
  final String? customerCity;
  final String visitDate;
  final String visitType; // 'prospection', 'commande', 'recouvrement', 'routine'
  final String status; // 'planifiee', 'en_cours', 'realisee', 'annulee'
  final String? notes;
  final double amountCollected;
  final String? checkinAt;
  final String? checkoutAt;
  final String? clientGeneratedUuid;
  final bool isOffline;

  VisitModel({
    this.id,
    required this.ref,
    required this.customerId,
    this.customerName,
    this.customerCity,
    required this.visitDate,
    this.visitType = 'commande',
    this.status = 'planifiee',
    this.notes,
    this.amountCollected = 0.0,
    this.checkinAt,
    this.checkoutAt,
    this.clientGeneratedUuid,
    this.isOffline = false,
  });

  factory VisitModel.fromJson(Map<String, dynamic> json) {
    return VisitModel(
      id: json['id'],
      ref: json['ref'] ?? '',
      customerId: json['customer_id'] ?? 0,
      customerName: json['customer']?['name'] ?? json['customer_name'],
      customerCity: json['customer']?['city'] ?? json['customer_city'],
      visitDate: json['visit_date'] ?? '',
      visitType: json['visit_type'] ?? 'commande',
      status: json['status'] ?? 'planifiee',
      notes: json['notes'],
      amountCollected: (json['amount_collected'] != null)
          ? double.tryParse(json['amount_collected'].toString()) ?? 0.0
          : 0.0,
      checkinAt: json['checkin_at'],
      checkoutAt: json['checkout_at'],
      clientGeneratedUuid: json['client_generated_uuid'],
      isOffline: json['is_offline'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'ref': ref,
    'customer_id': customerId,
    'customer_name': customerName,
    'customer_city': customerCity,
    'visit_date': visitDate,
    'visit_type': visitType,
    'status': status,
    'notes': notes,
    'amount_collected': amountCollected,
    'checkin_at': checkinAt,
    'checkout_at': checkoutAt,
    'client_generated_uuid': clientGeneratedUuid,
    'is_offline': isOffline,
  };
}

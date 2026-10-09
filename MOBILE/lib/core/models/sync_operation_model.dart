class SyncOperationModel {
  final String uuid;
  final String type; // 'create_order', 'record_payment', 'create_visit', 'record_delivery_stop'
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  String status; // 'pending', 'synced', 'failed', 'duplicate'
  String? errorMessage;

  SyncOperationModel({
    required this.uuid,
    required this.type,
    required this.payload,
    required this.createdAt,
    this.status = 'pending',
    this.errorMessage,
  });

  factory SyncOperationModel.fromJson(Map<String, dynamic> json) {
    return SyncOperationModel(
      uuid: json['client_generated_uuid'] ?? json['uuid'] ?? '',
      type: json['type'] ?? '',
      payload: Map<String, dynamic>.from(json['payload'] ?? {}),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      status: json['status'] ?? 'pending',
      errorMessage: json['error_message'],
    );
  }

  Map<String, dynamic> toJson() => {
    'client_generated_uuid': uuid,
    'type': type,
    'payload': payload,
    'created_at': createdAt.toIso8601String(),
    'status': status,
    'error_message': errorMessage,
  };

  /// Format ready to be sent to Laravel POST /api/v1/sync
  Map<String, dynamic> toApiPayload() => {
    'client_generated_uuid': uuid,
    'type': type,
    'payload': payload,
  };
}

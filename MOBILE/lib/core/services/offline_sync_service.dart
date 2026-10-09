import 'package:uuid/uuid.dart';
import '../api/api_client.dart';
import '../api/api_constants.dart';
import '../models/sync_operation_model.dart';
import 'storage_service.dart';

class SyncResult {
  final int totalCount;
  final int syncedCount;
  final int failedCount;
  final List<String> messages;

  SyncResult({
    required this.totalCount,
    required this.syncedCount,
    required this.failedCount,
    required this.messages,
  });
}

class OfflineSyncService {
  static final _uuidGenerator = const Uuid();

  /// Retrieve all pending operations
  static List<SyncOperationModel> getPendingOperations() {
    return StorageService.getSyncQueue().where((op) => op.status == 'pending').toList();
  }

  /// Add new operation to the offline sync queue
  static Future<String> enqueueOperation({
    required String type,
    required Map<String, dynamic> payload,
  }) async {
    final uuid = _uuidGenerator.v4();
    final op = SyncOperationModel(
      uuid: uuid,
      type: type,
      payload: payload,
      createdAt: DateTime.now(),
      status: 'pending',
    );

    final currentQueue = StorageService.getSyncQueue();
    currentQueue.add(op);
    await StorageService.saveSyncQueue(currentQueue);
    return uuid;
  }

  /// Helpers for specific operations
  static Future<String> enqueueOrder(Map<String, dynamic> orderPayload) async {
    return await enqueueOperation(
      type: 'create_order',
      payload: orderPayload,
    );
  }

  static Future<String> enqueueVisit(Map<String, dynamic> visitPayload) async {
    return await enqueueOperation(
      type: 'create_visit',
      payload: visitPayload,
    );
  }

  static Future<String> enqueuePayment(Map<String, dynamic> paymentPayload) async {
    return await enqueueOperation(
      type: 'record_payment',
      payload: paymentPayload,
    );
  }

  static Future<String> enqueueDeliveryStop(Map<String, dynamic> stopPayload) async {
    return await enqueueOperation(
      type: 'record_delivery_stop',
      payload: stopPayload,
    );
  }

  /// Synchronize all pending operations with the Laravel backend
  static Future<SyncResult> syncAllPending() async {
    final allQueue = StorageService.getSyncQueue();
    final pendingOps = allQueue.where((op) => op.status == 'pending').toList();

    if (pendingOps.isEmpty) {
      return SyncResult(
        totalCount: 0,
        syncedCount: 0,
        failedCount: 0,
        messages: ['Aucune opération en attente.'],
      );
    }

    final payload = {
      'operations': pendingOps.map((op) => op.toApiPayload()).toList(),
    };

    final response = await ApiClient.post(ApiConstants.sync, body: payload);

    int synced = 0;
    int failed = 0;
    final List<String> messages = [];

    if (response.success && response.data is Map && response.data['results'] is List) {
      final List results = response.data['results'];
      final Map<String, dynamic> resultsByUuid = {
        for (var res in results) (res['client_generated_uuid'] ?? ''): res
      };

      for (var op in allQueue) {
        if (op.status == 'pending' && resultsByUuid.containsKey(op.uuid)) {
          final res = resultsByUuid[op.uuid];
          final status = res['status'] ?? 'unknown';

          if (status == 'applied' || status == 'duplicate') {
            op.status = 'synced';
            synced++;
            messages.add('${op.type} (${op.uuid.substring(0, 8)}): Synchronisé.');
          } else {
            op.status = 'failed';
            op.errorMessage = res['message'] ?? 'Erreur lors de la synchronisation';
            failed++;
            messages.add('${op.type} (${op.uuid.substring(0, 8)}): Échec - ${op.errorMessage}');
          }
        }
      }

      await StorageService.saveSyncQueue(allQueue);
    } else {
      failed = pendingOps.length;
      messages.add(response.message ?? 'Erreur lors de la communication avec le serveur.');
    }

    return SyncResult(
      totalCount: pendingOps.length,
      syncedCount: synced,
      failedCount: failed,
      messages: messages,
    );
  }

  /// Clear synced operations to free up storage
  static Future<void> clearSyncedHistory() async {
    final allQueue = StorageService.getSyncQueue();
    final onlyPending = allQueue.where((op) => op.status == 'pending').toList();
    await StorageService.saveSyncQueue(onlyPending);
  }
}

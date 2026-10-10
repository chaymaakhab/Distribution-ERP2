import 'package:flutter/foundation.dart';
import '../core/models/sync_operation_model.dart';
import '../core/services/offline_sync_service.dart';
import '../core/services/storage_service.dart';

class SyncProvider extends ChangeNotifier {
  bool _isSyncing = false;
  SyncResult? _lastSyncResult;
  List<SyncOperationModel> _queue = [];

  bool get isSyncing => _isSyncing;
  SyncResult? get lastSyncResult => _lastSyncResult;
  List<SyncOperationModel> get queue => _queue;
  int get pendingCount => _queue.where((o) => o.status == 'pending').length;

  SyncProvider() {
    loadQueue();
  }

  void loadQueue() {
    _queue = StorageService.getSyncQueue();
    notifyListeners();
  }

  Future<void> syncNow() async {
    if (_isSyncing) return;

    _isSyncing = true;
    notifyListeners();

    try {
      _lastSyncResult = await OfflineSyncService.syncAllPending();
    } catch (_) {}

    _queue = StorageService.getSyncQueue();
    _isSyncing = false;
    notifyListeners();
  }

  Future<void> clearSynced() async {
    await OfflineSyncService.clearSyncedHistory();
    loadQueue();
  }
}

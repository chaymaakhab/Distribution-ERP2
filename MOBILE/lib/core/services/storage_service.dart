import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../models/sync_operation_model.dart';

class StorageService {
  static const String _keyToken = 'erp_auth_token';
  static const String _keyUser = 'erp_auth_user';
  static const String _keyBaseUrl = 'erp_base_url';
  static const String _keySyncQueue = 'erp_sync_queue';
  static const String _keyCustomersCache = 'erp_cache_customers';
  static const String _keyProductsCache = 'erp_cache_products';
  static const String _keyOrdersCache = 'erp_cache_orders';
  static const String _keyVisitsCache = 'erp_cache_visits';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // Token
  static Future<void> saveToken(String token) async {
    await init();
    await _prefs!.setString(_keyToken, token);
  }

  static String? getToken() {
    return _prefs?.getString(_keyToken);
  }

  static Future<void> clearToken() async {
    await init();
    await _prefs!.remove(_keyToken);
  }

  // User
  static Future<void> saveUser(UserModel user) async {
    await init();
    await _prefs!.setString(_keyUser, jsonEncode(user.toJson()));
  }

  static UserModel? getUser() {
    final str = _prefs?.getString(_keyUser);
    if (str == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(str));
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearUser() async {
    await init();
    await _prefs!.remove(_keyUser);
  }

  // Base URL
  static Future<void> saveBaseUrl(String url) async {
    await init();
    await _prefs!.setString(_keyBaseUrl, url);
  }

  static String? getBaseUrl() {
    return _prefs?.getString(_keyBaseUrl);
  }

  // Sync Queue
  static Future<void> saveSyncQueue(List<SyncOperationModel> list) async {
    await init();
    final jsonList = list.map((op) => op.toJson()).toList();
    await _prefs!.setString(_keySyncQueue, jsonEncode(jsonList));
  }

  static List<SyncOperationModel> getSyncQueue() {
    final str = _prefs?.getString(_keySyncQueue);
    if (str == null) return [];
    try {
      final List decoded = jsonDecode(str);
      return decoded.map((item) => SyncOperationModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  // Generic Cache
  static Future<void> setCacheList(String key, List<Map<String, dynamic>> items) async {
    await init();
    await _prefs!.setString(key, jsonEncode(items));
  }

  static List<Map<String, dynamic>> getCacheList(String key) {
    final str = _prefs?.getString(key);
    if (str == null) return [];
    try {
      final List decoded = jsonDecode(str);
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> clearAll() async {
    await init();
    await _prefs!.clear();
  }
}

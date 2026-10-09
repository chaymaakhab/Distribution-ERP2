import 'package:flutter/foundation.dart';
import '../core/api/api_client.dart';
import '../core/api/api_constants.dart';
import '../core/models/user_model.dart';
import '../core/services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null && _user != null;

  AuthProvider() {
    _loadPersistedUser();
  }

  void _loadPersistedUser() {
    _token = StorageService.getToken();
    _user = StorageService.getUser();
    notifyListeners();
  }

  Future<bool> login(String identifier, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await ApiClient.post(
      ApiConstants.login,
      body: {
        'identifier': identifier.trim(),
        'password': password,
      },
    );

    _isLoading = false;

    if (response.success && response.data is Map) {
      final token = response.data['token'];
      final userData = response.data['user'];

      if (token != null && userData != null) {
        _token = token.toString();
        _user = UserModel.fromJson(userData);

        await StorageService.saveToken(_token!);
        await StorageService.saveUser(_user!);

        notifyListeners();
        return true;
      }
    }

    _errorMessage = response.message ?? 'Échec de connexion.';
    notifyListeners();
    return false;
  }

  /// Demo Quick Login for testing in offline or local demo mode
  Future<bool> loginAsDemo(String role) async {
    String email = 'commercial@hercules-erp.ma';
    if (role == 'delivery') email = 'livreur@hercules-erp.ma';
    if (role == 'pre_seller') email = 'prevendeur@hercules-erp.ma';
    if (role == 'admin') email = 'admin@hercules-erp.ma';

    return await login(email, 'password');
  }

  Future<void> logout() async {
    if (_token != null) {
      try {
        await ApiClient.post(ApiConstants.logout);
      } catch (_) {}
    }

    _user = null;
    _token = null;
    await StorageService.clearToken();
    await StorageService.clearUser();
    notifyListeners();
  }

  Future<void> refreshProfile() async {
    if (!isAuthenticated) return;
    final response = await ApiClient.get(ApiConstants.me);
    if (response.success && response.data is Map && response.data['user'] != null) {
      _user = UserModel.fromJson(response.data['user']);
      await StorageService.saveUser(_user!);
      notifyListeners();
    }
  }
}

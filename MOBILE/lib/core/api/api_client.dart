import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../api/api_constants.dart';
import '../services/storage_service.dart';

class ApiResponse {
  final bool success;
  final int statusCode;
  final dynamic data;
  final String? message;

  ApiResponse({
    required this.success,
    required this.statusCode,
    this.data,
    this.message,
  });
}

class ApiClient {
  static String get baseUrl {
    final customUrl = StorageService.getBaseUrl();
    if (customUrl != null && customUrl.trim().isNotEmpty) {
      return customUrl.trim();
    }
    return ApiConstants.defaultBaseUrl;
  }

  static Map<String, String> _headers({String? token}) {
    final authToken = token ?? StorageService.getToken();
    final headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (authToken != null && authToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    return headers;
  }

  static Uri _uri(String endpoint, [Map<String, dynamic>? queryParams]) {
    String cleanBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    String cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    String url = '$cleanBase$cleanEndpoint';

    if (queryParams != null && queryParams.isNotEmpty) {
      final queryStr = queryParams.entries
          .where((e) => e.value != null)
          .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value.toString())}')
          .join('&');
      if (queryStr.isNotEmpty) {
        url = '$url?$queryStr';
      }
    }
    return Uri.parse(url);
  }

  // GET
  static Future<ApiResponse> get(String endpoint, {Map<String, dynamic>? queryParams}) async {
    try {
      final response = await http
          .get(_uri(endpoint, queryParams), headers: _headers())
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // POST
  static Future<ApiResponse> post(String endpoint, {dynamic body}) async {
    try {
      final response = await http
          .post(
            _uri(endpoint),
            headers: _headers(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 15));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // PUT
  static Future<ApiResponse> put(String endpoint, {dynamic body}) async {
    try {
      final response = await http
          .put(
            _uri(endpoint),
            headers: _headers(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // PATCH
  static Future<ApiResponse> patch(String endpoint, {dynamic body}) async {
    try {
      final response = await http
          .patch(
            _uri(endpoint),
            headers: _headers(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  // DELETE
  static Future<ApiResponse> delete(String endpoint) async {
    try {
      final response = await http
          .delete(_uri(endpoint), headers: _headers())
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  static ApiResponse _handleResponse(http.Response response) {
    dynamic decoded;
    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      decoded = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return ApiResponse(
        success: true,
        statusCode: response.statusCode,
        data: decoded,
      );
    } else {
      String msg = 'Erreur ${response.statusCode}';
      if (decoded is Map && decoded['message'] != null) {
        msg = decoded['message'].toString();
      }
      return ApiResponse(
        success: false,
        statusCode: response.statusCode,
        message: msg,
        data: decoded,
      );
    }
  }

  static ApiResponse _handleError(dynamic error) {
    String msg = 'Impossible de contacter le serveur';
    if (error is SocketException) {
      msg = 'Pas de connexion réseau ou serveur inaccessible.';
    } else if (error.toString().contains('TimeoutException')) {
      msg = 'Délai d\'attente dépassé (Serveur trop lent).';
    } else {
      msg = error.toString();
    }

    return ApiResponse(
      success: false,
      statusCode: 0,
      message: msg,
    );
  }
}

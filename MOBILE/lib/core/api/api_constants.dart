class ApiConstants {
  // Default URL: Android Emulator uses 10.0.2.2, Physical device uses LAN IP e.g. 192.168.1.X, Web/Desktop uses localhost
  static const String defaultBaseUrl = 'http://10.0.2.2:8000/api/v1';
  static const String defaultLocalhostUrl = 'http://localhost:8000/api/v1';

  // Auth endpoints
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String switchRole = '/auth/switch-role';

  // Resources
  static const String customers = '/customers';
  static const String products = '/products';
  static const String orders = '/orders';
  static const String visits = '/visits';
  static const String deliveryTours = '/delivery-tours';
  static const String deliverySlips = '/delivery-slips';
  static const String payments = '/payments';
  static const String stocks = '/stocks';
  static const String warehouses = '/warehouses';
  static const String notifications = '/notifications';

  // Offline Synchronization Endpoint
  static const String sync = '/sync';
}

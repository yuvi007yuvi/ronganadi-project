import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  final _storage = const FlutterSecureStorage();

  bool _isAuthenticated = false;
  bool _isLoading = true;
  String? _userId;
  String? _userRole;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get userId => _userId;
  String? get userRole => _userRole;

  AuthProvider() {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      _isAuthenticated = true;
      // You can decode JWT here to get user info, or fetch profile
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String loginId, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.post('/auth.php', {
        'action': 'login',
        'login_id': loginId,
        'password': password,
      });

      if (response != null && response['token'] != null) {
        await _storage.write(key: 'jwt_token', value: response['token']);
        _isAuthenticated = true;
        _userId = response['user']['id'].toString();
        _userRole = response['user']['role'];
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    _isAuthenticated = false;
    _userId = null;
    _userRole = null;
    notifyListeners();
  }
}

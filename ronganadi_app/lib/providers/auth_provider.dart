import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? assignedArea;
  final String? designation;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.assignedArea,
    this.designation,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'].toString(),
    name: json['name'] ?? '',
    email: json['email'] ?? '',
    role: json['role'] ?? '',
    phone: json['phone'],
    assignedArea: json['assignedArea'],
    designation: json['designation'],
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'email': email, 'role': role,
    'phone': phone, 'assignedArea': assignedArea, 'designation': designation,
  };

  bool get isAdmin => role == 'admin';
  bool get isSurveyor => role == 'surveyor';
  String get initials => name.split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();
}

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _loading = true;
  String? _error;

  UserModel? get user => _user;
  bool get loading => _loading;
  bool get isLoggedIn => _user != null;
  String? get error => _error;

  AuthProvider() {
    _loadFromPrefs();
  }

  Future<void> _loadFromPrefs() async {
    await ApiService.init();
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('current_user');
    if (userJson != null) {
      _user = UserModel.fromJson(jsonDecode(userJson));
    }
    _loading = false;
    notifyListeners();
  }

  Future<String?> login(String email, String password, String role) async {
    _error = null;
    _loading = true;
    notifyListeners();

    final res = await ApiService.post('auth.php', {
      'email': email,
      'password': password,
      'role': role,
    });

    _loading = false;

    if (res['success'] == true) {
      final data = res['data'];
      await ApiService.saveToken(data['token']);
      _user = UserModel.fromJson(data['user']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('current_user', jsonEncode(_user!.toJson()));
      notifyListeners();
      return null; // success
    }

    _error = res['message'] ?? 'Login failed';
    notifyListeners();
    return _error;
  }

  Future<void> logout() async {
    await ApiService.clearToken();
    _user = null;
    notifyListeners();
  }
}

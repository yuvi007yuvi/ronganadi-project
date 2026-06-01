import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class CitizenModel {
  final String id;
  final String fullName;
  final String mobile;
  final String address;
  final String area;
  final String voterIdNumber;
  final String panNumber;
  final String casteCategory;
  final String occupation;
  final List<String> schemesAvailed;
  final List<String> schemesNotAvailed;
  final String remarks;
  final String surveyorName;
  final String submittedAt;

  CitizenModel({
    required this.id,
    required this.fullName,
    required this.mobile,
    required this.address,
    required this.area,
    required this.voterIdNumber,
    this.panNumber = '',
    required this.casteCategory,
    required this.occupation,
    this.schemesAvailed = const [],
    this.schemesNotAvailed = const [],
    this.remarks = '',
    this.surveyorName = '',
    required this.submittedAt,
  });

  factory CitizenModel.fromJson(Map<String, dynamic> json) => CitizenModel(
    id: json['id'].toString(),
    fullName: json['full_name'] ?? json['fullName'] ?? '',
    mobile: json['mobile'] ?? '',
    address: json['address'] ?? '',
    area: json['area'] ?? '',
    voterIdNumber: json['voter_id_number'] ?? json['voterIdNumber'] ?? '',
    panNumber: json['pan_number'] ?? json['panNumber'] ?? '',
    casteCategory: json['caste_category'] ?? json['casteCategory'] ?? '',
    occupation: json['occupation'] ?? '',
    schemesAvailed: (json['schemes_availed'] ?? json['schemesAvailed'] ?? []).cast<String>(),
    schemesNotAvailed: (json['schemes_not_availed'] ?? json['schemesNotAvailed'] ?? []).cast<String>(),
    remarks: json['remarks'] ?? '',
    surveyorName: json['surveyor_name'] ?? json['surveyorName'] ?? '',
    submittedAt: json['submitted_at'] ?? json['submittedAt'] ?? '',
  );
}

class SurveyorModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String assignedArea;
  final String status;
  final String createdAt;

  SurveyorModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone = '',
    this.assignedArea = '',
    this.status = 'active',
    this.createdAt = '',
  });

  factory SurveyorModel.fromJson(Map<String, dynamic> json) => SurveyorModel(
    id: json['id'].toString(),
    name: json['name'] ?? '',
    email: json['email'] ?? '',
    phone: json['phone'] ?? '',
    assignedArea: json['assigned_area'] ?? json['assignedArea'] ?? '',
    status: json['status'] ?? 'active',
    createdAt: json['created_at'] ?? '',
  );

  String get initials => name.split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();
  bool get isActive => status == 'active';
}

class AnnouncementModel {
  final String id;
  final String title;
  final String content;
  final String type;
  final String priority;
  final bool published;
  final String publishedAt;

  AnnouncementModel({
    required this.id,
    required this.title,
    required this.content,
    this.type = 'announcement',
    this.priority = 'medium',
    this.published = true,
    this.publishedAt = '',
  });

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) => AnnouncementModel(
    id: json['id'].toString(),
    title: json['title'] ?? '',
    content: json['content'] ?? '',
    type: json['type'] ?? 'announcement',
    priority: json['priority'] ?? 'medium',
    published: (json['published'] == 1 || json['published'] == true),
    publishedAt: json['published_at'] ?? '',
  );
}

class DataProvider extends ChangeNotifier {
  List<CitizenModel> _citizens = [];
  List<SurveyorModel> _surveyors = [];
  List<AnnouncementModel> _announcements = [];
  bool _loading = false;
  String? _error;

  List<CitizenModel> get citizens => _citizens;
  List<SurveyorModel> get surveyors => _surveyors;
  List<AnnouncementModel> get announcements => _announcements;
  bool get loading => _loading;
  String? get error => _error;

  // ─── Citizens ───
  Future<void> fetchCitizens({String? surveyorId}) async {
    _loading = true; notifyListeners();
    final params = surveyorId != null ? {'surveyor_id': surveyorId} : null;
    final res = await ApiService.get('citizens.php', params: params);
    if (res['success'] == true) {
      final data = res['data'];
      _citizens = (data['records'] as List).map((j) => CitizenModel.fromJson(j)).toList();
    }
    _loading = false; notifyListeners();
  }

  Future<String?> addCitizen(Map<String, dynamic> data) async {
    final res = await ApiService.post('citizens.php', data);
    if (res['success'] == true) {
      await fetchCitizens();
      return null;
    }
    return res['message'] ?? 'Error adding record';
  }

  Future<String?> updateCitizen(String id, Map<String, dynamic> data) async {
    final res = await ApiService.put('citizens.php', data, params: {'id': id});
    if (res['success'] == true) {
      await fetchCitizens();
      return null;
    }
    return res['message'] ?? 'Error updating record';
  }

  Future<void> deleteCitizen(String id) async {
    await ApiService.delete('citizens.php', params: {'id': id});
    _citizens.removeWhere((c) => c.id == id);
    notifyListeners();
  }

  // ─── Surveyors ───
  Future<void> fetchSurveyors() async {
    _loading = true; notifyListeners();
    final res = await ApiService.get('surveyors.php');
    if (res['success'] == true) {
      _surveyors = (res['data'] as List).map((j) => SurveyorModel.fromJson(j)).toList();
    }
    _loading = false; notifyListeners();
  }

  Future<String?> addSurveyor(Map<String, dynamic> data) async {
    final res = await ApiService.post('surveyors.php', data);
    if (res['success'] == true) { await fetchSurveyors(); return null; }
    return res['message'] ?? 'Error';
  }

  Future<void> toggleSurveyorStatus(String id, String currentStatus) async {
    final newStatus = currentStatus == 'active' ? 'inactive' : 'active';
    await ApiService.put('surveyors.php', {'status': newStatus}, params: {'id': id});
    await fetchSurveyors();
  }

  Future<void> deleteSurveyor(String id) async {
    await ApiService.delete('surveyors.php', params: {'id': id});
    _surveyors.removeWhere((s) => s.id == id);
    notifyListeners();
  }

  // ─── Announcements ───
  Future<void> fetchAnnouncements() async {
    final res = await ApiService.get('announcements.php');
    if (res['success'] == true) {
      _announcements = (res['data'] as List).map((j) => AnnouncementModel.fromJson(j)).toList();
    }
    notifyListeners();
  }

  // ─── Stats ───
  Map<String, dynamic> getStats() {
    final activeSurveyors = _surveyors.where((s) => s.isActive).length;
    final beneficiaries = _citizens.where((c) => c.schemesAvailed.isNotEmpty).length;
    final areaWise = <String, int>{};
    for (final c in _citizens) {
      areaWise[c.area] = (areaWise[c.area] ?? 0) + 1;
    }
    return {
      'totalCitizens': _citizens.length,
      'activeSurveyors': activeSurveyors,
      'schemeBeneficiaries': beneficiaries,
      'areaWise': areaWise,
    };
  }
}

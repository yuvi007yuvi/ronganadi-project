class Grievance {
  final int id;
  final String title;
  final String description;
  final String status;
  final String? createdAt;

  Grievance({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.createdAt,
  });

  factory Grievance.fromJson(Map<String, dynamic> json) {
    return Grievance(
      id: json['id'] is String ? int.parse(json['id']) : json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      createdAt: json['created_at'],
    );
  }
}

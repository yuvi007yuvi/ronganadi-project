class Survey {
  final int id;
  final String title;
  final String description;
  final String? createdAt;

  Survey({
    required this.id,
    required this.title,
    required this.description,
    this.createdAt,
  });

  factory Survey.fromJson(Map<String, dynamic> json) {
    return Survey(
      id: json['id'] is String ? int.parse(json['id']) : json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      createdAt: json['created_at'],
    );
  }
}

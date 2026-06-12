class Announcement {
  final int id;
  final String title;
  final String content;
  final String type;
  final String priority;
  final String? publishedAt;
  final String? expiresAt;

  Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.priority,
    this.publishedAt,
    this.expiresAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] is String ? int.parse(json['id']) : json['id'],
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      type: json['type'] ?? 'announcement',
      priority: json['priority'] ?? 'medium',
      publishedAt: json['published_at'],
      expiresAt: json['expires_at'],
    );
  }
}

import 'package:flutter/material.dart';
import '../models/survey.dart';
import '../services/api_service.dart';

class SurveyScreen extends StatefulWidget {
  const SurveyScreen({super.key});

  @override
  State<SurveyScreen> createState() => _SurveyScreenState();
}

class _SurveyScreenState extends State<SurveyScreen> {
  final ApiService _api = ApiService();
  List<Survey> _surveys = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSurveys();
  }

  Future<void> _fetchSurveys() async {
    try {
      final data = await _api.get('/surveys.php');
      if (data is List) {
        setState(() {
          _surveys = data.map((e) => Survey.fromJson(e)).toList();
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Surveys & Feedback')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchSurveys,
              child: _surveys.isEmpty
                  ? ListView(children: const [Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No active surveys currently.')))])
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _surveys.length,
                      itemBuilder: (context, index) {
                        final s = _surveys[index];
                        return Card(
                          child: ListTile(
                            title: Text(s.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(s.description),
                            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              // Open a detailed Survey View or Webview here
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Survey details coming soon!')));
                            },
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

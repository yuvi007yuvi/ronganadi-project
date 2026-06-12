import 'package:flutter/material.dart';
import '../models/grievance.dart';
import '../services/api_service.dart';

class GrievanceScreen extends StatefulWidget {
  const GrievanceScreen({super.key});

  @override
  State<GrievanceScreen> createState() => _GrievanceScreenState();
}

class _GrievanceScreenState extends State<GrievanceScreen> {
  final ApiService _api = ApiService();
  List<Grievance> _grievances = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchGrievances();
  }

  Future<void> _fetchGrievances() async {
    try {
      final data = await _api.get('/complaints.php');
      if (data is List) {
        setState(() {
          _grievances = data.map((e) => Grievance.fromJson(e)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showAddGrievanceDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit New Grievance'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: 'Subject', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
              maxLines: 4,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final scaffoldMessenger = ScaffoldMessenger.of(this.context);
              Navigator.pop(context);
              // Call API to create grievance
              try {
                await _api.post('/complaints.php', {
                  'action': 'create',
                  'title': titleController.text,
                  'description': descController.text,
                });
                _fetchGrievances(); // Refresh list
              } catch (e) {
                if (mounted) scaffoldMessenger.showSnackBar(SnackBar(content: Text('Error: $e')));
              }
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Grievances')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchGrievances,
              child: _grievances.isEmpty
                  ? ListView(children: const [Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No grievances found.')))])
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _grievances.length,
                      itemBuilder: (context, index) {
                        final g = _grievances[index];
                        return Card(
                          child: ListTile(
                            title: Text(g.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${g.status.toUpperCase()} • ${g.createdAt ?? ''}\n${g.description}'),
                            isThreeLine: true,
                          ),
                        );
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddGrievanceDialog,
        backgroundColor: Colors.deepOrange,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}

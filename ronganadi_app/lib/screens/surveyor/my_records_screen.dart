import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';
import 'add_survey_screen.dart';

class MyRecordsScreen extends StatefulWidget {
  const MyRecordsScreen({super.key});
  @override
  State<MyRecordsScreen> createState() => _MyRecordsScreenState();
}

class _MyRecordsScreenState extends State<MyRecordsScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final data = context.watch<DataProvider>();
    final filtered = data.citizens.where((c) =>
      _search.isEmpty ||
      c.fullName.toLowerCase().contains(_search.toLowerCase()) ||
      c.mobile.contains(_search) ||
      c.area.toLowerCase().contains(_search.toLowerCase())
    ).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('My Records', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          Text('${data.citizens.length} total', style: const TextStyle(fontSize: 12, color: AppColors.gray500, fontWeight: FontWeight.w400)),
        ]),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddSurveyScreen())),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('New Survey', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Search by name, mobile, area...',
                prefixIcon: const Icon(Icons.search, color: AppColors.gray400),
                suffixIcon: _search.isNotEmpty
                  ? IconButton(icon: const Icon(Icons.clear, color: AppColors.gray400), onPressed: () => setState(() => _search = ''))
                  : null,
                filled: true, fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gray200)),
              ),
            ),
          ),
          Expanded(
            child: filtered.isEmpty
              ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.assignment_outlined, size: 56, color: AppColors.gray300),
                  SizedBox(height: 12),
                  Text('No records found', style: TextStyle(color: AppColors.gray500, fontSize: 15)),
                ]))
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                  itemCount: filtered.length,
                  itemBuilder: (ctx, i) {
                    final c = filtered[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primaryLight,
                          child: Text(c.fullName.isNotEmpty ? c.fullName[0].toUpperCase() : '?',
                            style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                        ),
                        title: Text(c.fullName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(c.mobile, style: const TextStyle(fontSize: 12)),
                          Text('${c.area} • ${c.casteCategory}', style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
                        ]),
                        trailing: PopupMenuButton(
                          icon: const Icon(Icons.more_vert, color: AppColors.gray400),
                          itemBuilder: (_) => [
                            const PopupMenuItem(value: 'edit', child: Row(children: [Icon(Icons.edit_outlined, size: 16), SizedBox(width: 8), Text('Edit')])),
                            const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_outline, size: 16, color: AppColors.danger), SizedBox(width: 8), Text('Delete', style: TextStyle(color: AppColors.danger))])),
                          ],
                          onSelected: (val) async {
                            if (val == 'edit') {
                              await Navigator.push(context, MaterialPageRoute(builder: (_) => AddSurveyScreen(editRecord: c)));
                            } else if (val == 'delete') {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (_) => AlertDialog(
                                  title: const Text('Delete Record'),
                                  content: Text('Delete ${c.fullName}\'s record?'),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                                    ElevatedButton(onPressed: () => Navigator.pop(context, true),
                                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                                      child: const Text('Delete')),
                                  ],
                                ),
                              );
                              if (confirm == true) await data.deleteCitizen(c.id);
                            }
                          },
                        ),
                        isThreeLine: true,
                      ),
                    );
                  },
                ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';

class AdvertisementsScreen extends StatelessWidget {
  const AdvertisementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final data = context.watch<DataProvider>();
    final anns = data.announcements;

    final typeIcon = {'announcement': '📣', 'news': '📰', 'event': '🎪', 'notice': '📋'};
    final priorityColor = {
      'high': AppColors.danger, 'medium': AppColors.warning, 'low': AppColors.success
    };

    return Scaffold(
      appBar: AppBar(title: const Text('Advertisements')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddSheet(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Post', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: anns.isEmpty
        ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.campaign_outlined, size: 56, color: AppColors.gray300),
            SizedBox(height: 12),
            Text('No announcements yet', style: TextStyle(color: AppColors.gray500)),
          ]))
        : ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            itemCount: anns.length,
            itemBuilder: (ctx, i) {
              final a = anns[i];
              final pColor = priorityColor[a.priority] ?? AppColors.primary;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border(left: BorderSide(color: a.published ? AppColors.primary : AppColors.gray300, width: 4)),
                  boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Text(typeIcon[a.type] ?? '📣', style: const TextStyle(fontSize: 20)),
                      const SizedBox(width: 8),
                      Expanded(child: Text(a.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: pColor.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
                        child: Text(a.priority, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: pColor)),
                      ),
                    ]),
                    const SizedBox(height: 8),
                    Text(a.content, style: const TextStyle(fontSize: 13, color: AppColors.gray600, height: 1.5)),
                    const SizedBox(height: 10),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text('📅 ${a.publishedAt}', style: const TextStyle(fontSize: 11, color: AppColors.gray400)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: a.published ? AppColors.successBg : AppColors.gray100,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(a.published ? 'Published' : 'Draft',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: a.published ? AppColors.success : AppColors.gray500)),
                      ),
                    ]),
                  ]),
                ),
              );
            },
          ),
    );
  }

  void _showAddSheet(BuildContext context) {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    String type = 'announcement';
    String priority = 'medium';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
          padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: SingleChildScrollView(child: Column(children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.gray200, borderRadius: BorderRadius.circular(2)), margin: const EdgeInsets.only(bottom: 20)),
            const Text('New Announcement', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),
            TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title *')),
            const SizedBox(height: 12),
            TextField(controller: contentCtrl, maxLines: 3, decoration: const InputDecoration(labelText: 'Content *', alignLabelWithHint: true)),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: DropdownButtonFormField<String>(
                value: type,
                decoration: const InputDecoration(labelText: 'Type'),
                items: ['announcement', 'news', 'event', 'notice'].map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) => setModalState(() => type = v ?? type),
              )),
              const SizedBox(width: 12),
              Expanded(child: DropdownButtonFormField<String>(
                value: priority,
                decoration: const InputDecoration(labelText: 'Priority'),
                items: ['high', 'medium', 'low'].map((p) => DropdownMenuItem(value: p, child: Text(p, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) => setModalState(() => priority = v ?? priority),
              )),
            ]),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 52,
              child: ElevatedButton(
                onPressed: () async {
                  if (titleCtrl.text.isEmpty || contentCtrl.text.isEmpty) return;
                  // Add via API
                  Navigator.pop(ctx);
                },
                child: const Text('Post Announcement'),
              ),
            ),
          ])),
        ),
      ),
    );
  }
}

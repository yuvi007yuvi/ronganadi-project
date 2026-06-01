import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';

class ManageSurveyorsScreen extends StatefulWidget {
  const ManageSurveyorsScreen({super.key});
  @override
  State<ManageSurveyorsScreen> createState() => _ManageSurveyorsScreenState();
}

class _ManageSurveyorsScreenState extends State<ManageSurveyorsScreen> {
  String _search = '';

  void _showAddSheet(BuildContext context, [SurveyorModel? existing]) {
    final nameCtrl = TextEditingController(text: existing?.name);
    final emailCtrl = TextEditingController(text: existing?.email);
    final passCtrl = TextEditingController();
    final phoneCtrl = TextEditingController(text: existing?.phone);
    String area = existing?.assignedArea ?? '';

    final areas = [
      'Ward 1 – North Ronganadi', 'Ward 2 – South Ronganadi', 'Ward 3 – East Ronganadi',
      'Ward 4 – West Ronganadi', 'Ward 5 – Central Market', 'Ward 6 – River Belt',
      'Ward 7 – Industrial Zone', 'Ward 8 – Old Town', 'Village – Ghilamara',
      'Village – Majuli Link Road', 'Block – Lakhimpur Sadar',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: SingleChildScrollView(
            child: Column(children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.gray200, borderRadius: BorderRadius.circular(2)), margin: const EdgeInsets.only(bottom: 20)),
              Text(existing == null ? 'Add Surveyor' : 'Edit Surveyor', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 20),
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Full Name *', prefixIcon: Icon(Icons.person_outline))),
              const SizedBox(height: 12),
              TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Mobile Number *', prefixIcon: Icon(Icons.phone_outlined))),
              const SizedBox(height: 12),
              TextField(controller: emailCtrl, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email Address *', prefixIcon: Icon(Icons.email_outlined))),
              const SizedBox(height: 12),
              TextField(controller: passCtrl, obscureText: true, decoration: InputDecoration(labelText: existing == null ? 'Password *' : 'New Password (optional)', prefixIcon: const Icon(Icons.lock_outline))),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: area.isEmpty ? null : area,
                decoration: const InputDecoration(labelText: 'Assigned Area *', prefixIcon: Icon(Icons.location_on_outlined)),
                items: areas.map((a) => DropdownMenuItem(value: a, child: Text(a, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) { setModalState(() => area = v ?? ''); },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity, height: 52,
                child: ElevatedButton(
                  onPressed: () async {
                    if (nameCtrl.text.isEmpty || emailCtrl.text.isEmpty || area.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all required fields')));
                      return;
                    }
                    final data = context.read<DataProvider>();
                    if (existing == null) {
                      await data.addSurveyor({'name': nameCtrl.text, 'email': emailCtrl.text, 'password': passCtrl.text, 'phone': phoneCtrl.text, 'assignedArea': area});
                    } else {
                      final updateData = {'name': nameCtrl.text, 'email': emailCtrl.text, 'phone': phoneCtrl.text, 'assignedArea': area};
                      if (passCtrl.text.isNotEmpty) updateData['password'] = passCtrl.text;
                      // update via API
                    }
                    if (ctx.mounted) Navigator.pop(ctx);
                  },
                  child: Text(existing == null ? 'Add Surveyor' : 'Save Changes'),
                ),
              ),
            ]),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<DataProvider>();
    final filtered = data.surveyors.where((s) =>
      _search.isEmpty ||
      s.name.toLowerCase().contains(_search.toLowerCase()) ||
      s.email.toLowerCase().contains(_search.toLowerCase())
    ).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Manage Surveyors')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddSheet(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.person_add_rounded, color: Colors.white),
        label: const Text('Add Surveyor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Search surveyors...',
                prefixIcon: const Icon(Icons.search, color: AppColors.gray400),
                filled: true, fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gray200)),
              ),
            ),
          ),
          Expanded(
            child: data.loading
              ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
              : filtered.isEmpty
                ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.people_outline, size: 56, color: AppColors.gray300),
                    SizedBox(height: 12),
                    Text('No surveyors found', style: TextStyle(color: AppColors.gray500, fontSize: 15)),
                  ]))
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final s = filtered[i];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          leading: CircleAvatar(
                            backgroundColor: s.isActive ? AppColors.primaryLight : AppColors.gray100,
                            child: Text(s.initials, style: TextStyle(color: s.isActive ? AppColors.primary : AppColors.gray400, fontWeight: FontWeight.w700, fontSize: 13)),
                          ),
                          title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(s.email, style: const TextStyle(fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(s.assignedArea, style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
                          ]),
                          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: s.isActive ? AppColors.successBg : AppColors.dangerBg,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(s.status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: s.isActive ? AppColors.success : AppColors.danger)),
                            ),
                            PopupMenuButton(
                              icon: const Icon(Icons.more_vert, color: AppColors.gray400),
                              itemBuilder: (_) => [
                                const PopupMenuItem(value: 'toggle', child: Text('Toggle Status')),
                                const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppColors.danger))),
                              ],
                              onSelected: (val) async {
                                if (val == 'toggle') {
                                  await data.toggleSurveyorStatus(s.id, s.status);
                                } else if (val == 'delete') {
                                  final confirm = await showDialog<bool>(
                                    context: context,
                                    builder: (_) => AlertDialog(
                                      title: const Text('Delete Surveyor'),
                                      content: Text('Delete ${s.name}? This cannot be undone.'),
                                      actions: [
                                        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                                        ElevatedButton(onPressed: () => Navigator.pop(context, true), style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger), child: const Text('Delete')),
                                      ],
                                    ),
                                  );
                                  if (confirm == true) await data.deleteSurveyor(s.id);
                                }
                              },
                            ),
                          ]),
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

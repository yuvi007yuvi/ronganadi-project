import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';

class ViewRecordsScreen extends StatefulWidget {
  const ViewRecordsScreen({super.key});
  @override
  State<ViewRecordsScreen> createState() => _ViewRecordsScreenState();
}

class _ViewRecordsScreenState extends State<ViewRecordsScreen> {
  String _search = '';

  void _showDetail(BuildContext context, CitizenModel c) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, controller) => Container(
          decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
          child: Column(
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.gray200, borderRadius: BorderRadius.circular(2)), margin: const EdgeInsets.symmetric(vertical: 12)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(children: [
                  const Text('Citizen Record', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const Spacer(),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                ]),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView(
                  controller: controller,
                  padding: const EdgeInsets.all(20),
                  children: [
                    _DetailSection('👤 Personal Information', [
                      _DetailRow('Full Name', c.fullName),
                      _DetailRow('Mobile', c.mobile),
                      _DetailRow('Area', c.area),
                      _DetailRow('Caste Category', c.casteCategory),
                      _DetailRow('Occupation', c.occupation),
                      _DetailRow('Voter ID', c.voterIdNumber),
                      if (c.panNumber.isNotEmpty) _DetailRow('PAN Card', '${c.panNumber.substring(0, 3)}•••${c.panNumber.substring(c.panNumber.length - 2)}'),
                      _DetailRow('Address', c.address),
                    ]),
                    const SizedBox(height: 16),
                    _DetailSection('✅ Schemes Availed (${c.schemesAvailed.length})', [
                      if (c.schemesAvailed.isEmpty)
                        const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Text('None recorded', style: TextStyle(color: AppColors.gray500, fontSize: 13)))
                      else
                        Wrap(spacing: 8, runSpacing: 6, children: c.schemesAvailed.map((id) => Chip(
                          label: Text(id, style: const TextStyle(fontSize: 11)),
                          backgroundColor: AppColors.primaryLight,
                          side: BorderSide.none,
                          padding: EdgeInsets.zero,
                        )).toList()),
                    ]),
                    const SizedBox(height: 16),
                    if (c.remarks.isNotEmpty)
                      _DetailSection('📝 Remarks', [
                        Text(c.remarks, style: const TextStyle(fontSize: 13, color: AppColors.gray700, height: 1.6)),
                      ]),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.gray50, borderRadius: BorderRadius.circular(12)),
                      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        Text('Surveyor: ${c.surveyorName}', style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
                        Text(c.submittedAt.length >= 10 ? c.submittedAt.substring(0, 10) : '', style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
                      ]),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

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
          const Text('All Records', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          Text('${filtered.length} records', style: const TextStyle(fontSize: 12, color: AppColors.gray500, fontWeight: FontWeight.w400)),
        ]),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Search name, mobile, area...',
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
                ? const Center(child: Text('No records found', style: TextStyle(color: AppColors.gray500)))
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final c = filtered[i];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          onTap: () => _showDetail(context, c),
                          leading: CircleAvatar(
                            backgroundColor: AppColors.primaryLight,
                            child: Text(c.fullName.isNotEmpty ? c.fullName[0].toUpperCase() : '?', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                          ),
                          title: Text(c.fullName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(c.mobile, style: const TextStyle(fontSize: 12)),
                            Text(c.area, style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
                          ]),
                          trailing: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: AppColors.successBg, borderRadius: BorderRadius.circular(10)),
                              child: Text('${c.schemesAvailed.length} schemes', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.success)),
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

class _DetailSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _DetailSection(this.title, this.children);

  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
    const SizedBox(height: 10),
    Container(
      decoration: BoxDecoration(color: AppColors.gray50, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.gray100)),
      padding: const EdgeInsets.all(14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    ),
  ]);
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SizedBox(width: 110, child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.gray500, fontWeight: FontWeight.w500))),
      Expanded(child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.gray800))),
    ]),
  );
}

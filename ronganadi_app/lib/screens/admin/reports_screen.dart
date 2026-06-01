import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final data = context.watch<DataProvider>();
    final stats = data.getStats();
    final areaWise = stats['areaWise'] as Map<String, int>;

    return Scaffold(
      appBar: AppBar(title: const Text('Reports & Analytics')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Summary
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('📊 Survey Summary', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                _SummaryRow('Total Citizens Surveyed', '${stats['totalCitizens']}'),
                _SummaryRow('Scheme Beneficiaries', '${stats['schemeBeneficiaries']}'),
                _SummaryRow('Non-Beneficiaries', '${(stats['totalCitizens'] as int) - (stats['schemeBeneficiaries'] as int)}'),
                _SummaryRow('Areas Covered', '${areaWise.length}'),
              ]),
            ),
          ),
          const SizedBox(height: 16),

          // Area-wise breakdown
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('🗺️ Area-wise Breakdown', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                ...[...areaWise.entries.toList()..sort((a, b) => b.value.compareTo(a.value))].map((e) {
                  final pct = data.citizens.isEmpty ? 0.0 : e.value / data.citizens.length;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        Expanded(child: Text(e.key, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis)),
                        Text('${e.value} (${(pct * 100).toStringAsFixed(1)}%)', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                      ]),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(value: pct, backgroundColor: AppColors.gray100, valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary), minHeight: 6),
                      ),
                    ]),
                  );
                }),
              ]),
            ),
          ),
          const SizedBox(height: 16),

          // Export buttons
          const Text('📥 Export Reports', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          _ExportCard(
            icon: Icons.table_chart_rounded,
            title: 'Excel Export',
            subtitle: 'All citizen records in spreadsheet format',
            color: AppColors.success,
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Excel export: Connect to live API to enable download'), backgroundColor: AppColors.success),
            ),
          ),
          const SizedBox(height: 10),
          _ExportCard(
            icon: Icons.picture_as_pdf_rounded,
            title: 'PDF Report',
            subtitle: 'Printable citizen survey report',
            color: AppColors.danger,
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('PDF export: Connect to live API to enable download'), backgroundColor: AppColors.danger),
            ),
          ),
          const SizedBox(height: 10),
          _ExportCard(
            icon: Icons.map_rounded,
            title: 'Area Summary PDF',
            subtitle: 'Area-wise count and percentage breakdown',
            color: AppColors.primary,
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Connect to live API to enable export')),
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow(this.label, this.value);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: const TextStyle(fontSize: 13, color: AppColors.gray600)),
      Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.gray900)),
    ]),
  );
}

class _ExportCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;
  const _ExportCard({required this.icon, required this.title, required this.subtitle, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      onTap: onTap,
      leading: Container(
        width: 44, height: 44,
        decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      trailing: Icon(Icons.download_rounded, color: color),
    ),
  );
}

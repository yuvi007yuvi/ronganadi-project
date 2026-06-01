import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/section_header.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final data = context.watch<DataProvider>();
    final stats = data.getStats();
    final recent = [...data.citizens]
      ..sort((a, b) => b.submittedAt.compareTo(a.submittedAt));
    final recentTop = recent.take(5).toList();

    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Dashboard', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          Text('Welcome, ${auth.user?.name.split(' ').first ?? ''}', style: const TextStyle(fontSize: 12, color: AppColors.gray500, fontWeight: FontWeight.w400)),
        ]),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: CircleAvatar(
              backgroundColor: AppColors.primary,
              radius: 18,
              child: Text(auth.user?.initials ?? 'A', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          await data.fetchCitizens();
          await data.fetchSurveyors();
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Stats
            GridView.count(
              crossAxisCount: 2, shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12, mainAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: [
                StatCard(label: 'Total Surveys', value: '${stats['totalCitizens']}', icon: Icons.assignment_rounded, color: AppColors.primary, bgColor: AppColors.primaryLight),
                StatCard(label: 'Active Surveyors', value: '${stats['activeSurveyors']}', icon: Icons.people_rounded, color: AppColors.info, bgColor: AppColors.infoBg),
                StatCard(label: 'Beneficiaries', value: '${stats['schemeBeneficiaries']}', icon: Icons.check_circle_rounded, color: AppColors.success, bgColor: AppColors.successBg),
                StatCard(label: 'Coverage Rate', value: stats['totalCitizens'] > 0 ? '${((stats['schemeBeneficiaries'] / stats['totalCitizens']) * 100).round()}%' : '0%', icon: Icons.trending_up_rounded, color: const Color(0xFF8B5CF6), bgColor: const Color(0xFFEDE9FE)),
              ],
            ),
            const SizedBox(height: 20),

            // Area-wise breakdown
            if ((stats['areaWise'] as Map).isNotEmpty) ...[
              const SectionHeader(title: 'Area-wise Survey Count', icon: Icons.map_rounded),
              const SizedBox(height: 10),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: ((stats['areaWise'] as Map<String, int>).entries.toList()
                      ..sort((a, b) => b.value.compareTo(a.value)))
                      .map<Widget>((entry) {
                    final e = entry;
                    final maxVal = (stats['areaWise'] as Map<String, int>).values.reduce((a, b) => a > b ? a : b);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          Expanded(child: Text(e.key, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis)),
                          Text('${e.value}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
                        ]),
                        const SizedBox(height: 4),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: e.value / maxVal,
                            backgroundColor: AppColors.gray100,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                            minHeight: 6,
                          ),
                        ),
                      ]),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 20),
            ],

            // Recent Surveys
            const SectionHeader(title: 'Recent Surveys', icon: Icons.history_rounded),
            const SizedBox(height: 10),
            Card(
              child: data.loading
                ? const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator(color: AppColors.primary)))
                : recentTop.isEmpty
                  ? const Padding(
                      padding: EdgeInsets.all(32),
                      child: Column(children: [
                        Icon(Icons.assignment_outlined, size: 40, color: AppColors.gray300),
                        SizedBox(height: 8),
                        Text('No surveys yet', style: TextStyle(color: AppColors.gray500)),
                      ]),
                    )
                  : Column(
                      children: recentTop.map((c) => ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primaryLight,
                          child: Text(c.fullName.isNotEmpty ? c.fullName[0].toUpperCase() : '?',
                            style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14)),
                        ),
                        title: Text(c.fullName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text(c.area, style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
                        trailing: Text(
                          c.submittedAt.length >= 10 ? c.submittedAt.substring(0, 10) : c.submittedAt,
                          style: const TextStyle(fontSize: 11, color: AppColors.gray400),
                        ),
                      )).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

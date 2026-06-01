import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';
import '../../widgets/stat_card.dart';
import 'add_survey_screen.dart';

class SurveyorDashboardScreen extends StatelessWidget {
  const SurveyorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final data = context.watch<DataProvider>();
    final user = auth.user!;
    final myRecords = data.citizens;
    final now = DateTime.now();
    final thisMonth = myRecords.where((r) {
      try {
        final d = DateTime.parse(r.submittedAt);
        return d.month == now.month && d.year == now.year;
      } catch(_) { return false; }
    }).length;
    final today = myRecords.where((r) {
      try {
        final d = DateTime.parse(r.submittedAt);
        return d.day == now.day && d.month == now.month && d.year == now.year;
      } catch(_) { return false; }
    }).length;
    final recent = myRecords.take(5).toList();
    final announcements = data.announcements.where((a) => a.published).take(3).toList();

    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('My Dashboard', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          Text('Area: ${user.assignedArea ?? '—'}', style: const TextStyle(fontSize: 11, color: AppColors.gray500, fontWeight: FontWeight.w400)),
        ]),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: CircleAvatar(
              backgroundColor: AppColors.primary,
              radius: 18,
              child: Text(user.initials, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddSurveyScreen())),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('New Survey', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async => data.fetchCitizens(surveyorId: user.id),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Welcome banner
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFFC2410C)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [const BoxShadow(color: AppColors.primaryGlow, blurRadius: 20, offset: Offset(0, 8))],
              ),
              padding: const EdgeInsets.all(20),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Welcome, ${user.name.split(' ').first}! 👋', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white, fontFamily: 'Poppins')),
                  const SizedBox(height: 4),
                  Text(
                    '${now.day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.month-1]} ${now.year}',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ])),
                const Icon(Icons.assignment_turned_in_rounded, color: Colors.white54, size: 40),
              ]),
            ),
            const SizedBox(height: 16),

            // Stats
            GridView.count(
              crossAxisCount: 3, shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10, mainAxisSpacing: 10,
              childAspectRatio: 1.1,
              children: [
                StatCard(label: 'Total', value: '${myRecords.length}', icon: Icons.assignment_rounded, color: AppColors.primary, bgColor: AppColors.primaryLight),
                StatCard(label: 'This Month', value: '$thisMonth', icon: Icons.calendar_month_rounded, color: AppColors.success, bgColor: AppColors.successBg),
                StatCard(label: 'Today', value: '$today', icon: Icons.today_rounded, color: AppColors.info, bgColor: AppColors.infoBg),
              ],
            ),
            const SizedBox(height: 20),

            // Recent records
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('Recent Surveys', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              TextButton(onPressed: () {}, child: const Text('View All', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600))),
            ]),
            const SizedBox(height: 8),
            Card(
              child: recent.isEmpty
                ? const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No surveys yet', style: TextStyle(color: AppColors.gray500))))
                : Column(children: recent.map((r) => ListTile(
                    leading: CircleAvatar(backgroundColor: AppColors.primaryLight, child: Text(r.fullName.isNotEmpty ? r.fullName[0].toUpperCase() : '?', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700))),
                    title: Text(r.fullName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: Text(r.area, style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
                    trailing: Text(r.submittedAt.length >= 10 ? r.submittedAt.substring(0, 10) : '', style: const TextStyle(fontSize: 11, color: AppColors.gray400)),
                  )).toList()),
            ),
            const SizedBox(height: 20),

            // Announcements
            if (announcements.isNotEmpty) ...[
              const Text('Announcements', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              ...announcements.map((a) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border(left: const BorderSide(color: AppColors.primary, width: 3)),
                  boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 8)],
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(a.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(a.content.length > 80 ? '${a.content.substring(0, 80)}...' : a.content, style: const TextStyle(fontSize: 12, color: AppColors.gray600)),
                ]),
              )),
            ],
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}

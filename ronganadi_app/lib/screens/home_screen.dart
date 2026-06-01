import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../core/theme.dart';
import 'admin/admin_dashboard_screen.dart';
import 'admin/view_records_screen.dart';
import 'admin/reports_screen.dart';
import 'admin/advertisements_screen.dart';
import 'surveyor/surveyor_dashboard_screen.dart';
import 'surveyor/add_survey_screen.dart';
import 'surveyor/my_records_screen.dart';
import 'communication_screen.dart';
import 'awareness_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadData());
  }

  Future<void> _loadData() async {
    final auth = context.read<AuthProvider>();
    final data = context.read<DataProvider>();
    if (auth.user?.isAdmin == true) {
      await data.fetchCitizens();
    } else {
      await data.fetchCitizens(surveyorId: auth.user?.id);
    }
    await data.fetchAnnouncements();
  }

  List<_NavItem> _getNavItems(bool isAdmin) => isAdmin
    ? [
        _NavItem(Icons.dashboard_rounded, 'Dashboard', AdminDashboardScreen()),
        _NavItem(Icons.assignment_rounded, 'Records', ViewRecordsScreen()),
        _NavItem(Icons.bar_chart_rounded, 'Reports', ReportsScreen()),
        _NavItem(Icons.more_horiz_rounded, 'More', _AdminMoreScreen()),
      ]
    : [
        _NavItem(Icons.dashboard_rounded, 'Dashboard', SurveyorDashboardScreen()),
        _NavItem(Icons.add_circle_rounded, 'New Survey', const AddSurveyScreen()),
        _NavItem(Icons.assignment_rounded, 'My Records', MyRecordsScreen()),
        _NavItem(Icons.phone_rounded, 'Contacts', CommunicationScreen()),
        _NavItem(Icons.book_rounded, 'Schemes', AwarenessScreen()),
      ];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isAdmin = auth.user?.isAdmin ?? false;
    final navItems = _getNavItems(isAdmin);

    if (_selectedIndex >= navItems.length) {
      setState(() => _selectedIndex = 0);
    }

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: navItems.map((item) => item.screen).toList(),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Color(0x14000000), blurRadius: 20, offset: Offset(0, -4))],
        ),
        child: SafeArea(
          child: NavigationBar(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (i) => setState(() => _selectedIndex = i),
            backgroundColor: Colors.white,
            elevation: 0,
            height: 64,
            labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
            indicatorColor: AppColors.primaryLight,
            destinations: navItems.map((item) => NavigationDestination(
              icon: Icon(item.icon, color: AppColors.gray400),
              selectedIcon: Icon(item.icon, color: AppColors.primary),
              label: item.label,
            )).toList(),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final Widget screen;
  _NavItem(this.icon, this.label, this.screen);
}

// More screen for admin extras
class _AdminMoreScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('More'), elevation: 0),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _MoreTile(Icons.campaign_rounded, 'Advertisements', AppColors.primary, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => AdvertisementsScreen()));
          }),
          _MoreTile(Icons.phone_rounded, 'Communication', AppColors.info, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => CommunicationScreen()));
          }),
          _MoreTile(Icons.book_rounded, 'Gov. Awareness', AppColors.success, () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => AwarenessScreen()));
          }),
          const Divider(height: 32),
          _MoreTile(Icons.logout_rounded, 'Sign Out', AppColors.danger, () async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (_) => AlertDialog(
                title: const Text('Sign Out'),
                content: const Text('Are you sure you want to sign out?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                    child: const Text('Sign Out'),
                  ),
                ],
              ),
            );
            if (confirm == true && context.mounted) {
              await context.read<AuthProvider>().logout();
              if (context.mounted) Navigator.pushReplacementNamed(context, '/login');
            }
          }),
        ],
      ),
    );
  }
}

class _MoreTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _MoreTile(this.icon, this.label, this.color, this.onTap);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Container(
          width: 42, height: 42,
          decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.gray400),
        onTap: onTap,
      ),
    );
  }
}

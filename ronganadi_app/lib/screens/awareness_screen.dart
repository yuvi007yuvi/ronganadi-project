import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../core/theme.dart';

class AwarenessScreen extends StatefulWidget {
  const AwarenessScreen({super.key});
  @override
  State<AwarenessScreen> createState() => _AwarenessScreenState();
}

class _AwarenessScreenState extends State<AwarenessScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  String _search = '';
  String _category = '';

  final Map<String, Color> _catColors = {
    'Agriculture': const Color(0xFF10B981), 'Housing': const Color(0xFF3B82F6),
    'Health': const Color(0xFFEF4444), 'Employment': const Color(0xFFF59E0B),
    'Energy': const Color(0xFF8B5CF6), 'Finance': const Color(0xFF06B6D4),
    'Food': const Color(0xFFF97316), 'Education': const Color(0xFFEC4899),
    'Insurance': const Color(0xFF6366F1), 'Pension': const Color(0xFF64748B),
    'Water': const Color(0xFF0EA5E9), 'Social Welfare': const Color(0xFFE11D48),
    'Women Empowerment': const Color(0xFFD946EF), 'Rural Development': const Color(0xFF84CC16),
  };

  final List<Map<String, String>> _central = const [
    {'id': 'cs1', 'name': 'PM Kisan Samman Nidhi', 'desc': '₹6,000/year income support to farmers in three installments.', 'category': 'Agriculture'},
    {'id': 'cs2', 'name': 'PM Awas Yojana (Gramin)', 'desc': 'Housing assistance for rural poor below poverty line.', 'category': 'Housing'},
    {'id': 'cs4', 'name': 'Ayushman Bharat PM-JAY', 'desc': '₹5 lakh health coverage per family per year.', 'category': 'Health'},
    {'id': 'cs5', 'name': 'MGNREGA', 'desc': '100 days guaranteed wage employment per household per year.', 'category': 'Employment'},
    {'id': 'cs6', 'name': 'PM Ujjwala Yojana', 'desc': 'Free LPG connection to BPL households for clean cooking fuel.', 'category': 'Energy'},
    {'id': 'cs7', 'name': 'PM Jan Dhan Yojana', 'desc': 'Zero-balance bank account with accident insurance cover.', 'category': 'Finance'},
    {'id': 'cs8', 'name': 'PM Fasal Bima Yojana', 'desc': 'Low-premium crop insurance for farmers.', 'category': 'Agriculture'},
    {'id': 'cs9', 'name': 'PM Mudra Yojana', 'desc': 'Micro loans up to ₹10 lakh for small businesses.', 'category': 'Finance'},
    {'id': 'cs10', 'name': 'Sukanya Samriddhi Yojana', 'desc': 'High-interest savings scheme for girl child education/marriage.', 'category': 'Education'},
    {'id': 'cs11', 'name': 'PM Jeevan Jyoti Bima', 'desc': '₹2 lakh life cover at just ₹330/year premium.', 'category': 'Insurance'},
    {'id': 'cs12', 'name': 'PM Suraksha Bima', 'desc': '₹2 lakh accident cover at ₹12/year premium.', 'category': 'Insurance'},
    {'id': 'cs13', 'name': 'Atal Pension Yojana', 'desc': 'Guaranteed pension of ₹1000–5000/month after age 60.', 'category': 'Pension'},
    {'id': 'cs17', 'name': 'Jal Jeevan Mission', 'desc': 'Safe piped drinking water to every rural household.', 'category': 'Water'},
  ];

  final List<Map<String, String>> _assam = const [
    {'id': 'as1', 'name': 'Orunodoi Scheme', 'desc': 'Monthly financial support to women-led families.', 'category': 'Social Welfare'},
    {'id': 'as2', 'name': 'Mukhyamantri Mahila Udyamita', 'desc': 'Support for women entrepreneurs in Assam.', 'category': 'Women Empowerment'},
    {'id': 'as5', 'name': 'Chief Minister SGUY', 'desc': 'Holistic rural development and employment scheme.', 'category': 'Rural Development'},
    {'id': 'as6', 'name': 'Pragyan Bharati', 'desc': 'Free textbooks and bicycles for school students.', 'category': 'Education'},
    {'id': 'as7', 'name': 'SVAYEM', 'desc': 'Self-employment loans for youth of Assam.', 'category': 'Employment'},
    {'id': 'as10', 'name': 'Snehasparsha Pension', 'desc': 'Social pension for aged, widows and differently abled.', 'category': 'Pension'},
  ];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _tabCtrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  List<Map<String, String>> get _currentList {
    List<Map<String, String>> list = _tabCtrl.index == 0 ? [..._central, ..._assam] : _tabCtrl.index == 1 ? _central : _assam;
    return list.where((s) =>
      (_search.isEmpty || s['name']!.toLowerCase().contains(_search.toLowerCase()) || s['desc']!.toLowerCase().contains(_search.toLowerCase())) &&
      (_category.isEmpty || s['category'] == _category)
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    final data = context.watch<DataProvider>();
    final publishedAnn = data.announcements.where((a) => a.published).toList();
    final categories = ['Agriculture', 'Health', 'Housing', 'Employment', 'Finance', 'Education', 'Insurance', 'Social Welfare', 'Energy', 'Women Empowerment'];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gov. Awareness'),
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.gray400,
          labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          tabs: const [Tab(text: 'All Schemes'), Tab(text: '🇮🇳 Central'), Tab(text: '🌿 Assam')],
        ),
      ),
      body: Column(
        children: [
          // Announcements carousel
          if (publishedAnn.isNotEmpty)
            Container(
              height: 56,
              color: AppColors.primaryLight,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: publishedAnn.length,
                itemBuilder: (ctx, i) => Center(
                  child: Container(
                    margin: const EdgeInsets.only(right: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Text('📢', style: TextStyle(fontSize: 14)),
                      const SizedBox(width: 6),
                      Text(publishedAnn[i].title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryDark)),
                    ]),
                  ),
                ),
              ),
            ),

          // Search + Filter
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              Expanded(child: TextField(
                onChanged: (v) => setState(() => _search = v),
                decoration: InputDecoration(
                  hintText: 'Search schemes...',
                  prefixIcon: const Icon(Icons.search, color: AppColors.gray400, size: 20),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  filled: true, fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.gray200)),
                ),
              )),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.gray200), borderRadius: BorderRadius.circular(10)),
                child: DropdownButtonHideUnderline(child: DropdownButton<String>(
                  value: _category.isEmpty ? null : _category,
                  hint: const Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text('Category', style: TextStyle(fontSize: 12, color: AppColors.gray400))),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  borderRadius: BorderRadius.circular(12),
                  items: [DropdownMenuItem(value: '', child: const Text('All', style: TextStyle(fontSize: 13))),
                    ...categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13))))],
                  onChanged: (v) => setState(() => _category = v ?? ''),
                )),
              ),
            ]),
          ),

          Expanded(child: _currentList.isEmpty
            ? const Center(child: Text('No schemes found', style: TextStyle(color: AppColors.gray500)))
            : ListView.builder(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
                itemCount: _currentList.length,
                itemBuilder: (ctx, i) {
                  final s = _currentList[i];
                  final color = _catColors[s['category']] ?? AppColors.primary;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border(top: BorderSide(color: color, width: 3)),
                      boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8)],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          Expanded(child: Text(s['name']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
                            child: Text(s['category']!, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
                          ),
                        ]),
                        const SizedBox(height: 6),
                        Text(s['desc']!, style: const TextStyle(fontSize: 12, color: AppColors.gray600, height: 1.5)),
                        const SizedBox(height: 6),
                        Text(s['id']!.startsWith('cs') ? '🇮🇳 Central Government Scheme' : '🌿 Assam State Scheme',
                          style: const TextStyle(fontSize: 10, color: AppColors.gray400, fontWeight: FontWeight.w500)),
                      ]),
                    ),
                  );
                },
              )),
        ],
      ),
    );
  }
}

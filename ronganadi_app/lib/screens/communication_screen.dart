import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/theme.dart';

class _Contact {
  final String name, role, department, phone, email, area, hours;
  final bool isEmergency;
  const _Contact({required this.name, required this.role, required this.department, required this.phone, required this.email, required this.area, required this.hours, this.isEmergency = false});
}

const _contacts = [
  _Contact(name: 'Rajiv Borah', role: 'District Coordinator', department: 'Office of the District Commissioner', phone: '9435000001', email: 'coordinator@ronganadi.gov.in', area: 'DC Office, Lakhimpur', hours: 'Mon–Fri, 10AM–5PM'),
  _Contact(name: 'Survey Control Room', role: 'Help Desk', department: 'Ronganadi Survey Operations', phone: '9435000002', email: 'helpdesk@ronganadi.gov.in', area: 'Block Development Office', hours: 'Mon–Sat, 9AM–6PM'),
  _Contact(name: 'Dr. Pranjal Gogoi', role: 'Technical Support', department: 'IT & Data Management Cell', phone: '9435000003', email: 'tech@ronganadi.gov.in', area: 'District Information Center', hours: 'Mon–Fri, 9AM–5PM'),
  _Contact(name: 'Social Welfare Officer', role: 'Scheme Beneficiary Support', department: 'Social Welfare Department', phone: '9435000004', email: 'welfare@ronganadi.gov.in', area: 'Social Welfare Office, Lakhimpur', hours: 'Mon–Fri, 10AM–4PM'),
  _Contact(name: 'Panchayat Coordinator', role: 'Gram Panchayat Liaison', department: 'Panchayati Raj Department', phone: '9435000005', email: 'panchayat@ronganadi.gov.in', area: 'Block Office, Ghilamara', hours: 'Mon–Sat, 9AM–5PM'),
];

class CommunicationScreen extends StatelessWidget {
  const CommunicationScreen({super.key});

  Future<void> _call(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Future<void> _email(String email) async {
    final uri = Uri.parse('mailto:$email');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Communication')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Emergency
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.dangerBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.danger.withOpacity(0.3)),
            ),
            child: Row(children: [
              const Text('🚨', style: TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Citizen Grievance Helpline', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.danger, fontSize: 14)),
                const Text('Toll-free • 24/7 available', style: TextStyle(fontSize: 12, color: AppColors.gray600)),
              ])),
              ElevatedButton.icon(
                onPressed: () => _call('18000001234'),
                icon: const Icon(Icons.phone_rounded, size: 14),
                label: const Text('Call', style: TextStyle(fontWeight: FontWeight.w600)),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10)),
              ),
            ]),
          ),
          const SizedBox(height: 16),

          const Text('📞 Directory', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),

          ..._contacts.map((c) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))],
            ),
            child: Column(children: [
              ListTile(
                contentPadding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                leading: CircleAvatar(
                  backgroundColor: AppColors.primaryLight,
                  child: Text(
                    c.name.split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase(),
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                ),
                title: Text(c.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(c.role, style: const TextStyle(fontSize: 12, color: AppColors.gray600)),
                  const SizedBox(height: 2),
                  Text(c.department, style: const TextStyle(fontSize: 11, color: AppColors.gray400)),
                ]),
                isThreeLine: true,
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.location_on_outlined, size: 12, color: AppColors.gray400),
                    const SizedBox(width: 4),
                    Expanded(child: Text(c.area, style: const TextStyle(fontSize: 11, color: AppColors.gray500))),
                  ]),
                  const SizedBox(height: 2),
                  Row(children: [
                    const Icon(Icons.access_time_rounded, size: 12, color: AppColors.gray400),
                    const SizedBox(width: 4),
                    Text(c.hours, style: const TextStyle(fontSize: 11, color: AppColors.gray500)),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(child: OutlinedButton.icon(
                      onPressed: () => _call(c.phone),
                      icon: const Icon(Icons.phone_rounded, size: 14),
                      label: Text(c.phone, style: const TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(foregroundColor: AppColors.primary, side: const BorderSide(color: AppColors.primary), padding: const EdgeInsets.symmetric(vertical: 8)),
                    )),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      onPressed: () => _email(c.email),
                      icon: const Icon(Icons.email_outlined, size: 14),
                      label: const Text('Email', style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(foregroundColor: AppColors.info, side: const BorderSide(color: AppColors.info), padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8)),
                    ),
                  ]),
                ]),
              ),
            ]),
          )),
        ],
      ),
    );
  }
}

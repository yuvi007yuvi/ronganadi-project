import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: !auth.isAuthenticated 
      ? Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Please login to view your profile.'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Login'),
              )
            ],
          ),
        )
      : ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const CircleAvatar(
            radius: 50,
            backgroundColor: Colors.deepOrange,
            child: Icon(LucideIcons.user, size: 50, color: Colors.white),
          ),
          const SizedBox(height: 24),
          const Text('Role', style: TextStyle(color: Colors.grey, fontSize: 12)),
          Text(auth.userRole?.toUpperCase() ?? 'CITIZEN', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Divider(height: 32),
          const Text('User ID', style: TextStyle(color: Colors.grey, fontSize: 12)),
          Text(auth.userId ?? 'Unknown', style: const TextStyle(fontSize: 18)),
          const Divider(height: 32),
          ElevatedButton.icon(
            onPressed: () {
              auth.logout();
              context.go('/');
            },
            icon: const Icon(LucideIcons.logOut),
            label: const Text('Logout'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade50,
              foregroundColor: Colors.red,
            ),
          )
        ],
      ),
    );
  }
}

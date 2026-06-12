import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class RoleGuard extends StatelessWidget {
  final List<String> allowedRoles;
  final Widget child;

  const RoleGuard({
    super.key,
    required this.allowedRoles,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    
    // Fallback if role is null, assume 'citizen' or strict 'none'
    // Usually your backend returns lowercase roles like 'admin', 'citizen', 'surveyor'
    final String currentRole = (auth.userRole ?? 'citizen').toLowerCase();

    final bool isAuthorized = allowedRoles.map((r) => r.toLowerCase()).contains(currentRole);

    if (auth.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (!isAuthorized) {
      return Scaffold(
        appBar: AppBar(title: const Text('Access Denied')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.security, size: 80, color: Colors.grey),
              const SizedBox(height: 16),
              const Text(
                'You do not have permission to view this page.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  // If logged in but unauthorized, maybe they want to go home
                  Navigator.of(context).pop();
                },
                child: const Text('Go Back'),
              )
            ],
          ),
        ),
      );
    }

    // User is authorized, show the requested screen
    return child;
  }
}

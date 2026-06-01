import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../core/theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  String _role = 'admin';
  bool _showPass = false;
  bool _loading = false;
  String? _error;

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;
  late AnimationController _slideCtrl;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _slideCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero)
        .animate(CurvedAnimation(parent: _slideCtrl, curve: Curves.easeOutCubic));
    _fadeCtrl.forward();
    _slideCtrl.forward();
    // No auto-fill for production
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _slideCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    final auth = context.read<AuthProvider>();
    final err = await auth.login(_emailCtrl.text.trim(), _passCtrl.text, _role);
    if (mounted) setState(() { _loading = false; _error = err; });
    if (err == null && mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1A0A00), Color(0xFF7C2D12), Color(0xFFC2410C), Color(0xFFF97316)],
            stops: [0, 0.3, 0.6, 1],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: FadeTransition(
                opacity: _fadeAnim,
                child: SlideTransition(
                  position: _slideAnim,
                  child: Container(
                    constraints: const BoxConstraints(maxWidth: 420),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 40, offset: const Offset(0, 20))],
                    ),
                    padding: const EdgeInsets.all(32),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Logo
                          Column(children: [
                            Container(
                              width: 80, height: 80,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [BoxShadow(color: AppColors.primaryGlow, blurRadius: 20, offset: const Offset(0, 8))],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: Image.asset('assets/images/logo.jpeg', fit: BoxFit.cover),
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text('Ranganadibeta', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, fontFamily: 'Poppins', color: AppColors.gray900)),
                            const SizedBox(height: 4),
                            const Text('Digital Survey & Citizen Engagement', style: TextStyle(fontSize: 12, color: AppColors.gray500)),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                              decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(20)),
                              child: const Text('Government of Assam', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryDark)),
                            ),
                          ]),

                          const SizedBox(height: 28),

                          // Role Selector
                          Row(children: [
                            for (final r in ['admin', 'citizen'])
                              Expanded(
                                child: GestureDetector(
                                  onTap: () { setState(() { _role = r; }); },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    margin: EdgeInsets.symmetric(horizontal: 4),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    decoration: BoxDecoration(
                                      color: _role == r ? AppColors.primaryLight : AppColors.gray50,
                                      border: Border.all(color: _role == r ? AppColors.primary : AppColors.gray200, width: 2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                                      Text(r == 'admin' ? '🏛️' : '👤', style: const TextStyle(fontSize: 20)),
                                      const SizedBox(height: 4),
                                      Text(r == 'admin' ? 'Admin' : 'Citizen',
                                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13,
                                          color: _role == r ? AppColors.primary : AppColors.gray600)),
                                    ]),
                                  ),
                                ),
                              ),
                          ]),

                          const SizedBox(height: 24),

                          // Email/Mobile
                          TextFormField(
                            controller: _emailCtrl,
                            keyboardType: _role == 'citizen' ? TextInputType.phone : TextInputType.emailAddress,
                            decoration: InputDecoration(
                                labelText: _role == 'citizen' ? 'Mobile Number' : 'Email Address', 
                                prefixIcon: Icon(_role == 'citizen' ? Icons.phone_outlined : Icons.email_outlined)
                            ),
                            validator: (v) => (v == null || v.isEmpty) ? (_role == 'citizen' ? 'Enter your mobile number' : 'Enter your email') : null,
                          ),
                          const SizedBox(height: 14),

                          // Password
                          TextFormField(
                            controller: _passCtrl,
                            obscureText: !_showPass,
                            decoration: InputDecoration(
                              labelText: 'Password',
                              prefixIcon: const Icon(Icons.lock_outline),
                              suffixIcon: IconButton(
                                icon: Icon(_showPass ? Icons.visibility_off : Icons.visibility, color: AppColors.gray400),
                                onPressed: () => setState(() => _showPass = !_showPass),
                              ),
                            ),
                            validator: (v) => (v == null || v.isEmpty) ? 'Enter your password' : null,
                          ),

                          if (_error != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(color: AppColors.dangerBg, borderRadius: BorderRadius.circular(10)),
                              child: Row(children: [
                                const Icon(Icons.error_outline, color: AppColors.danger, size: 16),
                                const SizedBox(width: 8),
                                Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 13))),
                              ]),
                            ),
                          ],

                          const SizedBox(height: 20),

                          // Sign In Button
                          SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _loading ? null : _submit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                elevation: 4,
                                shadowColor: AppColors.primaryGlow,
                              ),
                              child: _loading
                                ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                                    Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                    SizedBox(width: 8),
                                    Icon(Icons.arrow_forward_rounded, size: 18),
                                  ]),
                            ),
                          ),

                          const SizedBox(height: 20),
                          
                          // Go to Sign Up
                          TextButton(
                            onPressed: () => Navigator.pushReplacementNamed(context, '/signup'),
                            child: const Text("Don't have an account? Sign Up", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

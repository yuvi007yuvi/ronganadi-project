import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';
import '../core/theme.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _mobileCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _areaCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  
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
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _slideCtrl.dispose();
    _nameCtrl.dispose();
    _mobileCtrl.dispose();
    _addressCtrl.dispose();
    _areaCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    
    try {
      final response = await http.post(
        Uri.parse('$kBaseUrl/signup.php'),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: jsonEncode({
          'full_name': _nameCtrl.text.trim(),
          'mobile': _mobileCtrl.text.trim(),
          'address': _addressCtrl.text.trim(),
          'area': _areaCtrl.text.trim(),
          'password': _passCtrl.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        if (data['token'] != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', data['token']);
          await prefs.setString('user', jsonEncode(data['user']));
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/citizen_home');
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Signup successful! Please login.')));
            Navigator.pushReplacementNamed(context, '/login');
          }
        }
      } else {
        setState(() => _error = data['error'] ?? 'Signup failed');
      }
    } catch (e) {
      setState(() => _error = 'Connection error. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
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
                      boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 40, offset: Offset(0, 20))],
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
                                boxShadow: const [BoxShadow(color: AppColors.primaryGlow, blurRadius: 20, offset: Offset(0, 8))],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: Image.asset('assets/images/logo.jpeg', fit: BoxFit.cover),
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text('Ranganadibeta', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, fontFamily: 'Poppins', color: AppColors.gray900)),
                            const SizedBox(height: 4),
                            const Text('Citizen Registration', style: TextStyle(fontSize: 14, color: AppColors.gray500, fontWeight: FontWeight.w600)),
                          ]),

                          const SizedBox(height: 28),

                          // Name
                          TextFormField(
                            controller: _nameCtrl,
                            keyboardType: TextInputType.name,
                            decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person_outline)),
                            validator: (v) => (v == null || v.isEmpty) ? 'Enter your full name' : null,
                          ),
                          const SizedBox(height: 14),

                          // Mobile
                          TextFormField(
                            controller: _mobileCtrl,
                            keyboardType: TextInputType.phone,
                            decoration: const InputDecoration(labelText: 'Mobile Number', prefixIcon: Icon(Icons.phone_outlined)),
                            validator: (v) => (v == null || v.isEmpty) ? 'Enter your mobile number' : null,
                          ),
                          const SizedBox(height: 14),

                          // Address
                          TextFormField(
                            controller: _addressCtrl,
                            keyboardType: TextInputType.text,
                            decoration: const InputDecoration(labelText: 'Address', prefixIcon: Icon(Icons.home_outlined)),
                            validator: (v) => (v == null || v.isEmpty) ? 'Enter your address' : null,
                          ),
                          const SizedBox(height: 14),
                          
                          // Area
                          TextFormField(
                            controller: _areaCtrl,
                            keyboardType: TextInputType.text,
                            decoration: const InputDecoration(labelText: 'Area / Ward / Village', prefixIcon: Icon(Icons.location_on_outlined)),
                            validator: (v) => (v == null || v.isEmpty) ? 'Enter your area' : null,
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
                            validator: (v) => (v == null || v.isEmpty) ? 'Create a password' : null,
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

                          // Sign Up Button
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
                                    Text('Sign Up', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                    SizedBox(width: 8),
                                    Icon(Icons.arrow_forward_rounded, size: 18),
                                  ]),
                            ),
                          ),

                          const SizedBox(height: 20),
                          
                          // Go to Login
                          TextButton(
                            onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                            child: const Text('Already have an account? Sign In', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
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

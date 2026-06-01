import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_provider.dart';
import '../../core/theme.dart';

const List<String> kCasteCategories = [
  'General', 'OBC (Other Backward Class)', 'SC (Scheduled Caste)',
  'ST (Scheduled Tribe)', 'EWS (Economically Weaker Section)',
];

const List<String> kOccupations = [
  'Farmer / Agriculture', 'Daily Wage Laborer', 'Government Employee',
  'Private Employee', 'Business / Self-Employed', 'Student', 'Homemaker',
  'Unemployed', 'Retired', 'Fisher', 'Artisan / Craftsman',
  'Healthcare Worker', 'Teacher / Educator', 'Driver / Transport', 'Other',
];

const List<String> kAreas = [
  'Ward 1 – North Ronganadi', 'Ward 2 – South Ronganadi', 'Ward 3 – East Ronganadi',
  'Ward 4 – West Ronganadi', 'Ward 5 – Central Market', 'Ward 6 – River Belt',
  'Ward 7 – Industrial Zone', 'Ward 8 – Old Town', 'Village – Ghilamara',
  'Village – Majuli Link Road', 'Block – Lakhimpur Sadar',
];

const List<Map<String, String>> kCentralSchemes = [
  {'id': 'cs1', 'name': 'PM Kisan Samman Nidhi'}, {'id': 'cs2', 'name': 'PM Awas Yojana (Gramin)'},
  {'id': 'cs3', 'name': 'PM Awas Yojana (Urban)'}, {'id': 'cs4', 'name': 'Ayushman Bharat PM-JAY'},
  {'id': 'cs5', 'name': 'MGNREGA'}, {'id': 'cs6', 'name': 'PM Ujjwala Yojana'},
  {'id': 'cs7', 'name': 'PM Jan Dhan Yojana'}, {'id': 'cs8', 'name': 'PM Fasal Bima Yojana'},
  {'id': 'cs9', 'name': 'PM Mudra Yojana'}, {'id': 'cs10', 'name': 'Sukanya Samriddhi Yojana'},
  {'id': 'cs11', 'name': 'PM Jeevan Jyoti Bima Yojana'}, {'id': 'cs12', 'name': 'PM Suraksha Bima Yojana'},
  {'id': 'cs13', 'name': 'Atal Pension Yojana'}, {'id': 'cs15', 'name': 'PM SVANidhi'},
  {'id': 'cs17', 'name': 'Jal Jeevan Mission'},
];

const List<Map<String, String>> kAssamSchemes = [
  {'id': 'as1', 'name': 'Orunodoi Scheme'}, {'id': 'as2', 'name': 'Mukhyamantri Mahila Udyamita Abhiyan'},
  {'id': 'as5', 'name': 'Chief Minister Samagra Gramya Unnayan Yojana'},
  {'id': 'as6', 'name': 'Pragyan Bharati'}, {'id': 'as7', 'name': 'SVAYEM'},
  {'id': 'as10', 'name': 'Snehasparsha – Social Pension'},
];

class AddSurveyScreen extends StatefulWidget {
  final CitizenModel? editRecord;
  const AddSurveyScreen({super.key, this.editRecord});
  @override
  State<AddSurveyScreen> createState() => _AddSurveyScreenState();
}

class _AddSurveyScreenState extends State<AddSurveyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _mobileCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _voterCtrl = TextEditingController();
  final _panCtrl = TextEditingController();
  final _remarksCtrl = TextEditingController();

  String _area = '';
  String _caste = '';
  String _occupation = '';
  List<String> _schemesAvailed = [];
  List<String> _schemesNotAvailed = [];
  bool _loading = false;
  bool _success = false;
  int _currentStep = 0;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _area = user?.assignedArea ?? '';
    if (widget.editRecord != null) {
      final r = widget.editRecord!;
      _nameCtrl.text = r.fullName;
      _mobileCtrl.text = r.mobile;
      _addressCtrl.text = r.address;
      _voterCtrl.text = r.voterIdNumber;
      _panCtrl.text = r.panNumber;
      _remarksCtrl.text = r.remarks;
      _area = r.area;
      _caste = r.casteCategory;
      _occupation = r.occupation;
      _schemesAvailed = [...r.schemesAvailed];
      _schemesNotAvailed = [...r.schemesNotAvailed];
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _mobileCtrl.dispose(); _addressCtrl.dispose();
    _voterCtrl.dispose(); _panCtrl.dispose(); _remarksCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final auth = context.read<AuthProvider>();
    final data = context.read<DataProvider>();

    final payload = {
      'fullName': _nameCtrl.text.trim(),
      'mobile': _mobileCtrl.text.trim(),
      'address': _addressCtrl.text.trim(),
      'area': _area,
      'voterIdNumber': _voterCtrl.text.trim(),
      'panNumber': _panCtrl.text.trim(),
      'casteCategory': _caste,
      'occupation': _occupation,
      'schemesAvailed': _schemesAvailed,
      'schemesNotAvailed': _schemesNotAvailed,
      'remarks': _remarksCtrl.text.trim(),
    };

    String? err;
    if (widget.editRecord != null) {
      err = await data.updateCitizen(widget.editRecord!.id, payload);
    } else {
      err = await data.addCitizen(payload);
    }

    setState(() => _loading = false);
    if (err == null) {
      setState(() => _success = true);
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err), backgroundColor: AppColors.danger));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_success) {
      return Scaffold(
        body: Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(width: 80, height: 80, decoration: BoxDecoration(color: AppColors.successBg, shape: BoxShape.circle), child: const Icon(Icons.check_rounded, color: AppColors.success, size: 44)),
            const SizedBox(height: 20),
            Text(widget.editRecord != null ? 'Record Updated!' : 'Survey Submitted!', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, fontFamily: 'Poppins')),
            const SizedBox(height: 8),
            const Text('Redirecting...', style: TextStyle(color: AppColors.gray500)),
          ]),
        ),
      );
    }

    final allSchemes = [...kCentralSchemes, ...kAssamSchemes];

    return Scaffold(
      appBar: AppBar(title: Text(widget.editRecord != null ? 'Edit Record' : 'New Survey')),
      body: Form(
        key: _formKey,
        child: Stepper(
          currentStep: _currentStep,
          onStepTapped: (s) => setState(() => _currentStep = s),
          onStepContinue: () {
            if (_currentStep < 3) setState(() => _currentStep++);
            else _submit();
          },
          onStepCancel: () {
            if (_currentStep > 0) setState(() => _currentStep--);
            else Navigator.pop(context);
          },
          controlsBuilder: (ctx, details) => Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Row(children: [
              Expanded(child: ElevatedButton(
                onPressed: _loading ? null : details.onStepContinue,
                child: _loading && _currentStep == 3
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(_currentStep == 3 ? (widget.editRecord != null ? 'Update' : 'Submit Survey') : 'Continue',
                      style: const TextStyle(fontWeight: FontWeight.w700)),
              )),
              const SizedBox(width: 10),
              TextButton(onPressed: details.onStepCancel, child: Text(_currentStep == 0 ? 'Cancel' : 'Back', style: const TextStyle(color: AppColors.gray500))),
            ]),
          ),
          steps: [
            // Step 1: Personal Info
            Step(
              title: const Text('Personal Info', style: TextStyle(fontWeight: FontWeight.w600)),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
              content: Column(children: [
                TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Full Name *', prefixIcon: Icon(Icons.person_outline)), validator: (v) => v!.isEmpty ? 'Required' : null),
                const SizedBox(height: 12),
                TextFormField(controller: _mobileCtrl, keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Mobile Number *', prefixIcon: Icon(Icons.phone_outlined)),
                  validator: (v) => (v!.isEmpty || v.length != 10) ? 'Enter valid 10-digit number' : null),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(value: _caste.isEmpty ? null : _caste, decoration: const InputDecoration(labelText: 'Caste Category *'),
                  items: kCasteCategories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13)))).toList(),
                  onChanged: (v) => setState(() => _caste = v!),
                  validator: (v) => (v == null || v.isEmpty) ? 'Required' : null),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(value: _occupation.isEmpty ? null : _occupation, decoration: const InputDecoration(labelText: 'Occupation *'),
                  items: kOccupations.map((o) => DropdownMenuItem(value: o, child: Text(o, style: const TextStyle(fontSize: 13)))).toList(),
                  onChanged: (v) => setState(() => _occupation = v!),
                  validator: (v) => (v == null || v.isEmpty) ? 'Required' : null),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(value: _area.isEmpty ? null : _area, decoration: const InputDecoration(labelText: 'Area / Ward *'),
                  items: kAreas.map((a) => DropdownMenuItem(value: a, child: Text(a, style: const TextStyle(fontSize: 13)))).toList(),
                  onChanged: (v) => setState(() => _area = v!),
                  validator: (v) => (v == null || v.isEmpty) ? 'Required' : null),
                const SizedBox(height: 12),
                TextFormField(controller: _addressCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Full Address *', prefixIcon: Icon(Icons.location_on_outlined), alignLabelWithHint: true), validator: (v) => v!.isEmpty ? 'Required' : null),
              ]),
            ),

            // Step 2: ID Documents
            Step(
              title: const Text('ID Documents', style: TextStyle(fontWeight: FontWeight.w600)),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
              content: Column(children: [
                TextFormField(controller: _voterCtrl, decoration: const InputDecoration(labelText: 'Voter ID Number *', prefixIcon: Icon(Icons.credit_card_outlined)),
                  textCapitalization: TextCapitalization.characters,
                  validator: (v) => v!.isEmpty ? 'Required' : null),
                const SizedBox(height: 12),
                TextFormField(controller: _panCtrl, decoration: const InputDecoration(labelText: 'PAN Card Number (optional)', prefixIcon: Icon(Icons.credit_card)), textCapitalization: TextCapitalization.characters),
              ]),
            ),

            // Step 3: Schemes
            Step(
              title: const Text('Government Schemes', style: TextStyle(fontWeight: FontWeight.w600)),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
              content: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('✅ Schemes Availed', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.success)),
                const SizedBox(height: 8),
                ...allSchemes.map((s) => CheckboxListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  activeColor: AppColors.success,
                  value: _schemesAvailed.contains(s['id']),
                  title: Text(s['name']!, style: const TextStyle(fontSize: 12)),
                  onChanged: (v) => setState(() {
                    if (v == true) { _schemesAvailed.add(s['id']!); _schemesNotAvailed.remove(s['id']); }
                    else _schemesAvailed.remove(s['id']!);
                  }),
                )),
                const Divider(height: 24),
                const Text('⏳ Schemes Not Availed', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.warning)),
                const SizedBox(height: 8),
                ...allSchemes.map((s) => CheckboxListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  activeColor: AppColors.warning,
                  value: _schemesNotAvailed.contains(s['id']),
                  title: Text(s['name']!, style: const TextStyle(fontSize: 12)),
                  onChanged: (v) => setState(() {
                    if (v == true) { _schemesNotAvailed.add(s['id']!); _schemesAvailed.remove(s['id']); }
                    else _schemesNotAvailed.remove(s['id']!);
                  }),
                )),
              ]),
            ),

            // Step 4: Remarks & Submit
            Step(
              title: const Text('Remarks & Submit', style: TextStyle(fontWeight: FontWeight.w600)),
              isActive: _currentStep >= 3,
              content: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                TextFormField(controller: _remarksCtrl, maxLines: 4, decoration: const InputDecoration(labelText: 'Additional Remarks (optional)', alignLabelWithHint: true, prefixIcon: Padding(padding: EdgeInsets.only(bottom: 60), child: Icon(Icons.note_outlined)))),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(12)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Summary', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                    const SizedBox(height: 8),
                    Text('Name: ${_nameCtrl.text}', style: const TextStyle(fontSize: 12)),
                    Text('Mobile: ${_mobileCtrl.text}', style: const TextStyle(fontSize: 12)),
                    Text('Area: $_area', style: const TextStyle(fontSize: 12)),
                    Text('Schemes Availed: ${_schemesAvailed.length}', style: const TextStyle(fontSize: 12)),
                  ]),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

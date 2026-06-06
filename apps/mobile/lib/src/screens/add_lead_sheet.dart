import 'package:flutter/material.dart';

import '../app.dart';
import '../app_state.dart';
import '../models.dart';
import '../theme.dart';

void showAddLeadSheet(BuildContext context) {
  showModalBottomSheet<void>(
    context: context,
    useSafeArea: true,
    isScrollControlled: true,
    backgroundColor: MitraColors.background,
    builder: (_) => const AddLeadSheet(),
  );
}

class AddLeadSheet extends StatefulWidget {
  const AddLeadSheet({super.key});

  @override
  State<AddLeadSheet> createState() => _AddLeadSheetState();
}

class _AddLeadSheetState extends State<AddLeadSheet> {
  final company = TextEditingController();
  final contact = TextEditingController();
  final email = TextEditingController();
  final phone = TextEditingController();
  final budget = TextEditingController(text: '0');
  final need = TextEditingController();
  final notes = TextEditingController();
  String serviceType = 'company_profile';
  bool submitting = false;

  @override
  void dispose() {
    company.dispose();
    contact.dispose();
    email.dispose();
    phone.dispose();
    budget.dispose();
    need.dispose();
    notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = StateScope.of(context);
    final services = state.services.isEmpty
        ? const [
            ServiceRule(
              type: 'company_profile',
              label: 'Company Profile',
              description: '',
              minimumBudget: 0,
            ),
          ]
        : state.services;
    if (!services.any((service) => service.type == serviceType)) {
      serviceType = services.first.type;
    }

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        shrinkWrap: true,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Submit lead baru',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: company,
            decoration: const InputDecoration(labelText: 'Nama perusahaan'),
          ),
          const SizedBox(height: 10),
          DropdownButtonFormField<String>(
            initialValue: serviceType,
            decoration: const InputDecoration(labelText: 'Layanan'),
            items: services
                .map(
                  (service) => DropdownMenuItem(
                    value: service.type,
                    child: Text(service.label),
                  ),
                )
                .toList(),
            onChanged: (value) {
              if (value != null) setState(() => serviceType = value);
            },
          ),
          const SizedBox(height: 10),
          TextField(
            controller: contact,
            decoration: const InputDecoration(labelText: 'Nama kontak'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: email,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Email kontak'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Telepon'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: budget,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Budget'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: need,
            minLines: 3,
            maxLines: 5,
            decoration: const InputDecoration(labelText: 'Ringkasan kebutuhan'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: notes,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Catatan tambahan'),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: submitting ? null : () => _submit(state),
            icon: submitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send),
            label: const Text('Kirim lead'),
          ),
        ],
      ),
    );
  }

  Future<void> _submit(AppState state) async {
    setState(() => submitting = true);
    try {
      await state.createLead({
        'companyName': company.text.trim(),
        'contactName': contact.text.trim(),
        'contactEmail': email.text.trim(),
        'contactPhone': phone.text.trim(),
        'serviceType': serviceType,
        'budget': int.tryParse(budget.text.trim()) ?? 0,
        'needSummary': need.text.trim(),
        'notes': notes.text.trim(),
      });
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(state.errorMessage ?? 'Lead gagal dikirim.')),
        );
      }
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }
}

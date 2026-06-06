import 'package:flutter/material.dart';

import '../app.dart';
import '../models.dart';
import '../theme.dart';
import '../utils.dart';
import '../widgets/status_badge.dart';

void showLeadDetailSheet({
  required BuildContext context,
  required Lead lead,
  required List<LeadEvent> events,
  required Future<void> Function(LeadStatus status, String note)
  onStatusChanged,
}) {
  showModalBottomSheet<void>(
    context: context,
    useSafeArea: true,
    isScrollControlled: true,
    backgroundColor: MitraColors.background,
    builder: (_) => LeadDetailSheet(
      lead: lead,
      events: events,
      onStatusChanged: onStatusChanged,
    ),
  );
}

class LeadDetailSheet extends StatelessWidget {
  const LeadDetailSheet({
    required this.lead,
    required this.events,
    required this.onStatusChanged,
    super.key,
  });

  final Lead lead;
  final List<LeadEvent> events;
  final Future<void> Function(LeadStatus status, String note) onStatusChanged;

  @override
  Widget build(BuildContext context) {
    final state = StateScope.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        Row(
          children: [
            const Expanded(
              child: Text(
                'Detail Prospek',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
              ),
            ),
            IconButton(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.close),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            StatusBadge(status: lead.status),
            const Spacer(),
            Icon(Icons.star, size: 18, color: statusColor(lead.status)),
            const SizedBox(width: 4),
            Text(
              'Score ${lead.qualificationScore}',
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Text(
          lead.companyName,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 4),
        Text(
          '${serviceLabel(lead.serviceType)} · ${rupiah(lead.budget)}',
          style: const TextStyle(
            color: MitraColors.mutedForeground,
            fontWeight: FontWeight.w700,
          ),
        ),
        if (state.role == UserRole.admin) ...[
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: () => _showStatusDialog(context),
            icon: const Icon(Icons.edit_note),
            label: const Text('Update status'),
          ),
        ],
        const SizedBox(height: 22),
        _Section(
          title: 'Kontak',
          children: [
            _Line(icon: Icons.person_outline, text: lead.contactName),
            _Line(icon: Icons.email_outlined, text: lead.contactEmail),
            if (lead.contactPhone.isNotEmpty)
              _Line(icon: Icons.phone_outlined, text: lead.contactPhone),
            if (lead.partnerName.isNotEmpty)
              _Line(icon: Icons.badge_outlined, text: lead.partnerName),
          ],
        ),
        _Section(
          title: 'Kebutuhan',
          children: [
            Text(
              lead.needSummary.isEmpty
                  ? 'Belum ada ringkasan.'
                  : lead.needSummary,
              style: const TextStyle(height: 1.45),
            ),
            if (lead.notes.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                lead.notes,
                style: const TextStyle(
                  color: MitraColors.mutedForeground,
                  height: 1.45,
                ),
              ),
            ],
            if (lead.qualificationNote.isNotEmpty) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: MitraColors.muted,
                  border: Border.all(color: MitraColors.border),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  lead.qualificationNote,
                  style: const TextStyle(height: 1.4),
                ),
              ),
            ],
          ],
        ),
        _Section(
          title: 'Jadwal meeting',
          children: [
            Text(
              lead.meetingMessage.isEmpty
                  ? 'Belum ada jadwal meeting.'
                  : lead.meetingMessage,
              style: const TextStyle(color: MitraColors.mutedForeground),
            ),
          ],
        ),
        _Section(
          title: 'Timeline',
          children: events.isEmpty
              ? const [
                  Text(
                    'Belum ada aktivitas.',
                    style: TextStyle(color: MitraColors.mutedForeground),
                  ),
                ]
              : events
                    .map(
                      (event) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              margin: const EdgeInsets.only(top: 5),
                              decoration: BoxDecoration(
                                color: statusColor(event.status),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    statusLabel(event.status),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Text(
                                    fullDate(event.createdAt),
                                    style: const TextStyle(
                                      color: MitraColors.mutedForeground,
                                      fontSize: 12,
                                    ),
                                  ),
                                  if (event.note.isNotEmpty)
                                    Text(
                                      event.note,
                                      style: const TextStyle(
                                        color: MitraColors.mutedForeground,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                    .toList(),
        ),
      ],
    );
  }

  void _showStatusDialog(BuildContext context) {
    var selected = lead.status;
    final note = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Update status lead'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<LeadStatus>(
                initialValue: selected,
                decoration: const InputDecoration(labelText: 'Status'),
                items: LeadStatus.values
                    .map(
                      (status) => DropdownMenuItem(
                        value: status,
                        child: Text(statusLabel(status)),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) selected = value;
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: note,
                minLines: 2,
                maxLines: 4,
                decoration: const InputDecoration(labelText: 'Catatan'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Batal'),
            ),
            FilledButton(
              onPressed: () async {
                await onStatusChanged(selected, note.text.trim());
                if (dialogContext.mounted) {
                  Navigator.of(dialogContext).pop();
                  Navigator.of(context).pop();
                }
              },
              child: const Text('Simpan'),
            ),
          ],
        );
      },
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              color: MitraColors.mutedForeground,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          ...children,
        ],
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: MitraColors.mutedForeground),
          const SizedBox(width: 9),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}

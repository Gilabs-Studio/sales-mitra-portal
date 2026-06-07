import 'package:flutter/material.dart';

import '../app.dart';
import '../models.dart';
import '../theme.dart';
import '../utils.dart';
import '../widgets/status_badge.dart';
import 'chat_screen.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = StateScope.of(context);
    return AnimatedBuilder(
      animation: state,
      builder: (context, _) {
        final user = state.user;
        return Scaffold(
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: state.refreshLeads,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 18, 20, 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  user != null && isAdminRole(user.role)
                                      ? 'Admin Leads'
                                      : 'Partner Leads',
                                  style: const TextStyle(
                                    fontSize: 30,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                              IconButton(
                                onPressed: state.refreshLeads,
                                icon: const Icon(Icons.more_vert),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            onChanged: state.setSearch,
                            decoration: InputDecoration(
                              hintText: 'Cari lead, kontak, atau telepon',
                              prefixIcon: const Icon(Icons.search),
                              filled: true,
                              fillColor: MitraColors.muted,
                              border: OutlineInputBorder(
                                borderSide: BorderSide.none,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderSide: BorderSide.none,
                                borderRadius: BorderRadius.circular(24),
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                _FilterChip(
                                  label: 'Semua',
                                  selected: state.selectedStatus.isEmpty,
                                  onTap: () => state.setStatus(''),
                                ),
                                for (final status in LeadStatus.values)
                                  _FilterChip(
                                    label: statusLabel(status),
                                    selected:
                                        state.selectedStatus == status.name,
                                    onTap: () => state.setStatus(status.name),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (state.isBusy && state.leads.isEmpty)
                    const SliverFillRemaining(
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (state.visibleLeads.isEmpty)
                    const SliverFillRemaining(
                      child: Center(
                        child: Text(
                          'Belum ada lead yang cocok.',
                          style: TextStyle(color: MitraColors.mutedForeground),
                        ),
                      ),
                    )
                  else
                    SliverList.separated(
                      itemCount: state.visibleLeads.length,
                      separatorBuilder: (_, _) => const Divider(
                        height: 1,
                        indent: 84,
                        color: MitraColors.muted,
                      ),
                      itemBuilder: (context, index) {
                        final lead = state.visibleLeads[index];
                        return LeadChatTile(lead: lead);
                      },
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 96)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class LeadChatTile extends StatelessWidget {
  const LeadChatTile({required this.lead, super.key});

  final Lead lead;

  @override
  Widget build(BuildContext context) {
    final hasUnread = lead.unreadCount > 0;
    return InkWell(
      onTap: () {
        Navigator.of(
          context,
        ).push(MaterialPageRoute(builder: (_) => ChatScreen(leadId: lead.id)));
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: MitraColors.muted,
              foregroundColor: MitraColors.foreground,
              child: Text(
                initials(lead.companyName),
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          lead.companyName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      Text(
                        compactDate(lead.createdAt),
                        style: TextStyle(
                          color: hasUnread
                              ? MitraColors.success
                              : MitraColors.mutedForeground,
                          fontWeight: hasUnread
                              ? FontWeight.w900
                              : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _previewText(lead),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: MitraColors.mutedForeground,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      if (hasUnread)
                        Container(
                          constraints: const BoxConstraints(minWidth: 22),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: MitraColors.success,
                            borderRadius: BorderRadius.circular(99),
                          ),
                          child: Text(
                            lead.unreadCount.toString(),
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      StatusBadge(status: lead.status),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          serviceLabel(lead.serviceType),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: MitraColors.mutedForeground,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _previewText(Lead lead) {
    if (lead.meetingMessage.isNotEmpty) return lead.meetingMessage;
    if (lead.messageCount > 0) {
      return '${lead.contactName} · ${lead.messageCount} pesan';
    }
    return '${lead.contactName} · ${lead.contactPhone}';
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(999),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: selected
                  ? MitraColors.success.withValues(alpha: 0.18)
                  : MitraColors.card,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                color: selected
                    ? MitraColors.success.withValues(alpha: 0.55)
                    : MitraColors.border.withValues(alpha: 0.75),
                width: 0.9,
              ),
            ),
            child: Text(
              label,
              style: TextStyle(
                color: selected
                    ? MitraColors.foreground
                    : MitraColors.mutedForeground,
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

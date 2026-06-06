import 'package:flutter/material.dart';

import '../app.dart';
import '../models.dart';
import '../theme.dart';
import '../utils.dart';
import 'lead_detail_sheet.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({required this.leadId, super.key});

  final String leadId;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final textController = TextEditingController();
  final scrollController = ScrollController();
  Lead? lead;
  List<LeadMessage> messages = [];
  List<LeadEvent> events = [];
  bool loading = true;
  bool sending = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    textController.dispose();
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = StateScope.of(context);
    final activeLead = lead;
    return Scaffold(
      appBar: AppBar(
        leadingWidth: 44,
        leading: IconButton(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back),
        ),
        titleSpacing: 0,
        title: activeLead == null
            ? const Text('Chat')
            : Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: MitraColors.muted,
                    child: Text(
                      initials(activeLead.companyName),
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          activeLead.companyName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          '${serviceLabel(activeLead.serviceType)} · ${activeLead.contactName}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: MitraColors.mutedForeground,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.videocam_outlined),
          ),
          IconButton(onPressed: () {}, icon: const Icon(Icons.call_outlined)),
          IconButton(
            onPressed: activeLead == null
                ? null
                : () => showLeadDetailSheet(
                    context: context,
                    lead: activeLead,
                    events: events,
                    onStatusChanged: _updateStatus,
                  ),
            icon: const Icon(Icons.info_outline),
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: Container(
                    decoration: const BoxDecoration(color: MitraColors.muted),
                    child: RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        controller: scrollController,
                        padding: const EdgeInsets.fromLTRB(12, 14, 12, 14),
                        itemCount: messages.length + 1,
                        itemBuilder: (context, index) {
                          if (index == 0) return const EncryptionNotice();
                          final message = messages[index - 1];
                          final self = message.senderRole == state.role;
                          return MessageBubble(message: message, self: self);
                        },
                      ),
                    ),
                  ),
                ),
                ChatInputBar(
                  controller: textController,
                  sending: sending,
                  onSend: _send,
                ),
              ],
            ),
    );
  }

  Future<void> _load() async {
    final state = StateScope.of(context);
    setState(() => loading = true);
    try {
      final results = await Future.wait([
        state.api.lead(state.role, widget.leadId),
        state.api.messages(state.role, widget.leadId),
        state.api.events(state.role, widget.leadId),
      ]);
      if (!mounted) return;
      setState(() {
        lead = results[0] as Lead;
        messages = results[1] as List<LeadMessage>;
        events = results[2] as List<LeadEvent>;
      });
      await state.refreshLead(widget.leadId);
      _scrollToBottom();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _send() async {
    final text = textController.text.trim();
    if (text.isEmpty || sending) return;
    final state = StateScope.of(context);
    setState(() => sending = true);
    try {
      final sent = await state.api.sendMessage(state.role, widget.leadId, text);
      textController.clear();
      setState(() => messages = [...messages, sent]);
      await state.refreshLead(widget.leadId);
      _scrollToBottom();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  Future<void> _updateStatus(LeadStatus status, String note) async {
    final state = StateScope.of(context);
    await state.updateStatus(widget.leadId, status, note);
    await _load();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!scrollController.hasClients) return;
      scrollController.animateTo(
        scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
      );
    });
  }
}

class EncryptionNotice extends StatelessWidget {
  const EncryptionNotice({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(12),
        constraints: const BoxConstraints(maxWidth: 340),
        decoration: BoxDecoration(
          color: const Color(0xfffff0d5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          'Pesan lead tersimpan di portal GiLabs. Gunakan chat ini untuk follow-up, jadwal meeting, dan koordinasi admin-partner.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: MitraColors.mutedForeground,
            fontSize: 13,
            height: 1.35,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class MessageBubble extends StatelessWidget {
  const MessageBubble({required this.message, required this.self, super.key});

  final LeadMessage message;
  final bool self;

  @override
  Widget build(BuildContext context) {
    final meeting = message.message.startsWith('📅 Jadwal meeting diatur:');
    return Align(
      alignment: self ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.fromLTRB(12, 8, 10, 6),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        decoration: BoxDecoration(
          color: meeting
              ? MitraColors.accent.withValues(alpha: 0.14)
              : self
              ? MitraColors.foreground
              : MitraColors.card,
          border: Border.all(
            color: self ? MitraColors.foreground : MitraColors.border,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!self)
              Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Text(
                  message.senderName,
                  style: TextStyle(
                    color: meeting
                        ? MitraColors.foreground
                        : MitraColors.mutedForeground,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            Text(
              message.message,
              style: TextStyle(
                color: self ? MitraColors.background : MitraColors.foreground,
                fontSize: 15,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 4),
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                compactDate(message.createdAt),
                style: TextStyle(
                  color: self
                      ? MitraColors.background.withValues(alpha: 0.62)
                      : MitraColors.mutedForeground,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChatInputBar extends StatelessWidget {
  const ChatInputBar({
    required this.controller,
    required this.sending,
    required this.onSend,
    super.key,
  });

  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
        color: MitraColors.muted,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(26),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(Icons.emoji_emotions_outlined),
                    ),
                    Expanded(
                      child: TextField(
                        controller: controller,
                        minLines: 1,
                        maxLines: 4,
                        decoration: const InputDecoration(
                          hintText: 'Ketik pesan',
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          fillColor: Colors.white,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(Icons.attach_file),
                    ),
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(Icons.photo_camera_outlined),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            FloatingActionButton.small(
              elevation: 0,
              onPressed: sending ? null : onSend,
              child: sending
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.send),
            ),
          ],
        ),
      ),
    );
  }
}

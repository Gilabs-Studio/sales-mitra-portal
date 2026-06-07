import 'package:flutter/material.dart';

import '../app.dart';
import '../app_state.dart';
import '../knowledge_details.dart';
import '../models.dart';
import '../theme.dart';

class KnowledgeScreen extends StatefulWidget {
  const KnowledgeScreen({super.key});

  @override
  State<KnowledgeScreen> createState() => _KnowledgeScreenState();
}

class _KnowledgeScreenState extends State<KnowledgeScreen> {
  final question = TextEditingController();
  final List<KnowledgeChatMessage> messages = [
    const KnowledgeChatMessage(
      role: 'bot',
      text: 'Tanya soal pricing, layanan, referral, atau kebutuhan discovery.',
    ),
  ];
  bool asking = false;

  @override
  void dispose() {
    question.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = StateScope.of(context);
    return Scaffold(
      body: SafeArea(
        child: AnimatedBuilder(
          animation: state,
          builder: (context, _) {
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 8),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Knowledge',
                          style: TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: state.refreshAll,
                        icon: const Icon(Icons.refresh),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                    children: [
                      for (final article in state.articles)
                        KnowledgeCard(
                          article: article,
                          onTap: () => _openArticle(context, article),
                        ),
                      const SizedBox(height: 12),
                      const Text(
                        'AI chatbot mitra',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: MitraColors.muted,
                          border: Border.all(color: MitraColors.border),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            for (final message in messages)
                              Align(
                                alignment: message.role == 'user'
                                    ? Alignment.centerRight
                                    : Alignment.centerLeft,
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  constraints: BoxConstraints(
                                    maxWidth:
                                        MediaQuery.of(context).size.width *
                                        0.78,
                                  ),
                                  decoration: BoxDecoration(
                                    color: message.role == 'user'
                                        ? MitraColors.foreground
                                        : MitraColors.card,
                                    border: Border.all(
                                      color: message.role == 'user'
                                          ? MitraColors.foreground
                                          : MitraColors.border,
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    message.text,
                                    style: TextStyle(
                                      color: message.role == 'user'
                                          ? MitraColors.background
                                          : MitraColors.foreground,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: question,
                            decoration: const InputDecoration(
                              hintText: 'Tanya pricing, layanan, referral...',
                              prefixIcon: Icon(Icons.psychology_outlined),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        FloatingActionButton.small(
                          elevation: 0,
                          onPressed: asking ? null : () => _ask(state),
                          child: asking
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.send),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<void> _ask(AppState state) async {
    final text = question.text.trim();
    if (text.isEmpty) return;
    setState(() {
      asking = true;
      question.clear();
      messages.add(KnowledgeChatMessage(role: 'user', text: text));
    });
    try {
      final answer = await state.api.askChatbot(text);
      setState(
        () => messages.add(KnowledgeChatMessage(role: 'bot', text: answer)),
      );
    } catch (error) {
      setState(
        () => messages.add(
          KnowledgeChatMessage(role: 'bot', text: error.toString()),
        ),
      );
    } finally {
      if (mounted) setState(() => asking = false);
    }
  }

  void _openArticle(BuildContext context, KnowledgeArticle article) {
    showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      isScrollControlled: true,
      backgroundColor: MitraColors.background,
      builder: (_) => KnowledgeDetailSheet(article: article),
    );
  }
}

class KnowledgeCard extends StatelessWidget {
  const KnowledgeCard({required this.article, required this.onTap, super.key});

  final KnowledgeArticle article;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final hasDetail = getKnowledgeDetail(article) != null;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: MitraColors.card,
          border: Border.all(color: MitraColors.border),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              article.category.toUpperCase(),
              style: const TextStyle(
                color: MitraColors.mutedForeground,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              article.title,
              style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              article.content,
              style: const TextStyle(
                color: MitraColors.mutedForeground,
                height: 1.45,
              ),
            ),
            if (hasDetail) ...[
              const SizedBox(height: 12),
              const Text(
                'Buka detail',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: MitraColors.foreground,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class KnowledgeDetailSheet extends StatelessWidget {
  const KnowledgeDetailSheet({required this.article, super.key});

  final KnowledgeArticle article;

  @override
  Widget build(BuildContext context) {
    final detail = getKnowledgeDetail(article);
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    article.category.toUpperCase(),
                    style: const TextStyle(
                      color: MitraColors.mutedForeground,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    article.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.close),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          detail?.overview ?? article.content,
          style: const TextStyle(
            color: MitraColors.mutedForeground,
            height: 1.45,
          ),
        ),
        for (final section
            in detail?.sections ?? const <KnowledgeDetailSection>[]) ...[
          const SizedBox(height: 22),
          Text(
            section.title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          if (section.summary != null) ...[
            const SizedBox(height: 6),
            Text(
              section.summary!,
              style: const TextStyle(
                color: MitraColors.mutedForeground,
                height: 1.4,
              ),
            ),
          ],
          const SizedBox(height: 10),
          for (final item in section.items)
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: MitraColors.card,
                border: Border.all(color: MitraColors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ExpansionTile(
                tilePadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 2,
                ),
                childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                shape: const Border(),
                collapsedShape: const Border(),
                title: Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: MitraColors.foreground,
                  ),
                ),
                children: [
                  if (item.summary != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(
                        item.summary!,
                        style: const TextStyle(
                          color: MitraColors.mutedForeground,
                          height: 1.4,
                        ),
                      ),
                    ),
                  for (final bullet in item.bullets)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            margin: const EdgeInsets.only(top: 7, right: 10),
                            decoration: const BoxDecoration(
                              color: MitraColors.foreground,
                              shape: BoxShape.circle,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              bullet,
                              style: const TextStyle(
                                color: MitraColors.mutedForeground,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
        ],
      ],
    );
  }
}

class KnowledgeChatMessage {
  const KnowledgeChatMessage({required this.role, required this.text});

  final String role;
  final String text;
}

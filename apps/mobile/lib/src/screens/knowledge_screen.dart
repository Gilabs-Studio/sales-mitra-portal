import 'package:flutter/material.dart';

import '../app.dart';
import '../app_state.dart';
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
                        KnowledgeCard(article: article),
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
}

class KnowledgeCard extends StatelessWidget {
  const KnowledgeCard({required this.article, super.key});

  final KnowledgeArticle article;

  @override
  Widget build(BuildContext context) {
    return Container(
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
        ],
      ),
    );
  }
}

class KnowledgeChatMessage {
  const KnowledgeChatMessage({required this.role, required this.text});

  final String role;
  final String text;
}

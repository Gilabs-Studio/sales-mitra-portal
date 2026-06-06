import 'package:flutter/material.dart';

import '../app.dart';
import '../theme.dart';
import 'chat_list_screen.dart';
import 'knowledge_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final state = StateScope.of(context);
    return AnimatedBuilder(
      animation: state,
      builder: (context, _) {
        return Scaffold(
          body: IndexedStack(
            index: index,
            children: const [
              ChatListScreen(),
              KnowledgeScreen(),
              ProfileScreen(),
            ],
          ),
          bottomNavigationBar: Container(
            decoration: const BoxDecoration(
              color: MitraColors.card,
              border: Border(top: BorderSide(color: MitraColors.border)),
            ),
            child: BottomNavigationBar(
              currentIndex: index,
              onTap: (value) => setState(() => index = value),
              items: [
                BottomNavigationBarItem(
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Icon(Icons.chat_bubble_outline),
                      if (state.leads.any((lead) => lead.unreadCount > 0))
                        Positioned(
                          right: -9,
                          top: -7,
                          child: Container(
                            constraints: const BoxConstraints(minWidth: 18),
                            padding: const EdgeInsets.symmetric(horizontal: 5),
                            decoration: BoxDecoration(
                              color: MitraColors.success,
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: Text(
                              state.leads
                                  .fold<int>(
                                    0,
                                    (sum, lead) => sum + lead.unreadCount,
                                  )
                                  .toString(),
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  label: 'Chat',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.psychology_outlined),
                  label: 'Knowledge',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.account_circle_outlined),
                  label: 'Akun',
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

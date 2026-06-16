import 'package:flutter/material.dart';

import '../app.dart';
import '../models.dart';
import '../theme.dart';
import 'add_lead_sheet.dart';
import 'admin_monitor_screen.dart';
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
    final isAdmin = isAdminRole(state.role);
    final pages = isAdmin
        ? const [
            AdminMonitorScreen(),
            ChatListScreen(),
            KnowledgeScreen(),
            ProfileScreen(),
          ]
        : const [ChatListScreen(), KnowledgeScreen(), ProfileScreen()];

    final currentIndex = index >= pages.length ? 0 : index;

    return AnimatedBuilder(
      animation: state,
      builder: (context, _) {
        return Scaffold(
          body: IndexedStack(index: currentIndex, children: pages),
          floatingActionButton: !isAdmin && currentIndex == 0
              ? FloatingActionButton.small(
                  heroTag: 'home-add-lead-fab',
                  elevation: 1,
                  onPressed: () {
                    if (state.role.name == 'partner') {
                      showAddLeadSheet(context);
                      return;
                    }
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Tambah lead tersedia dari akun partner.',
                        ),
                      ),
                    );
                  },
                  child: const Icon(Icons.add),
                )
              : null,
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              color: MitraColors.card,
              border: Border(
                top: BorderSide(
                  color: MitraColors.border.withValues(alpha: 0.42),
                  width: 0.45,
                ),
              ),
            ),
            child: BottomNavigationBar(
              currentIndex: currentIndex,
              onTap: (value) => setState(() => index = value),
              elevation: 0,
              iconSize: 22,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              type: BottomNavigationBarType.fixed,
              items: [
                if (isAdmin)
                  const BottomNavigationBarItem(
                    icon: Icon(Icons.monitor_outlined),
                    label: 'Monitor',
                  ),
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

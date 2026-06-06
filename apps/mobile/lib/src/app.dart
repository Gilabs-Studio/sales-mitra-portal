import 'package:flutter/material.dart';

import 'app_state.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'theme.dart';

class MitraMobileApp extends StatefulWidget {
  const MitraMobileApp({super.key});

  @override
  State<MitraMobileApp> createState() => _MitraMobileAppState();
}

class _MitraMobileAppState extends State<MitraMobileApp> {
  final AppState state = AppState();

  @override
  void dispose() {
    state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StateScope(
      state: state,
      child: MaterialApp(
        title: 'GiLabs Mobile',
        debugShowCheckedModeBanner: false,
        theme: buildMitraTheme(),
        home: AnimatedBuilder(
          animation: state,
          builder: (context, _) {
            return state.isLoggedIn ? const HomeScreen() : const LoginScreen();
          },
        ),
      ),
    );
  }
}

class StateScope extends InheritedNotifier<AppState> {
  const StateScope({required AppState state, required super.child, super.key})
    : super(notifier: state);

  static AppState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<StateScope>();
    assert(scope != null, 'StateScope tidak ditemukan.');
    return scope!.notifier!;
  }
}

import 'package:flutter/material.dart';

import '../app.dart';
import '../app_state.dart';
import '../theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final apiController = TextEditingController(text: defaultApiBaseUrl);
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool showPassword = false;

  @override
  void dispose() {
    apiController.dispose();
    emailController.dispose();
    passwordController.dispose();
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
            return ListView(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
              children: [
                const Text(
                  'GiLabs',
                  style: TextStyle(fontSize: 38, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Mobile lead inbox untuk partner dan admin.',
                  style: TextStyle(
                    color: MitraColors.mutedForeground,
                    fontSize: 16,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: apiController,
                  keyboardType: TextInputType.url,
                  decoration: const InputDecoration(
                    labelText: 'API base URL',
                    prefixIcon: Icon(Icons.link),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email atau username',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: passwordController,
                  obscureText: !showPassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() {
                        showPassword = !showPassword;
                      }),
                      icon: Icon(
                        showPassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                if (state.errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      state.errorMessage!,
                      style: const TextStyle(
                        color: MitraColors.destructive,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                FilledButton.icon(
                  onPressed: state.isBusy ? null : () => _login(state),
                  icon: state.isBusy
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.login),
                  label: const Text('Masuk'),
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: MitraColors.muted,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: MitraColors.border),
                  ),
                  child: const Text(
                    'Untuk Android emulator, default URL memakai 10.0.2.2:8089/api/v1 agar masuk ke Docker/web proxy lokal.',
                    style: TextStyle(
                      color: MitraColors.mutedForeground,
                      height: 1.35,
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

  Future<void> _login(AppState state) async {
    try {
      await state.login(
        baseUrl: apiController.text,
        email: emailController.text,
        password: passwordController.text,
      );
    } catch (_) {
      // Error message is already stored in AppState.
    }
  }
}

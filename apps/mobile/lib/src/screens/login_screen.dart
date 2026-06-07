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
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool showPassword = false;

  @override
  void dispose() {
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
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: MitraColors.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: MitraColors.border),
                      ),
                      child: Image.asset(
                        'assets/images/logo-putih-1.jpg',
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Text(
                      'GiLabs',
                      style: TextStyle(
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
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
        baseUrl: '',
        email: emailController.text,
        password: passwordController.text,
      );
    } catch (_) {
      // Error message is already stored in AppState.
    }
  }
}

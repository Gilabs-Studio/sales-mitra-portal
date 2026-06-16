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
            return LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight - 48,
                    ),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 420),
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(22, 24, 22, 18),
                          decoration: BoxDecoration(
                            color: MitraColors.card,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: MitraColors.border),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 68,
                                height: 68,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: MitraColors.muted,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: MitraColors.border),
                                ),
                                child: Image.asset(
                                  'assets/images/logo-putih-1.jpg',
                                  fit: BoxFit.contain,
                                ),
                              ),
                              const SizedBox(height: 18),
                              const Text(
                                'GiLabs Mobile',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 30,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Login partner dan admin untuk pantau lead, request klien, dan activity portal.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: MitraColors.mutedForeground,
                                  fontSize: 14,
                                  height: 1.45,
                                ),
                              ),
                              const SizedBox(height: 24),
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
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: MitraColors.destructive,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              SizedBox(
                                width: double.infinity,
                                child: FilledButton.icon(
                                  onPressed: state.isBusy
                                      ? null
                                      : () => _login(state),
                                  icon: state.isBusy
                                      ? const SizedBox(
                                          width: 18,
                                          height: 18,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : const Icon(Icons.login),
                                  label: const Text('Masuk'),
                                ),
                              ),
                              const SizedBox(height: 10),
                              TextButton(
                                onPressed: state.isBusy
                                    ? null
                                    : () => _requestResetPassword(state),
                                child: const Text('Lupa password?'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
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

  Future<void> _requestResetPassword(AppState state) async {
    final messenger = ScaffoldMessenger.of(context);
    final resetEmailController = TextEditingController(
      text: emailController.text.trim(),
    );

    try {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Reset password'),
            content: TextField(
              controller: resetEmailController,
              keyboardType: TextInputType.emailAddress,
              autofocus: true,
              decoration: const InputDecoration(
                labelText: 'Email akun',
                hintText: 'nama@domain.com',
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Batal'),
              ),
              FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Kirim link'),
              ),
            ],
          );
        },
      );

      if (confirmed != true || !mounted) {
        return;
      }

      await state.requestPasswordReset(resetEmailController.text);
      if (!mounted) return;
      messenger.showSnackBar(
        const SnackBar(
          content: Text(
            'Jika email terdaftar, link reset password sudah dikirim.',
          ),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(
          content: Text(state.errorMessage ?? 'Gagal mengirim reset password.'),
        ),
      );
    } finally {
      resetEmailController.dispose();
    }
  }
}

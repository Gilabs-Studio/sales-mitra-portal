import 'package:flutter/material.dart';

import '../app.dart';
import '../app_state.dart';
import '../models.dart';
import '../theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = StateScope.of(context);
    final user = state.user;
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
          children: [
            const Text(
              'Akun',
              style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: MitraColors.card,
                border: Border.all(color: MitraColors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: MitraColors.muted,
                        child: Text(
                          (user?.name.isNotEmpty ?? false)
                              ? user!.name[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.name ?? '-',
                              style: const TextStyle(
                                fontSize: 19,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Text(
                              user?.email ?? '-',
                              style: const TextStyle(
                                color: MitraColors.mutedForeground,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _ProfileLine(
                    label: 'Role',
                    value: user == null
                        ? '-'
                        : isAdminRole(user.role)
                        ? (user.role == UserRole.superAdmin ? 'Super Admin' : 'Admin')
                        : 'Partner',
                  ),
                  if ((user?.partnerCode ?? '').isNotEmpty)
                    _ProfileLine(
                      label: 'Kode partner',
                      value: user!.partnerCode,
                    ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: user == null ? null : () => _requestResetPassword(context, state),
              icon: const Icon(Icons.lock_reset),
              label: const Text('Reset password'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: state.logout,
              icon: const Icon(Icons.logout),
              label: const Text('Keluar'),
            ),
          ],
        ),
      ),
    );
  }
}

Future<void> _requestResetPassword(BuildContext context, AppState state) async {
  final messenger = ScaffoldMessenger.of(context);
  final oldPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  try {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Ubah password'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: oldPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password lama'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password baru'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Konfirmasi password baru',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Batal'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Simpan'),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return;
    }

    if (newPasswordController.text.trim() !=
        confirmPasswordController.text.trim()) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Konfirmasi password baru harus sama.'),
        ),
      );
      return;
    }

    await state.changePassword(
      oldPassword: oldPasswordController.text,
      newPassword: newPasswordController.text,
    );
    messenger.showSnackBar(
      const SnackBar(
        content: Text('Password akun berhasil diperbarui.'),
      ),
    );
  } catch (_) {
    messenger.showSnackBar(
      SnackBar(
        content: Text(state.errorMessage ?? 'Gagal mengubah password.'),
      ),
    );
  } finally {
    oldPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
  }
}

class _ProfileLine extends StatelessWidget {
  const _ProfileLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                color: MitraColors.mutedForeground,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}

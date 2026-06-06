import 'package:flutter/material.dart';

import '../models.dart';
import '../theme.dart';
import '../utils.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({required this.status, super.key});

  final LeadStatus status;

  @override
  Widget build(BuildContext context) {
    final color = statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.13),
        border: Border.all(color: color.withValues(alpha: 0.5)),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        statusLabel(status),
        style: const TextStyle(
          color: MitraColors.foreground,
          fontSize: 11,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

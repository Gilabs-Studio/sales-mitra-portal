import 'package:flutter/material.dart';

import 'models.dart';
import 'theme.dart';

String initials(String value) {
  final words = value.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty);
  final text = words.take(2).map((w) => w[0]).join();
  return text.isEmpty ? '?' : text.toUpperCase();
}

String compactDate(DateTime date) {
  final now = DateTime.now();
  if (date.year == now.year && date.month == now.month && date.day == now.day) {
    return '${date.hour.toString().padLeft(2, '0')}.${date.minute.toString().padLeft(2, '0')}';
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  return '${date.day} ${months[date.month - 1]}';
}

String fullDate(DateTime date) {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return '${date.day} ${months[date.month - 1]} ${date.year}, ${date.hour.toString().padLeft(2, '0')}.${date.minute.toString().padLeft(2, '0')}';
}

String fullDateWithoutTime(DateTime date) {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return '${date.day} ${months[date.month - 1]} ${date.year}';
}

String weekdayLabel(DateTime date) {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  return days[date.weekday - 1];
}

String rupiah(int value) {
  if (value <= 0) return 'Discovery';
  final raw = value.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < raw.length; i++) {
    final left = raw.length - i;
    buffer.write(raw[i]);
    if (left > 1 && left % 3 == 1) buffer.write('.');
  }
  return 'Rp$buffer';
}

Color statusColor(LeadStatus status) {
  return switch (status) {
    LeadStatus.submitted => MitraColors.mutedForeground,
    LeadStatus.qualified => MitraColors.success,
    LeadStatus.contacted => MitraColors.accent,
    LeadStatus.won => MitraColors.success,
    LeadStatus.lost => MitraColors.destructive,
    LeadStatus.rejected => MitraColors.destructive,
  };
}

Color projectStatusColor(ProjectStatus status) {
  return switch (status) {
    ProjectStatus.discovery => MitraColors.mutedForeground,
    ProjectStatus.planning => MitraColors.warning,
    ProjectStatus.development => MitraColors.accent,
    ProjectStatus.testing => MitraColors.warning,
    ProjectStatus.deployment => MitraColors.foreground,
    ProjectStatus.completed => MitraColors.success,
    ProjectStatus.maintenance => MitraColors.success,
  };
}

Color progressStatusColor(ProgressStatus status) {
  return switch (status) {
    ProgressStatus.pending => MitraColors.destructive,
    ProgressStatus.inProgress => MitraColors.warning,
    ProgressStatus.completed => MitraColors.success,
  };
}

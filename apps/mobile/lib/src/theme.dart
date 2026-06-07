import 'package:flutter/material.dart';

class MitraColors {
  static const background = Color(0xfffaf9f5);
  static const foreground = Color(0xff141413);
  static const card = Color(0xfffaf9f5);
  static const muted = Color(0xfff0eee6);
  static const mutedForeground = Color(0xff5e5d59);
  static const border = Color(0xffb0aea5);
  static const accent = Color(0xffd97757);
  static const destructive = Color(0xffb5473f);
  static const success = Color(0xff2f7d5f);
  static const warning = Color(0xffb7791f);
}

ThemeData buildMitraTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: MitraColors.foreground,
    brightness: Brightness.light,
    primary: MitraColors.foreground,
    secondary: MitraColors.muted,
    surface: MitraColors.card,
    error: MitraColors.destructive,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: MitraColors.background,
    fontFamily: 'Arial',
    appBarTheme: const AppBarTheme(
      backgroundColor: MitraColors.background,
      foregroundColor: MitraColors.foreground,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: MitraColors.foreground,
        fontSize: 20,
        fontWeight: FontWeight.w800,
      ),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: MitraColors.foreground,
      foregroundColor: MitraColors.background,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(18)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: MitraColors.card,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: MitraColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: MitraColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: MitraColors.foreground, width: 1.4),
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: MitraColors.card,
      selectedColor: MitraColors.success.withValues(alpha: 0.16),
      side: const BorderSide(color: MitraColors.border),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      labelStyle: const TextStyle(fontWeight: FontWeight.w700),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: MitraColors.card,
      selectedItemColor: MitraColors.foreground,
      unselectedItemColor: MitraColors.mutedForeground,
      selectedLabelStyle: TextStyle(fontWeight: FontWeight.w800),
      selectedIconTheme: IconThemeData(size: 22),
      unselectedIconTheme: IconThemeData(size: 21),
      type: BottomNavigationBarType.fixed,
    ),
  );
}

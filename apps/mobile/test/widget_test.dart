import 'package:flutter_test/flutter_test.dart';

import 'package:mitra_mobile/src/app.dart';

void main() {
  testWidgets('shows mobile login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const MitraMobileApp());

    expect(find.text('GiLabs'), findsOneWidget);
    expect(find.text('Masuk'), findsOneWidget);
  });
}

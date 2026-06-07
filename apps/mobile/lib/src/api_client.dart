import 'dart:convert';
import 'dart:io';

import 'models.dart';

class ApiClientException implements Exception {
  const ApiClientException(this.message);

  final String message;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({required this.baseUrl, this.token});

  String baseUrl;
  String? token;
  final HttpClient _client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 12);

  Future<AuthResult> login(String email, String password) async {
    final data = await _request(
      'POST',
      '/auth/login',
      body: {'email': email, 'password': password},
    );
    return AuthResult.fromJson(data as Map<String, dynamic>);
  }

  Future<User> me() async {
    final data = await _request('GET', '/me');
    return User.fromJson(data as Map<String, dynamic>);
  }

  Future<List<ServiceRule>> services() async {
    final data = await _request('GET', '/catalog/services');
    return (data as List)
        .whereType<Map<String, dynamic>>()
        .map(ServiceRule.fromJson)
        .toList();
  }

  Future<List<Lead>> leads(UserRole role, {String? status}) async {
    final data = await _request(
      'GET',
      '/${rolePath(role)}/leads',
      query: {
        'pageSize': '50',
        if (status != null && status.isNotEmpty) 'status': status,
      },
    );
    final items = (data as Map<String, dynamic>)['data'] as List? ?? [];
    return items.whereType<Map<String, dynamic>>().map(Lead.fromJson).toList();
  }

  Future<Lead> lead(UserRole role, String leadId) async {
    final data = await _request('GET', '/${rolePath(role)}/leads/$leadId');
    return Lead.fromJson(data as Map<String, dynamic>);
  }

  Future<Lead> createLead(Map<String, dynamic> payload) async {
    final data = await _request('POST', '/partner/leads', body: payload);
    return Lead.fromJson(data as Map<String, dynamic>);
  }

  Future<Lead> updateStatus(
    String leadId,
    LeadStatus status,
    String note,
  ) async {
    final data = await _request(
      'PATCH',
      '/admin/leads/$leadId/status',
      body: {'status': status.name, 'note': note},
    );
    return Lead.fromJson(data as Map<String, dynamic>);
  }

  Future<List<LeadMessage>> messages(UserRole role, String leadId) async {
    final data = await _request(
      'GET',
      '/${rolePath(role)}/leads/$leadId/messages',
      query: {'limit': '80'},
    );
    return (data as List)
        .whereType<Map<String, dynamic>>()
        .map(LeadMessage.fromJson)
        .toList();
  }

  Future<LeadMessage> sendMessage(
    UserRole role,
    String leadId,
    String message,
  ) async {
    final data = await _request(
      'POST',
      '/${rolePath(role)}/leads/$leadId/messages',
      body: {'message': message},
    );
    return LeadMessage.fromJson(data as Map<String, dynamic>);
  }

  Future<List<LeadEvent>> events(UserRole role, String leadId) async {
    final data = await _request(
      'GET',
      '/${rolePath(role)}/leads/$leadId/events',
    );
    return (data as List)
        .whereType<Map<String, dynamic>>()
        .map(LeadEvent.fromJson)
        .toList();
  }

  Future<List<KnowledgeArticle>> knowledge() async {
    final data = await _request('GET', '/knowledge');
    return (data as List)
        .whereType<Map<String, dynamic>>()
        .map(KnowledgeArticle.fromJson)
        .toList();
  }

  Future<String> askChatbot(String question) async {
    final data = await _request(
      'POST',
      '/chatbot/ask',
      body: {'question': question},
    );
    if (data is Map<String, dynamic>) {
      return data['answer'] as String? ?? data.values.first.toString();
    }
    return data.toString();
  }

  Future<Object?> _request(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, dynamic>? body,
  }) async {
    final normalized = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    final uri = Uri.parse('$normalized$path').replace(queryParameters: query);
    final request = await _client.openUrl(method, uri);
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');
    request.headers.set(HttpHeaders.contentTypeHeader, 'application/json');
    final activeToken = token;
    if (activeToken != null && activeToken.isNotEmpty) {
      request.headers.set(
        HttpHeaders.authorizationHeader,
        'Bearer $activeToken',
      );
    }
    if (body != null) {
      request.add(utf8.encode(jsonEncode(body)));
    }

    final response = await request.close();
    final text = await response.transform(utf8.decoder).join();
    final decoded = text.isEmpty ? <String, dynamic>{} : jsonDecode(text);
    if (decoded is! Map<String, dynamic>) {
      throw const ApiClientException('Response API tidak valid.');
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final error = decoded['error'];
      if (error is Map<String, dynamic>) {
        throw ApiClientException(
          error['message'] as String? ?? 'Request gagal.',
        );
      }
      throw ApiClientException(
        decoded['message'] as String? ?? 'Request gagal.',
      );
    }
    if (decoded['success'] != true) {
      throw ApiClientException(
        decoded['message'] as String? ?? 'Request gagal.',
      );
    }
    return decoded['data'];
  }
}

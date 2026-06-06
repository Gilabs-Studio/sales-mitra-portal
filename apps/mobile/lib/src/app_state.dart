import 'package:flutter/foundation.dart';

import 'api_client.dart';
import 'models.dart';

const defaultApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8089/api/v1',
);

class AppState extends ChangeNotifier {
  AppState() : api = ApiClient(baseUrl: defaultApiBaseUrl);

  final ApiClient api;
  User? user;
  List<Lead> leads = [];
  List<ServiceRule> services = [];
  List<KnowledgeArticle> articles = [];
  String search = '';
  String selectedStatus = '';
  String? errorMessage;
  bool isBusy = false;

  UserRole get role => user?.role ?? UserRole.partner;
  bool get isLoggedIn => user != null && api.token != null;

  List<Lead> get visibleLeads {
    final needle = search.toLowerCase().trim();
    return leads.where((lead) {
      final matchesSearch =
          needle.isEmpty ||
          lead.companyName.toLowerCase().contains(needle) ||
          lead.contactName.toLowerCase().contains(needle) ||
          lead.contactPhone.toLowerCase().contains(needle);
      final matchesStatus =
          selectedStatus.isEmpty || lead.status.name == selectedStatus;
      return matchesSearch && matchesStatus;
    }).toList();
  }

  Future<void> login({
    required String baseUrl,
    required String email,
    required String password,
  }) async {
    await _run(() async {
      api.baseUrl = baseUrl.trim().isEmpty ? defaultApiBaseUrl : baseUrl.trim();
      final result = await api.login(email.trim(), password);
      api.token = result.token;
      user = result.user;
      await refreshAll();
    });
  }

  Future<void> refreshAll() async {
    final activeUser = user;
    if (activeUser == null) return;
    services = await api.services();
    leads = await api.leads(activeUser.role);
    articles = await api.knowledge();
    notifyListeners();
  }

  Future<void> refreshLeads() async {
    final activeUser = user;
    if (activeUser == null) return;
    await _run(() async {
      leads = await api.leads(activeUser.role);
    });
  }

  Future<Lead> refreshLead(String leadId) async {
    final item = await api.lead(role, leadId);
    final index = leads.indexWhere((lead) => lead.id == leadId);
    if (index >= 0) {
      leads[index] = item;
    }
    notifyListeners();
    return item;
  }

  Future<void> createLead(Map<String, dynamic> payload) async {
    await _run(() async {
      final lead = await api.createLead(payload);
      leads = [lead, ...leads];
    });
  }

  Future<void> updateStatus(
    String leadId,
    LeadStatus status,
    String note,
  ) async {
    await _run(() async {
      final lead = await api.updateStatus(leadId, status, note);
      final index = leads.indexWhere((item) => item.id == leadId);
      if (index >= 0) leads[index] = lead;
    });
  }

  void setSearch(String value) {
    search = value;
    notifyListeners();
  }

  void setStatus(String value) {
    selectedStatus = value;
    notifyListeners();
  }

  void logout() {
    api.token = null;
    user = null;
    leads = [];
    articles = [];
    services = [];
    notifyListeners();
  }

  Future<void> _run(Future<void> Function() action) async {
    isBusy = true;
    errorMessage = null;
    notifyListeners();
    try {
      await action();
    } on ApiClientException catch (error) {
      errorMessage = error.message;
      rethrow;
    } catch (error) {
      errorMessage = error.toString();
      rethrow;
    } finally {
      isBusy = false;
      notifyListeners();
    }
  }
}

enum UserRole { superAdmin, admin, partner }

enum LeadStatus { submitted, qualified, contacted, won, lost, rejected }

class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.partnerCode,
  });

  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String partnerCode;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: parseRole(json['role'] as String? ?? 'partner'),
      partnerCode: json['partnerCode'] as String? ?? '',
    );
  }
}

class AuthResult {
  const AuthResult({required this.token, required this.user});

  final String token;
  final User user;

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      token: json['token'] as String? ?? '',
      user: User.fromJson(json['user'] as Map<String, dynamic>? ?? {}),
    );
  }
}

class ServiceRule {
  const ServiceRule({
    required this.type,
    required this.label,
    required this.description,
    required this.minimumBudget,
  });

  final String type;
  final String label;
  final String description;
  final int minimumBudget;

  factory ServiceRule.fromJson(Map<String, dynamic> json) {
    return ServiceRule(
      type: json['type'] as String? ?? 'other',
      label: json['label'] as String? ?? 'Lainnya',
      description: json['description'] as String? ?? '',
      minimumBudget: asInt(json['minimumBudget']),
    );
  }
}

class Lead {
  const Lead({
    required this.id,
    required this.companyName,
    required this.contactName,
    required this.contactEmail,
    required this.contactPhone,
    required this.serviceType,
    required this.budget,
    required this.needSummary,
    required this.notes,
    required this.status,
    required this.qualificationScore,
    required this.qualificationNote,
    required this.unreadCount,
    required this.messageCount,
    required this.meetingMessage,
    required this.createdAt,
    this.partnerName = '',
    this.partnerEmail = '',
    this.partnerCode = '',
  });

  final String id;
  final String companyName;
  final String contactName;
  final String contactEmail;
  final String contactPhone;
  final String serviceType;
  final int budget;
  final String needSummary;
  final String notes;
  final LeadStatus status;
  final int qualificationScore;
  final String qualificationNote;
  final int unreadCount;
  final int messageCount;
  final String meetingMessage;
  final DateTime createdAt;
  final String partnerName;
  final String partnerEmail;
  final String partnerCode;

  factory Lead.fromJson(Map<String, dynamic> json) {
    return Lead(
      id: json['id'] as String? ?? '',
      companyName: json['companyName'] as String? ?? '',
      contactName: json['contactName'] as String? ?? '',
      contactEmail: json['contactEmail'] as String? ?? '',
      contactPhone: json['contactPhone'] as String? ?? '',
      serviceType: json['serviceType'] as String? ?? 'other',
      budget: asInt(json['budget']),
      needSummary: json['needSummary'] as String? ?? '',
      notes: json['notes'] as String? ?? '',
      status: parseLeadStatus(json['status'] as String? ?? 'submitted'),
      qualificationScore: asInt(json['qualificationScore']),
      qualificationNote: json['qualificationNote'] as String? ?? '',
      unreadCount: asInt(json['unreadCount']),
      messageCount: asInt(json['messageCount']),
      meetingMessage: json['meetingMessage'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      partnerName: json['partnerName'] as String? ?? '',
      partnerEmail: json['partnerEmail'] as String? ?? '',
      partnerCode: json['partnerCode'] as String? ?? '',
    );
  }
}

class LeadMessage {
  const LeadMessage({
    required this.id,
    required this.leadId,
    required this.senderName,
    required this.senderRole,
    required this.message,
    required this.createdAt,
  });

  final String id;
  final String leadId;
  final String senderName;
  final UserRole senderRole;
  final String message;
  final DateTime createdAt;

  factory LeadMessage.fromJson(Map<String, dynamic> json) {
    return LeadMessage(
      id: json['id'] as String? ?? '',
      leadId: json['leadId'] as String? ?? '',
      senderName: json['senderName'] as String? ?? '',
      senderRole: parseRole(json['senderRole'] as String? ?? 'partner'),
      message: json['message'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class LeadEvent {
  const LeadEvent({
    required this.id,
    required this.status,
    required this.note,
    required this.createdAt,
  });

  final String id;
  final LeadStatus status;
  final String note;
  final DateTime createdAt;

  factory LeadEvent.fromJson(Map<String, dynamic> json) {
    return LeadEvent(
      id: json['id'] as String? ?? '',
      status: parseLeadStatus(json['status'] as String? ?? 'submitted'),
      note: json['note'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class KnowledgeArticle {
  const KnowledgeArticle({
    required this.id,
    required this.title,
    required this.category,
    required this.content,
  });

  final String id;
  final String title;
  final String category;
  final String content;

  factory KnowledgeArticle.fromJson(Map<String, dynamic> json) {
    return KnowledgeArticle(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      category: json['category'] as String? ?? '',
      content: json['content'] as String? ?? '',
    );
  }
}

UserRole parseRole(String value) {
  return switch (value) {
    'super_admin' => UserRole.superAdmin,
    'admin' => UserRole.admin,
    _ => UserRole.partner,
  };
}

bool isAdminRole(UserRole role) =>
    role == UserRole.admin || role == UserRole.superAdmin;

LeadStatus parseLeadStatus(String value) {
  return LeadStatus.values.firstWhere(
    (status) => status.name == value,
    orElse: () => LeadStatus.submitted,
  );
}

String rolePath(UserRole role) => isAdminRole(role) ? 'admin' : 'partner';

String statusLabel(LeadStatus status) {
  return switch (status) {
    LeadStatus.submitted => 'Submitted',
    LeadStatus.qualified => 'Qualified',
    LeadStatus.contacted => 'Contacted',
    LeadStatus.won => 'Won',
    LeadStatus.lost => 'Lost',
    LeadStatus.rejected => 'Rejected',
  };
}

String serviceLabel(String serviceType) {
  return switch (serviceType) {
    'company_profile' => 'Company Profile',
    'website_app' => 'Website App',
    'custom_software' => 'Custom Software',
    'salesview' => 'SalesView',
    _ => 'Lainnya',
  };
}

int asInt(Object? value) {
  if (value is int) return value;
  if (value is double) return value.round();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}

enum UserRole { superAdmin, admin, partner }

enum LeadStatus { submitted, qualified, contacted, won, lost, rejected }

enum ProjectStatus {
  discovery,
  planning,
  development,
  testing,
  deployment,
  completed,
  maintenance,
}

enum ProgressStatus { pending, inProgress, completed }

class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.partnerCode,
    required this.isSuspended,
    required this.suspendedReason,
  });

  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String partnerCode;
  final bool isSuspended;
  final String suspendedReason;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: parseRole(json['role'] as String? ?? 'partner'),
      partnerCode: json['partnerCode'] as String? ?? '',
      isSuspended: json['isSuspended'] as bool? ?? false,
      suspendedReason: json['suspendedReason'] as String? ?? '',
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
    this.partnerSuspended = false,
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
  final bool partnerSuspended;

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
      partnerSuspended: json['partnerSuspended'] as bool? ?? false,
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

class AdminClient {
  const AdminClient({
    required this.id,
    required this.name,
    required this.email,
    required this.isSuspended,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String email;
  final bool isSuspended;
  final DateTime createdAt;

  factory AdminClient.fromJson(Map<String, dynamic> json) {
    return AdminClient(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      isSuspended: json['isSuspended'] as bool? ?? false,
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class ProjectItem {
  const ProjectItem({
    required this.id,
    required this.clientId,
    required this.clientName,
    required this.clientEmail,
    required this.name,
    required this.description,
    required this.picName,
    required this.picContact,
    required this.startDate,
    required this.targetEndDate,
    required this.status,
    required this.websiteUrl,
    required this.stagingUrl,
    required this.credentials,
    required this.documentation,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String clientId;
  final String clientName;
  final String clientEmail;
  final String name;
  final String description;
  final String picName;
  final String picContact;
  final String startDate;
  final String targetEndDate;
  final ProjectStatus status;
  final String websiteUrl;
  final String stagingUrl;
  final String credentials;
  final String documentation;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory ProjectItem.fromJson(Map<String, dynamic> json) {
    return ProjectItem(
      id: json['id'] as String? ?? '',
      clientId: json['clientId'] as String? ?? '',
      clientName: json['clientName'] as String? ?? '',
      clientEmail: json['clientEmail'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      picName: json['picName'] as String? ?? '',
      picContact: json['picContact'] as String? ?? '',
      startDate: json['startDate'] as String? ?? '',
      targetEndDate: json['targetEndDate'] as String? ?? '',
      status: parseProjectStatus(json['status'] as String? ?? 'discovery'),
      websiteUrl: json['websiteUrl'] as String? ?? '',
      stagingUrl: json['stagingUrl'] as String? ?? '',
      credentials: json['credentials'] as String? ?? '',
      documentation: json['documentation'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      updatedAt:
          DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class ProjectProgressItem {
  const ProjectProgressItem({
    required this.id,
    required this.projectId,
    required this.title,
    required this.status,
    required this.percentage,
    required this.updateDate,
    required this.notes,
    required this.documentUrl,
    required this.createdAt,
  });

  final String id;
  final String projectId;
  final String title;
  final ProgressStatus status;
  final int percentage;
  final String updateDate;
  final String notes;
  final String documentUrl;
  final DateTime createdAt;

  factory ProjectProgressItem.fromJson(Map<String, dynamic> json) {
    return ProjectProgressItem(
      id: json['id'] as String? ?? '',
      projectId: json['projectId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      status: parseProgressStatus(json['status'] as String? ?? 'pending'),
      percentage: asInt(json['percentage']),
      updateDate: json['updateDate'] as String? ?? '',
      notes: json['notes'] as String? ?? '',
      documentUrl: json['documentUrl'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class ProjectMaintenanceItem {
  const ProjectMaintenanceItem({
    required this.id,
    required this.projectId,
    required this.packageName,
    required this.startDate,
    required this.endDate,
    required this.quotaLimit,
    required this.quotaUsed,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String projectId;
  final String packageName;
  final String startDate;
  final String endDate;
  final int quotaLimit;
  final int quotaUsed;
  final DateTime createdAt;
  final DateTime updatedAt;

  int get quotaLeft => quotaLimit - quotaUsed;

  factory ProjectMaintenanceItem.fromJson(Map<String, dynamic> json) {
    return ProjectMaintenanceItem(
      id: json['id'] as String? ?? '',
      projectId: json['projectId'] as String? ?? '',
      packageName: json['packageName'] as String? ?? '',
      startDate: json['startDate'] as String? ?? '',
      endDate: json['endDate'] as String? ?? '',
      quotaLimit: asInt(json['quotaLimit']),
      quotaUsed: asInt(json['quotaUsed']),
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      updatedAt:
          DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class MaintenanceRequestLog {
  const MaintenanceRequestLog({
    required this.id,
    required this.projectId,
    required this.projectName,
    required this.requestDate,
    required this.description,
    required this.status,
    required this.picName,
    required this.createdAt,
  });

  final String id;
  final String projectId;
  final String projectName;
  final String requestDate;
  final String description;
  final ProgressStatus status;
  final String picName;
  final DateTime createdAt;

  factory MaintenanceRequestLog.fromJson(Map<String, dynamic> json) {
    return MaintenanceRequestLog(
      id: json['id'] as String? ?? '',
      projectId: json['projectId'] as String? ?? '',
      projectName: json['projectName'] as String? ?? '',
      requestDate: json['requestDate'] as String? ?? '',
      description: json['description'] as String? ?? '',
      status: parseProgressStatus(json['status'] as String? ?? 'pending'),
      picName: json['picName'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class ProjectInvoiceItem {
  const ProjectInvoiceItem({
    required this.id,
    required this.projectId,
    required this.projectName,
    required this.invoiceNumber,
    required this.amount,
    required this.status,
    required this.issueDate,
    required this.dueDate,
    required this.documentUrl,
  });

  final String id;
  final String projectId;
  final String projectName;
  final String invoiceNumber;
  final int amount;
  final String status;
  final String issueDate;
  final String dueDate;
  final String documentUrl;

  bool get isPaid => status == 'paid';

  factory ProjectInvoiceItem.fromJson(Map<String, dynamic> json) {
    return ProjectInvoiceItem(
      id: json['id'] as String? ?? '',
      projectId: json['projectId'] as String? ?? '',
      projectName: json['projectName'] as String? ?? '',
      invoiceNumber: json['invoiceNumber'] as String? ?? '',
      amount: asInt(json['amount']),
      status: json['status'] as String? ?? 'draft',
      issueDate: json['issueDate'] as String? ?? '',
      dueDate: json['dueDate'] as String? ?? '',
      documentUrl: json['documentUrl'] as String? ?? '',
    );
  }
}

class ClientMonitoringDetail {
  const ClientMonitoringDetail({required this.client, required this.projects});

  final AdminClient client;
  final List<ProjectItem> projects;

  factory ClientMonitoringDetail.fromJson(Map<String, dynamic> json) {
    final projects = json['projects'] as List? ?? [];
    return ClientMonitoringDetail(
      client: AdminClient.fromJson(
        json['client'] as Map<String, dynamic>? ?? {},
      ),
      projects: projects
          .whereType<Map<String, dynamic>>()
          .map(ProjectItem.fromJson)
          .toList(),
    );
  }
}

class AdminProjectDetail {
  const AdminProjectDetail({
    required this.project,
    required this.progress,
    required this.maintenance,
    required this.maintenanceLogs,
    required this.invoices,
  });

  final ProjectItem? project;
  final List<ProjectProgressItem> progress;
  final List<ProjectMaintenanceItem> maintenance;
  final List<MaintenanceRequestLog> maintenanceLogs;
  final List<ProjectInvoiceItem> invoices;

  factory AdminProjectDetail.fromJson(Map<String, dynamic> json) {
    final progress = json['progress'] as List? ?? [];
    final maintenance = json['maintenance'] as List? ?? [];
    final maintenanceLogs = json['maintLogs'] as List? ?? [];
    final invoices = json['invoices'] as List? ?? [];

    return AdminProjectDetail(
      project: json['project'] is Map<String, dynamic>
          ? ProjectItem.fromJson(json['project'] as Map<String, dynamic>)
          : null,
      progress: progress
          .whereType<Map<String, dynamic>>()
          .map(ProjectProgressItem.fromJson)
          .toList(),
      maintenance: maintenance
          .whereType<Map<String, dynamic>>()
          .map(ProjectMaintenanceItem.fromJson)
          .toList(),
      maintenanceLogs: maintenanceLogs
          .whereType<Map<String, dynamic>>()
          .map(MaintenanceRequestLog.fromJson)
          .toList(),
      invoices: invoices
          .whereType<Map<String, dynamic>>()
          .map(ProjectInvoiceItem.fromJson)
          .toList(),
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

ProjectStatus parseProjectStatus(String value) {
  return switch (value) {
    'planning' => ProjectStatus.planning,
    'development' => ProjectStatus.development,
    'testing' => ProjectStatus.testing,
    'deployment' => ProjectStatus.deployment,
    'completed' => ProjectStatus.completed,
    'maintenance' => ProjectStatus.maintenance,
    _ => ProjectStatus.discovery,
  };
}

ProgressStatus parseProgressStatus(String value) {
  return switch (value) {
    'in_progress' => ProgressStatus.inProgress,
    'completed' => ProgressStatus.completed,
    _ => ProgressStatus.pending,
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

String projectStatusLabel(ProjectStatus status) {
  return switch (status) {
    ProjectStatus.discovery => 'Discovery',
    ProjectStatus.planning => 'Planning',
    ProjectStatus.development => 'Development',
    ProjectStatus.testing => 'Testing',
    ProjectStatus.deployment => 'Deployment',
    ProjectStatus.completed => 'Completed',
    ProjectStatus.maintenance => 'Maintenance',
  };
}

String progressStatusLabel(ProgressStatus status) {
  return switch (status) {
    ProgressStatus.pending => 'Pending',
    ProgressStatus.inProgress => 'In Progress',
    ProgressStatus.completed => 'Completed',
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

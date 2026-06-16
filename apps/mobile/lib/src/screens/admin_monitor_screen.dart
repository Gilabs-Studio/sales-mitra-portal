import 'package:flutter/material.dart';

import '../app.dart';
import '../models.dart';
import '../theme.dart';
import '../utils.dart';

class AdminMonitorScreen extends StatefulWidget {
  const AdminMonitorScreen({super.key});

  @override
  State<AdminMonitorScreen> createState() => _AdminMonitorScreenState();
}

class _AdminMonitorScreenState extends State<AdminMonitorScreen> {
  late Future<_AdminMonitorSnapshot> future;
  bool initialized = false;
  String search = '';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!initialized) {
      future = _load();
      initialized = true;
    }
  }

  Future<_AdminMonitorSnapshot> _load() async {
    final state = StateScope.of(context);
    final results = await Future.wait([
      state.api.adminClients(),
      state.api.adminMaintenanceLogs(),
    ]);
    return _AdminMonitorSnapshot(
      clients: results[0] as List<AdminClient>,
      maintenanceLogs: results[1] as List<MaintenanceRequestLog>,
    );
  }

  Future<void> _refresh() async {
    final refreshed = _load();
    setState(() => future = refreshed);
    await refreshed;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<_AdminMonitorSnapshot>(
          future: future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting &&
                !snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return _StateMessage(
                title: 'Monitor admin gagal dimuat',
                subtitle: snapshot.error.toString(),
                actionLabel: 'Coba lagi',
                onPressed: _refresh,
              );
            }

            final data = snapshot.data;
            if (data == null) {
              return _StateMessage(
                title: 'Belum ada data monitor',
                subtitle: 'Silakan muat ulang halaman.',
                actionLabel: 'Muat ulang',
                onPressed: _refresh,
              );
            }

            final filteredClients = data.clients.where((client) {
              final needle = search.toLowerCase().trim();
              if (needle.isEmpty) return true;
              return client.name.toLowerCase().contains(needle) ||
                  client.email.toLowerCase().contains(needle);
            }).toList();
            final activeRequests = data.maintenanceLogs
                .where((log) => log.status != ProgressStatus.completed)
                .toList();

            return RefreshIndicator(
              onRefresh: _refresh,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 18, 20, 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Admin Monitor',
                                      style: TextStyle(
                                        fontSize: 29,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                    SizedBox(height: 4),
                                    Text(
                                      'Versi ringkas untuk pantau request klien dan progress project.',
                                      style: TextStyle(
                                        color: MitraColors.mutedForeground,
                                        fontSize: 13,
                                        height: 1.35,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed: _refresh,
                                icon: const Icon(Icons.refresh_rounded),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _SummaryCard(
                                  label: 'Klien',
                                  value: data.clients.length.toString(),
                                  caption:
                                      '${data.clients.where((item) => item.isSuspended).length} suspended',
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _SummaryCard(
                                  label: 'Request Aktif',
                                  value: activeRequests.length.toString(),
                                  caption:
                                      '${data.maintenanceLogs.length} total log',
                                  accent: MitraColors.accent,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          TextField(
                            onChanged: (value) =>
                                setState(() => search = value),
                            decoration: InputDecoration(
                              hintText: 'Cari nama klien atau email',
                              prefixIcon: const Icon(Icons.search),
                              filled: true,
                              fillColor: MitraColors.muted,
                              border: OutlineInputBorder(
                                borderSide: BorderSide.none,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderSide: BorderSide.none,
                                borderRadius: BorderRadius.circular(24),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 6, 20, 10),
                      child: _SectionTitle(
                        title: 'Request maintenance terbaru',
                        subtitle:
                            'Fokus pada tiket yang masih pending atau in progress.',
                      ),
                    ),
                  ),
                  if (activeRequests.isEmpty)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        child: _EmptyCard(
                          text: 'Belum ada request maintenance aktif.',
                        ),
                      ),
                    )
                  else
                    SliverList.builder(
                      itemCount: activeRequests.length.clamp(0, 6).toInt(),
                      itemBuilder: (context, index) {
                        final log = activeRequests[index];
                        return Padding(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                          child: _MaintenanceLogCard(log: log),
                        );
                      },
                    ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
                      child: _SectionTitle(
                        title: 'Daftar klien',
                        subtitle:
                            'Buka detail untuk lihat project, timeline progress, dan paket maintenance.',
                      ),
                    ),
                  ),
                  if (filteredClients.isEmpty)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        child: _EmptyCard(text: 'Klien tidak ditemukan.'),
                      ),
                    )
                  else
                    SliverList.builder(
                      itemCount: filteredClients.length,
                      itemBuilder: (context, index) {
                        final client = filteredClients[index];
                        return Padding(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                          child: _ClientCard(
                            client: client,
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => AdminClientMonitorScreen(
                                    clientId: client.id,
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 96)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class AdminClientMonitorScreen extends StatefulWidget {
  const AdminClientMonitorScreen({required this.clientId, super.key});

  final String clientId;

  @override
  State<AdminClientMonitorScreen> createState() =>
      _AdminClientMonitorScreenState();
}

class _AdminClientMonitorScreenState extends State<AdminClientMonitorScreen> {
  late Future<ClientMonitoringDetail> future;
  bool initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!initialized) {
      future = _load();
      initialized = true;
    }
  }

  Future<ClientMonitoringDetail> _load() {
    final state = StateScope.of(context);
    return state.api.adminClientDetail(widget.clientId);
  }

  Future<void> _refresh() async {
    final refreshed = _load();
    setState(() => future = refreshed);
    await refreshed;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Klien')),
      body: FutureBuilder<ClientMonitoringDetail>(
        future: future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return _StateMessage(
              title: 'Detail klien gagal dimuat',
              subtitle: snapshot.error.toString(),
              actionLabel: 'Coba lagi',
              onPressed: _refresh,
            );
          }

          final data = snapshot.data;
          if (data == null) {
            return _StateMessage(
              title: 'Data klien kosong',
              subtitle: 'Silakan muat ulang halaman ini.',
              actionLabel: 'Muat ulang',
              onPressed: _refresh,
            );
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: MitraColors.card,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: MitraColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              data.client.name,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          if (data.client.isSuspended)
                            _TonePill(
                              text: 'Suspended',
                              color: MitraColors.destructive,
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        data.client.email,
                        style: const TextStyle(
                          color: MitraColors.mutedForeground,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          _MiniInfo(
                            label: 'Project',
                            value: data.projects.length.toString(),
                          ),
                          _MiniInfo(
                            label: 'Dibuat',
                            value: compactDate(data.client.createdAt),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                _SectionTitle(
                  title: 'Project klien',
                  subtitle:
                      'Tap salah satu project untuk buka timeline dan maintenance log.',
                ),
                const SizedBox(height: 10),
                if (data.projects.isEmpty)
                  const _EmptyCard(text: 'Belum ada project untuk klien ini.')
                else
                  ...data.projects.map(
                    (project) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _ProjectCard(
                        project: project,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => AdminProjectMonitorScreen(
                                projectId: project.id,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class AdminProjectMonitorScreen extends StatefulWidget {
  const AdminProjectMonitorScreen({required this.projectId, super.key});

  final String projectId;

  @override
  State<AdminProjectMonitorScreen> createState() =>
      _AdminProjectMonitorScreenState();
}

class _AdminProjectMonitorScreenState extends State<AdminProjectMonitorScreen> {
  late Future<AdminProjectDetail> future;
  bool initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!initialized) {
      future = _load();
      initialized = true;
    }
  }

  Future<AdminProjectDetail> _load() {
    final state = StateScope.of(context);
    return state.api.adminProjectDetail(widget.projectId);
  }

  Future<void> _refresh() async {
    final refreshed = _load();
    setState(() => future = refreshed);
    await refreshed;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Monitor Project')),
      body: FutureBuilder<AdminProjectDetail>(
        future: future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return _StateMessage(
              title: 'Detail project gagal dimuat',
              subtitle: snapshot.error.toString(),
              actionLabel: 'Coba lagi',
              onPressed: _refresh,
            );
          }

          final data = snapshot.data;
          final project = data?.project;
          if (data == null || project == null) {
            return _StateMessage(
              title: 'Project tidak ditemukan',
              subtitle: 'Data project tidak tersedia.',
              actionLabel: 'Muat ulang',
              onPressed: _refresh,
            );
          }

          final unpaidInvoices = data.invoices
              .where((invoice) => !invoice.isPaid)
              .toList();

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: MitraColors.card,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: MitraColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              project.name,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          _TonePill(
                            text: projectStatusLabel(project.status),
                            color: projectStatusColor(project.status),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        project.description.isEmpty
                            ? 'Belum ada deskripsi project.'
                            : project.description,
                        style: const TextStyle(
                          color: MitraColors.mutedForeground,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          _MiniInfo(label: 'PIC', value: project.picName),
                          _MiniInfo(
                            label: 'Mulai',
                            value: project.startDate.isEmpty
                                ? '-'
                                : project.startDate,
                          ),
                          _MiniInfo(
                            label: 'Target',
                            value: project.targetEndDate.isEmpty
                                ? '-'
                                : project.targetEndDate,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _SummaryCard(
                        label: 'Timeline',
                        value: data.progress.length.toString(),
                        caption: 'update progress',
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _SummaryCard(
                        label: 'Invoice Aktif',
                        value: unpaidInvoices.length.toString(),
                        caption: 'belum lunas',
                        accent: MitraColors.warning,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                _SectionTitle(
                  title: 'Timeline progress',
                  subtitle: 'Urutan update paling baru untuk monitoring cepat.',
                ),
                const SizedBox(height: 10),
                if (data.progress.isEmpty)
                  const _EmptyCard(
                    text: 'Belum ada progress timeline pada project ini.',
                  )
                else
                  ...data.progress.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _ProgressCard(item: item),
                    ),
                  ),
                const SizedBox(height: 16),
                _SectionTitle(
                  title: 'Paket maintenance',
                  subtitle: 'Cek kuota dan periode paket aktif.',
                ),
                const SizedBox(height: 10),
                if (data.maintenance.isEmpty)
                  const _EmptyCard(
                    text: 'Belum ada paket maintenance untuk project ini.',
                  )
                else
                  ...data.maintenance.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _MaintenancePlanCard(item: item),
                    ),
                  ),
                const SizedBox(height: 16),
                _SectionTitle(
                  title: 'Request log',
                  subtitle:
                      'Monitoring request dari klien dan tindak lanjut tim.',
                ),
                const SizedBox(height: 10),
                if (data.maintenanceLogs.isEmpty)
                  const _EmptyCard(
                    text: 'Belum ada maintenance log untuk project ini.',
                  )
                else
                  ...data.maintenanceLogs.map(
                    (log) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _MaintenanceLogCard(log: log),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _AdminMonitorSnapshot {
  const _AdminMonitorSnapshot({
    required this.clients,
    required this.maintenanceLogs,
  });

  final List<AdminClient> clients;
  final List<MaintenanceRequestLog> maintenanceLogs;
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: const TextStyle(
            color: MitraColors.mutedForeground,
            fontSize: 12,
            height: 1.35,
          ),
        ),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.label,
    required this.value,
    required this.caption,
    this.accent = MitraColors.foreground,
  });

  final String label;
  final String value;
  final String caption;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: MitraColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: MitraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: MitraColors.mutedForeground,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: accent,
              fontSize: 26,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            caption,
            style: const TextStyle(
              color: MitraColors.mutedForeground,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

class _ClientCard extends StatelessWidget {
  const _ClientCard({required this.client, required this.onTap});

  final AdminClient client;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: MitraColors.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: MitraColors.border),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: MitraColors.muted,
              child: Text(
                initials(client.name),
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          client.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      if (client.isSuspended)
                        _TonePill(
                          text: 'Suspended',
                          color: MitraColors.destructive,
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    client.email,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: MitraColors.mutedForeground,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Buka untuk lihat project, timeline, dan request log.',
                    style: TextStyle(
                      color: MitraColors.mutedForeground,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right_rounded),
          ],
        ),
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.project, required this.onTap});

  final ProjectItem project;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: MitraColors.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: MitraColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    project.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                _TonePill(
                  text: projectStatusLabel(project.status),
                  color: projectStatusColor(project.status),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              project.description.isEmpty
                  ? 'Belum ada deskripsi project.'
                  : project.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: MitraColors.mutedForeground,
                fontSize: 13,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 10,
              runSpacing: 8,
              children: [
                _MiniInfo(label: 'PIC', value: project.picName),
                _MiniInfo(
                  label: 'Target',
                  value: project.targetEndDate.isEmpty
                      ? '-'
                      : project.targetEndDate,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.item});

  final ProjectProgressItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: MitraColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: MitraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              _TonePill(
                text: progressStatusLabel(item.status),
                color: progressStatusColor(item.status),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: (item.percentage.clamp(0, 100)) / 100,
              minHeight: 8,
              backgroundColor: MitraColors.muted,
              color: progressStatusColor(item.status),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${item.percentage}% • ${item.updateDate.isEmpty ? compactDate(item.createdAt) : item.updateDate}',
            style: const TextStyle(
              color: MitraColors.mutedForeground,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (item.notes.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              item.notes,
              style: const TextStyle(fontSize: 13, height: 1.35),
            ),
          ],
        ],
      ),
    );
  }
}

class _MaintenancePlanCard extends StatelessWidget {
  const _MaintenancePlanCard({required this.item});

  final ProjectMaintenanceItem item;

  @override
  Widget build(BuildContext context) {
    final quotaPercent = item.quotaLimit <= 0
        ? 0.0
        : (item.quotaUsed / item.quotaLimit).clamp(0, 1).toDouble();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: MitraColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: MitraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.packageName,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Kuota ${item.quotaUsed}/${item.quotaLimit}',
                  style: const TextStyle(
                    color: MitraColors.mutedForeground,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                'Sisa ${item.quotaLeft}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: quotaPercent,
              minHeight: 8,
              backgroundColor: MitraColors.muted,
              color: quotaPercent >= 0.9
                  ? MitraColors.destructive
                  : quotaPercent >= 0.7
                  ? MitraColors.warning
                  : MitraColors.success,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: [
              _MiniInfo(label: 'Mulai', value: item.startDate),
              _MiniInfo(label: 'Akhir', value: item.endDate),
            ],
          ),
        ],
      ),
    );
  }
}

class _MaintenanceLogCard extends StatelessWidget {
  const _MaintenanceLogCard({required this.log});

  final MaintenanceRequestLog log;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: MitraColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: MitraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  log.projectName.isEmpty ? 'Request klien' : log.projectName,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              _TonePill(
                text: progressStatusLabel(log.status),
                color: progressStatusColor(log.status),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            log.description,
            style: const TextStyle(
              color: MitraColors.foreground,
              fontSize: 13,
              height: 1.35,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: [
              _MiniInfo(
                label: 'Request',
                value: log.requestDate.isEmpty
                    ? compactDate(log.createdAt)
                    : log.requestDate,
              ),
              _MiniInfo(
                label: 'PIC',
                value: log.picName.isEmpty ? '-' : log.picName,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniInfo extends StatelessWidget {
  const _MiniInfo({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: MitraColors.muted,
        borderRadius: BorderRadius.circular(999),
      ),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(color: MitraColors.foreground, fontSize: 12),
          children: [
            TextSpan(
              text: '$label: ',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            TextSpan(
              text: value.isEmpty ? '-' : value,
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
    );
  }
}

class _TonePill extends StatelessWidget {
  const _TonePill({required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: MitraColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: MitraColors.border),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: MitraColors.mutedForeground,
          fontSize: 13,
        ),
      ),
    );
  }
}

class _StateMessage extends StatelessWidget {
  const _StateMessage({
    required this.title,
    required this.subtitle,
    required this.actionLabel,
    required this.onPressed,
  });

  final String title;
  final String subtitle;
  final String actionLabel;
  final Future<void> Function() onPressed;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: MitraColors.mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => onPressed(),
              child: Text(actionLabel),
            ),
          ],
        ),
      ),
    );
  }
}

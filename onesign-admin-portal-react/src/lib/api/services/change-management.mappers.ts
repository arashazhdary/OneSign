/** Maps backend Change Management DTOs to Admin Portal UI shapes. */

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

export interface ApiChangeSetDto {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  scopeId?: string;
  requestedByUserId: string;
  createdAt: string;
  updatedAt?: string | null;
  scheduledFor?: string | null;
  appliedAt?: string | null;
  itemCount?: number;
}

export interface ApiChangeSetDetailDto extends ApiChangeSetDto {
  items?: ApiChangeItemDto[];
  approvals?: ApiChangeApprovalDto[];
  executionLogs?: ApiChangeExecutionLogDto[];
  simulationResult?: ApiSimulationResultDto | null;
}

export interface ApiChangeItemDto {
  id: string;
  targetType: string;
  targetId: string;
  operation: string;
  currentValueJson?: string | null;
  proposedValueJson?: string | null;
}

export interface ApiChangeApprovalDto {
  id: string;
  approverUserId: string;
  decision: string;
  reason?: string | null;
  decidedAt: string;
}

export interface ApiChangeExecutionLogDto {
  id: string;
  step: string;
  status: string;
  message?: string | null;
  createdAt: string;
}

export interface ApiSimulationResultDto {
  impactedUsersCount: number;
  impactedAppsCount: number;
  privilegedUsersAffectedCount: number;
  policiesAffected: string[];
  automationWorkflowsAffected: string[];
  riskDirection: string;
  warnings: string[];
  recommendations: string[];
}

export const mapUiChangeSet = (
  dto: ApiChangeSetDto,
  extra?: { tenantId?: string; tenantName?: string }
) => ({
  id: String(dto.id),
  name: dto.title,
  description: dto.description ?? '',
  status: dto.status,
  targetModule: dto.category,
  changesJson: '{}',
  scheduledAt: dto.scheduledFor ?? undefined,
  appliedAt: dto.appliedAt ?? undefined,
  createdBy: String(dto.requestedByUserId),
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt ?? dto.createdAt,
  tenantId: extra?.tenantId ?? (dto.scopeId ? String(dto.scopeId) : undefined),
  tenantName: extra?.tenantName,
});

export const mapUiChangeSetDetails = (dto: ApiChangeSetDetailDto) => ({
  ...mapUiChangeSet(dto),
  changes: (dto.items ?? []).map((item) => ({
    id: String(item.id),
    type: item.targetType,
    entity: item.targetType,
    operation: item.operation,
    before: item.currentValueJson ? tryParseJson(item.currentValueJson) : null,
    after: item.proposedValueJson ? tryParseJson(item.proposedValueJson) : null,
  })),
  metadata: {
    estimatedImpact: dto.simulationResult?.riskDirection ?? 'Unknown',
    affectedResources: dto.items?.length ?? dto.itemCount ?? 0,
    requiredDowntime: '0 minutes',
  },
});

export const mapUiSimulation = (dto: ApiSimulationResultDto) => ({
  success: true,
  warnings: dto.warnings ?? [],
  errors: [] as string[],
  affectedEntities: [
    ...(dto.policiesAffected ?? []).map((name) => ({
      type: 'Policy',
      id: '',
      name,
      change: 'Affected',
    })),
    ...(dto.automationWorkflowsAffected ?? []).map((name) => ({
      type: 'Automation',
      id: '',
      name,
      change: 'Affected',
    })),
  ],
  estimatedDuration: 'N/A',
});

export const mapUiImpact = (dto: ApiSimulationResultDto) => ({
  riskLevel:
    dto.riskDirection === 'Increase'
      ? ('High' as const)
      : dto.riskDirection === 'Decrease'
        ? ('Low' as const)
        : ('Medium' as const),
  affectedUsers: dto.impactedUsersCount ?? 0,
  affectedGroups: 0,
  affectedApplications: dto.impactedAppsCount ?? 0,
  dependencies: (dto.policiesAffected ?? []).map((name) => ({
    type: 'Policy',
    name,
    impact: 'May change effective access',
  })),
  recommendations: dto.recommendations ?? [],
});

export const mapUiApprovals = (dto: ApiChangeApprovalDto[]) =>
  dto.map((a) => ({
    id: String(a.id),
    approverId: String(a.approverUserId),
    approverName: String(a.approverUserId),
    approverRole: 'Approver',
    decision: a.decision,
    comment: a.reason ?? '',
    timestamp: a.decidedAt,
  }));

export const mapUiExecutionLogs = (dto: ApiChangeExecutionLogDto[]) =>
  dto.map((log) => ({
    id: String(log.id),
    timestamp: log.createdAt,
    action: log.step,
    status: log.status,
    message: log.message ?? '',
    details: log.message ?? undefined,
  }));

export const mapUiChangeHistory = (dto: ApiChangeSetDto) => ({
  id: String(dto.id),
  changeSetId: String(dto.id),
  changeSetName: dto.title,
  tenantId: dto.scopeId ? String(dto.scopeId) : '',
  tenantName: '',
  action: dto.status === 'Applied' ? 'Applied' : dto.status === 'RolledBack' ? 'Rolled Back' : dto.status,
  performedBy: String(dto.requestedByUserId),
  performedAt: dto.appliedAt ?? dto.updatedAt ?? dto.createdAt,
  details: dto.description ?? '',
});

export const buildCreatePayload = (
  tenantId: string,
  userId: string,
  data: { name: string; description?: string; targetModule: string; changesJson?: string }
) => ({
  tenantId,
  userId,
  title: data.name,
  description: data.description,
  category: data.targetModule,
  items: [
    {
      targetType: data.targetModule,
      targetId: EMPTY_GUID,
      operation: 'Update',
      currentValueJson: null,
      proposedValueJson: data.changesJson ?? '{}',
      order: 0,
    },
  ],
});

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

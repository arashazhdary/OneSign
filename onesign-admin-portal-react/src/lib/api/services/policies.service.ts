import apiClient from '@/services/apiClient';

export interface PolicyDefinitionDto {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  effect: number;
  priority: number;
  enabled: boolean;
  createdAt: string;
  conditionGroups?: unknown[];
}

export interface PolicyEvaluationResultDto {
  isAllowed: boolean;
  matchedPolicies: string[];
  allowedScopes: string[];
  deniedScopes: string[];
  denyReason?: string | null;
}

export interface CreatePolicyRequest {
  tenantId: string;
  name: string;
  description: string;
  effect?: number;
  priority?: number;
  enabled: boolean;
  conditionGroups?: unknown[];
}

export interface UpdatePolicyRequest {
  name: string;
  description: string;
  effect?: number;
  priority?: number;
  enabled: boolean;
  conditionGroups?: unknown[];
}

export interface AssignPolicyRequest {
  tenantId: string;
  policyDefinitionId: string;
  targetType: number;
  targetKey: string;
  targetName?: string;
  order?: number;
}

export interface EvaluatePolicyRequest {
  tenantId: string;
  userId: string;
  clientId?: string;
  targetKey: string;
  targetType: number;
  context?: Record<string, unknown>;
}

const policyTypeTag = (type: string) => `[type:${type}]`;

export const parsePolicyType = (description: string): string => {
  const match = description.match(/\[type:(\w+)\]/);
  return match?.[1] ?? 'ABAC';
};

export const stripPolicyTypeTag = (description: string): string =>
  description.replace(/\s*\[type:\w+\]\s*/g, '').trim();

export const withPolicyTypeTag = (description: string, policyType: string): string => {
  const base = stripPolicyTypeTag(description);
  return base ? `${base} ${policyTypeTag(policyType)}` : policyTypeTag(policyType);
};

export const mapAssignEntityTypeToTargetType = (entityType: string): number => {
  switch (entityType) {
    case 'Application':
      return 0;
    case 'Scope':
    case 'User':
    case 'Role':
    case 'Group':
    case 'OrgUnit':
      return 1;
    default:
      return 2;
  }
};

export const policiesService = {
  getPolicies: async (tenantId: string, enabled?: boolean): Promise<PolicyDefinitionDto[]> => {
    const response = await apiClient.get<PolicyDefinitionDto[]>('/api/tenant/policies', {
      params: { tenantId, ...(enabled !== undefined ? { enabled } : {}) },
    });
    return response.data ?? [];
  },

  getPolicyById: async (policyId: string): Promise<PolicyDefinitionDto | null> => {
    try {
      const response = await apiClient.get<PolicyDefinitionDto>(`/api/tenant/policies/${policyId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  createPolicy: async (data: CreatePolicyRequest): Promise<PolicyDefinitionDto> => {
    const response = await apiClient.post<PolicyDefinitionDto>('/api/tenant/policies', data);
    return response.data;
  },

  updatePolicy: async (policyId: string, data: UpdatePolicyRequest): Promise<PolicyDefinitionDto> => {
    const response = await apiClient.put<PolicyDefinitionDto>(`/api/tenant/policies/${policyId}`, {
      id: policyId,
      ...data,
    });
    return response.data;
  },

  deletePolicy: async (policyId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/policies/${policyId}`);
  },

  assignPolicy: async (data: AssignPolicyRequest): Promise<string> => {
    const response = await apiClient.post<{ assignmentId: string }>('/api/tenant/policies/assign', data);
    return response.data.assignmentId;
  },

  evaluatePolicy: async (data: EvaluatePolicyRequest): Promise<PolicyEvaluationResultDto> => {
    const response = await apiClient.post<PolicyEvaluationResultDto>('/api/tenant/policies/evaluate', data);
    return response.data;
  },
};

export default policiesService;

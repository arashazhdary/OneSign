export interface AccessReview {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  type: 'user_access' | 'role_membership' | 'entitlement';
  reviewer: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  itemsTotal: number;
  itemsReviewed: number;
}

export interface Certification {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  scope: string[];
  reviewers: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  progress: number;
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  findings: number;
  generatedAt: string;
}

/**
 * مثال استفاده از API Services
 * این فایل نشان می‌دهد چگونه می‌توان صفحات را از fetch مستقیم به استفاده از services تبدیل کرد
 */

import { useState, useEffect } from 'react';
import { getTenantId } from '@/lib/tenant-context';
import {accessService, securityService, huntingService, lifecycleService, governanceService, platformService } from '@/lib/api/services';

// ========================================
// مثال 1: Privileged Access Management
// ========================================

export function PrivilegedAccessExample() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [jitGrants, setJitGrants] = useState<any[]>([]);

  useEffect(() => {
    setTenantId(getTenantId());
  }, []);

  // ✅ استفاده از service به جای fetch مستقیم
  const loadDashboard = async () => {
    if (!tenantId) return;
    try {
      const data = await accessService.getPrivilegedAccessDashboard(tenantId);
      setDashboard(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadSessions = async () => {
    if (!tenantId) return;
    try {
      const data = await accessService.getPrivilegedSessions(tenantId);
      setSessions(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadJITGrants = async () => {
    if (!tenantId) return;
    try {
      const data = await accessService.getJITGrants(tenantId);
      setJitGrants(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const revokeJITGrant = async (grantId: string) => {
    if (!tenantId) return;
    try {
      await accessService.revokeJITGrant(tenantId, grantId);
      await loadJITGrants(); // Reload
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const requestJITAccess = async (data: any) => {
    if (!tenantId) return;
    try {
      await accessService.requestJITAccess(tenantId, data);
      await loadJITGrants(); // Reload
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ... rest of component
}

// ========================================
// مثال 2: Adaptive Security
// ========================================

export function AdaptiveSecurityExample() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    setTenantId(getTenantId());
  }, []);

  const loadPolicies = async () => {
    if (!tenantId) return;
    try {
      const data = await securityService.getAdaptiveSecurityPolicies(tenantId);
      setPolicies(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createPolicy = async (policyData: any) => {
    if (!tenantId) return;
    try {
      await securityService.createAdaptiveSecurityPolicy(tenantId, policyData);
      await loadPolicies();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const enablePolicy = async (policyId: string) => {
    if (!tenantId) return;
    try {
      await securityService.enableAdaptiveSecurityPolicy(tenantId, policyId);
      await loadPolicies();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadSignals = async () => {
    if (!tenantId) return;
    try {
      const data = await securityService.getAdaptiveSecuritySignals(tenantId);
      setSignals(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getUserContext = async (userId: string) => {
    if (!tenantId) return;
    try {
      const context = await securityService.getUserSecurityContext(tenantId, userId);
      return context;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ... rest of component
}

// ========================================
// مثال 3: Threat Hunting
// ========================================

export function ThreatHuntingExample() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [savedQueries, setSavedQueries] = useState<any[]>([]);
  const [scheduledHunts, setScheduledHunts] = useState<any[]>([]);

  useEffect(() => {
    setTenantId(getTenantId());
  }, []);

  const loadSavedQueries = async () => {
    if (!tenantId) return;
    try {
      const data = await huntingService.getTenantSavedQueries(tenantId);
      setSavedQueries(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const executeQuery = async (oqlQuery: string) => {
    if (!tenantId) return;
    try {
      const results = await huntingService.executeTenantQuery(tenantId, {
        oqlExpression: oqlQuery,
        datasetType: 'AuditLogs',
        timeRange: { last: '24h' }
      });
      return results;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createSavedQuery = async (queryData: any) => {
    if (!tenantId) return;
    try {
      await huntingService.createTenantSavedQuery(tenantId, queryData);
      await loadSavedQueries();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadScheduledHunts = async () => {
    if (!tenantId) return;
    try {
      const data = await huntingService.getTenantScheduledHunts(tenantId);
      setScheduledHunts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createScheduledHunt = async (huntData: any) => {
    if (!tenantId) return;
    try {
      await huntingService.createTenantScheduledHunt(tenantId, huntData);
      await loadScheduledHunts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ... rest of component
}

// ========================================
// مثال 4: Lifecycle Management
// ========================================

export function LifecycleExample() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [accessPackages, setAccessPackages] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    setTenantId(getTenantId());
  }, []);

  const loadAccessPackages = async () => {
    if (!tenantId) return;
    try {
      const data = await lifecycleService.getAccessPackages(tenantId);
      setAccessPackages(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getUserTimeline = async (userId: string) => {
    if (!tenantId) return;
    try {
      const timeline = await lifecycleService.getUserTimeline(tenantId, userId);
      return timeline;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const syncWithHR = async () => {
    if (!tenantId) return;
    try {
      await lifecycleService.syncWithHR(tenantId);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadPolicies = async () => {
    if (!tenantId) return;
    try {
      const data = await lifecycleService.getLifecyclePolicies(tenantId);
      setPolicies(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ... rest of component
}

// ========================================
// مثال 5: Governance & Privacy
// ========================================

export function GovernanceExample() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [dataRequests, setDataRequests] = useState<any[]>([]);

  useEffect(() => {
    setTenantId(getTenantId());
  }, []);

  const loadCampaigns = async () => {
    if (!tenantId) return;
    try {
      const data = await governanceService.getCampaigns(tenantId);
      setCampaigns(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const searchAuditLogs = async (searchParams: any) => {
    if (!tenantId) return;
    try {
      const results = await governanceService.searchTenantAudit(tenantId, searchParams);
      return results;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadDataSubjectRequests = async () => {
    if (!tenantId) return;
    try {
      const data = await governanceService.getDataSubjectRequests(tenantId);
      setDataRequests(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createGDPRRequest = async (requestData: any) => {
    if (!tenantId) return;
    try {
      await governanceService.createDataSubjectRequest(tenantId, requestData);
      await loadDataSubjectRequests();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const executeDataRequest = async (requestId: string) => {
    if (!tenantId) return;
    try {
      await governanceService.executeDataSubjectRequest(tenantId, requestId);
      await loadDataSubjectRequests();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ... rest of component
}

// ========================================
// مثال 6: Platform Services
// ========================================

export function PlatformExample() {
  const [keysets, setKeysets] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loginHooks, setLoginHooks] = useState<any[]>([]);
  const [serviceAccounts, setServiceAccounts] = useState<any[]>([]);

  useEffect(() => {
    setTenantId(getTenantId());
  }, []);

  // Crypto Management
  const loadKeysets = async () => {
    try {
      const data = await platformService.getCryptoKeysets();
      setKeysets(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const rolloverKey = async (keysetId: string) => {
    try {
      await platformService.rolloverCryptoKey(keysetId);
      await loadKeysets();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Login Hooks
  const loadLoginHooks = async () => {
    if (!tenantId) return;
    try {
      const data = await platformService.getLoginHooks(tenantId);
      setLoginHooks(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createLoginHook = async (hookData: any) => {
    if (!tenantId) return;
    try {
      await platformService.createLoginHook(tenantId, hookData);
      await loadLoginHooks();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Service Accounts
  const loadServiceAccounts = async () => {
    if (!tenantId) return;
    try {
      const data = await platformService.getServiceAccounts(tenantId);
      setServiceAccounts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const rotateCredentials = async (accountId: string) => {
    if (!tenantId) return;
    try {
      await platformService.rotateServiceAccountCredentials(tenantId, accountId);
      await loadServiceAccounts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ... rest of component
}

'use client';

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  permissions: string[];
  settings?: Record<string, any>;
}

export interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Tenant Context Provider
 *
 * @example
 * <TenantProvider>
 *   <App />
 * </TenantProvider>
 */
export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenants and current tenant
  useEffect(() => {
    const loadTenants = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/tenants');
        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }

        const data = await response.json();
        setTenants(data);

        // Load current tenant from localStorage
        const savedTenantId = localStorage.getItem('currentTenantId');
        if (savedTenantId) {
          const tenant = data.find((t: Tenant) => t.id === savedTenantId);
          if (tenant) {
            setCurrentTenant(tenant);
          } else if (data.length > 0) {
            setCurrentTenant(data[0]);
            localStorage.setItem('currentTenantId', data[0].id);
          }
        } else if (data.length > 0) {
          setCurrentTenant(data[0]);
          localStorage.setItem('currentTenantId', data[0].id);
        }
      } catch (error) {
        console.error('Failed to load tenants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenants();
  }, []);

  const switchTenant = useCallback(
    async (tenantId: string) => {
      setIsLoading(true);
      try {
        const tenant = tenants.find((t) => t.id === tenantId);
        if (!tenant) {
          throw new Error('Tenant not found');
        }

        // TODO: Call API to switch tenant if needed
        await fetch('/api/tenants/switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId }),
        });

        setCurrentTenant(tenant);
        localStorage.setItem('currentTenantId', tenantId);
      } catch (error) {
        console.error('Failed to switch tenant:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [tenants]
  );

  const refreshTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/tenants');
      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(data);

      // Update current tenant if it still exists
      if (currentTenant) {
        const updatedTenant = data.find((t: Tenant) => t.id === currentTenant.id);
        if (updatedTenant) {
          setCurrentTenant(updatedTenant);
        }
      }
    } catch (error) {
      console.error('Failed to refresh tenants:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant]);

  const value: TenantContextType = {
    currentTenant,
    tenants,
    isLoading,
    switchTenant,
    refreshTenants,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

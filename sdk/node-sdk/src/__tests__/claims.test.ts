import { normalizeClaims } from '../claims';

describe('normalizeClaims', () => {
  it('maps standard and tenant claims', () => {
    const user = normalizeClaims({
      sub: 'user-1',
      email: 'a@b.com',
      tenant_id: 't-9',
      client_id: 'c-2',
      role: 'Admin',
      permission: 'users.read',
      org_unit_id: 'ou-1',
    });

    expect(user.sub).toBe('user-1');
    expect(user.email).toBe('a@b.com');
    expect(user.tenantId).toBe('t-9');
    expect(user.clientId).toBe('c-2');
    expect(user.roles).toContain('Admin');
    expect(user.permissions).toContain('users.read');
    expect(user.orgUnitIds).toContain('ou-1');
  });
});

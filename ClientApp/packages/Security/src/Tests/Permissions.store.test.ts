import { PermissionRoleItem, PermissionsStore } from '../Stores/Permissions.store';
import { expect } from 'chai';

describe('PermissionsStore', () => {
  let store: PermissionsStore;

  beforeEach(() => {
    store = new PermissionsStore();
  });

  it('should set roles correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(store.roles).to.equal(roles);
  });

  it('should set roles to empty array if no data provided', () => {
    store.setDataFromApi(null);
    expect(store.roles).to.equal([]);
  });

  it('should set roles to empty array if no roles provided', () => {
    store.setDataFromApi({});
    expect(store.roles).to.equal([]);
  });

  it('should set permissions correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(Array.from(store.permissions.values())).to.equal(['read', 'write']);
  });

  it('should check role correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(store.hasRole('Admin')).to.be.true;
    expect(store.hasRole('User')).to.be.false;
  });

  it('should check all roles correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
      {
        RoleId: '2',
        Name: 'User',
        Enabled: true,
        Description: 'User role',
        Permissions: ['read'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(store.hasAllRoles(['Admin', 'User'])).to.be.true;
    expect(store.hasAllRoles(['Admin', 'Guest'])).to.be.false;
  });

  it('should check any role correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
      {
        RoleId: '2',
        Name: 'User',
        Enabled: true,
        Description: 'User role',
        Permissions: ['read'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(store.hasAnyRole(['Admin', 'User'])).to.be.true;
    expect(store.hasAnyRole(['Admin', 'Guest'])).to.be.true;
    expect(store.hasAnyRole(['Guest', 'Manager'])).to.be.false;
  });

  it('should check permission correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(store.hasPermission('read')).to.be.true;
    expect(store.hasPermission('delete')).to.be.false;
  });

  it('should check all permissions correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(store.hasAllPermissions(['read', 'write'])).to.be.true;
    expect(store.hasAllPermissions(['read', 'delete'])).to.be.false;
  });

  it('should check any permission correctly', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    expect(store.hasAnyPermission(['read', 'write'])).to.be.true;
    expect(store.hasAnyPermission(['read', 'delete'])).to.be.true;
    expect(store.hasAnyPermission(['delete', 'update'])).to.be.false;
  });

  it('should reset roles and permissions', () => {
    const roles: PermissionRoleItem[] = [
      {
        RoleId: '1',
        Name: 'Admin',
        Enabled: true,
        Description: 'Admin role',
        Permissions: ['read', 'write'],
      },
    ];

    store.setDataFromApi({ Roles: roles});
    store.reset();
    expect(store.roles).to.equal([]);
    expect(store.permissions.size).to.equal(0);
  });
});
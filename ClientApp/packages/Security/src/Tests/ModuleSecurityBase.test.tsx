import { ModuleSecurityBase } from '../Tools';
import sinon from 'sinon';
import { expect } from 'chai';

describe('ModuleSecurityBase', () => {
  it('should check if isEditable is false', () => {
    const moduleSecurity = new ModuleSecurityBase('example');
    const getModulePermissionsSpy = sinon.spy(moduleSecurity.modulePermissionsStore, 'getModulePermissions');
    const isEditable = moduleSecurity.isEditable;
    expect(isEditable).to.be.false;
    getModulePermissionsSpy.restore();
  });
});

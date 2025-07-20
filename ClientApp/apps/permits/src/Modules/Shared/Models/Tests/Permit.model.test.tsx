import { expect } from 'chai';
import { SettingsTypeModel } from '@wings-shared/core';
import { PermitAppliedModel, PermitModel } from '../index';

describe('Permit Model', () => {
  it('should get Permits Applied Request with length 0', () => {
    const permitRequest = new PermitModel({
      id: 1,
      permitApplied: new PermitAppliedModel(),
    });
    expect(permitRequest.permitsAppliedRequest).length(0);
  });

  it('should get Permits Applied Request having PermitsApplied', () => {
    const permitRequest = new PermitModel({
      id: 1,
      permitApplied: new PermitAppliedModel({
        id: 1,
        permitAppliedTo: new SettingsTypeModel({ id: 1 }),
        isADIZ: true,
      }),
    });
    expect(permitRequest.permitApplied.isADIZ).to.be.true;
    expect(permitRequest.permitsAppliedRequest).length(1);
  });
});

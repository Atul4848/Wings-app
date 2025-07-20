import * as React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { EtpPenaltyModel, EtpSettingsStoreMock } from '../../Shared';
import { EtpPenaltiesGrid } from '../Components';
import { AgGridTestingHelper } from '@wings/shared';

describe('Etp Penalties grid Module', () => {
  let wrapper: any;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    isEditable: true,
    rowData: [new EtpPenaltyModel({ biasFields: 20 }), new EtpPenaltyModel({ biasFields: 55 })],
    etpSettingsStore: new EtpSettingsStoreMock(),
    onDataUpdate: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = mount(<EtpPenaltiesGrid {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });
});

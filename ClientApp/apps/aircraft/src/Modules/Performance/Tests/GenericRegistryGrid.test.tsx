import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AgGridTestingHelper } from '@wings/shared';
import { GenericRegistryModel } from '../../Shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import GenericRegistryGrid from '../Component/GenericRegistryGrid/GenericRegistryGrid';

describe('Performance Generic registry grid', () => {
  let wrapper: ShallowWrapper;
  let modal: ShallowWrapper;
  let agGridHelper: AgGridTestingHelper;

  const props = {
    classes: {},
    rowData: [new GenericRegistryModel()],
  };

  beforeEach(() => {
    wrapper = shallow(<GenericRegistryGrid {...props} />);
    agGridHelper = new AgGridTestingHelper(wrapper);
    agGridHelper.initAgGridAPI();
  });

  afterEach(() => {
    wrapper.unmount();
    ModalStore.data = null;
  });

  it('should be rendered without errors, render CustomAgGridReact', () => {
    expect(wrapper).to.be.ok;
    expect(wrapper.find(CustomAgGridReact)).to.be.ok;
  });
});

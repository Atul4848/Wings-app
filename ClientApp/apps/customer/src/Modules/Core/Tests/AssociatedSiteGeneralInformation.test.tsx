import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { AssociatedSiteGeneralInformation, CustomerStoreMock, SiteStoreMock } from '../../Shared';
import { ViewInputControlsGroup } from '@wings-shared/form-controls';
import sinon from 'sinon';

describe('AssociatedSiteGeneralInformation', () => {
  let wrapper: ShallowWrapper;

  const props = {
    customerStore: new CustomerStoreMock(''),
    siteStore: new SiteStoreMock(''),
    onValueChange: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = shallow(<AssociatedSiteGeneralInformation {...props} />).dive();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('should return proper field by calling fieldProp', () => {
    const viewInputControlsGroup = wrapper.find(ViewInputControlsGroup);
    const field = viewInputControlsGroup.prop('field')('name');
    expect(field.label).to.eq('Site Name');
    props.onValueChange('TEST', 'name');
    expect(props.onValueChange.calledWith('TEST', 'name')).to.be.true;
  });
});

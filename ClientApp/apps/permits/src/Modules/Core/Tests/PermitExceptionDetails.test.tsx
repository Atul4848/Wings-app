import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import { PermitExceptionDetails } from '../Components';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { PermitExceptionRuleModel, PermitModel } from '../../Shared';

describe('Permits Exception Details Component', () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(
      <PermitExceptionDetails
        permitData={
          new PermitModel({
            permitExceptionRules: [
              new PermitExceptionRuleModel({ id: 1, name: 'TEST' }),
              new PermitExceptionRuleModel({ id: 1, name: 'New TEST' }),
            ],
          })
        }
      />
    )
      .dive()
      .shallow();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render CustomAgGridReact', () => {
    expect(wrapper.find(CustomAgGridReact)).to.have.length(1);
  });
});

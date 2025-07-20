import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PermitGroupViewInputControls } from '../Components';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';

describe('Permit Group View Input Controls', () => {
  let wrapper: ShallowWrapper;

  const props = {
    isEditable: true,
    onGetField: sinon.spy(),
    groupInputControls: [
      {
        title: 'TEST',
        inputControls: [
          {
            fieldKey: 'country',
            type: EDITOR_TYPES.DROPDOWN,
            autoSelect: true,
            options: [],
          },
          {
            fieldKey: 'isException',
            type: EDITOR_TYPES.CHECKBOX,
            isExists: true,
          },
        ],
      },
    ],
    onValueChange: sinon.spy(),
  };

  beforeEach(() => {
    wrapper = shallow(<PermitGroupViewInputControls {...props} />).dive();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should call on value change', () => {
    wrapper.find(ViewInputControl).at(0).simulate('valueChange');
    expect(props.onValueChange.called).to.be.true;
  });
});

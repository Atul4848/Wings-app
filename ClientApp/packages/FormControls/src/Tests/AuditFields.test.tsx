import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';
import { AuditFields, ViewInputControl } from '../Components';
import { EDITOR_TYPES } from '../Enums';


describe('Audit Fields Component', function() {
  let wrapper: ShallowWrapper;
  const props = {
    classes: {},
    isEditable: true,
    onGetField: sinon.fake(),
    isNew: false,
    fieldControls: [
      {
        fieldKey: 'createdBy',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
      {
        fieldKey: 'ModifiedBy',
        type: EDITOR_TYPES.TEXT_FIELD,
      },
    ],
  };

  beforeEach(function() {
    wrapper = shallow(<AuditFields {...props} />).dive();
  });

  it('should render without error', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should render ViewInputControl component', function() {
    wrapper.setProps({ fieldControls: props.fieldControls });
    expect(wrapper.find(ViewInputControl)).to.have.length(2);
  });
});

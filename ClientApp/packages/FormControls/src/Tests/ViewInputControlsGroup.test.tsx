import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';
import { ViewInputControl, ViewInputControlsGroup } from '../Components';

describe('ViewInputControlsGroup Component', function() {
  let wrapper: ShallowWrapper;
  const props = {
    groupInputControls: [
      {
        title: 'Test',
        inputControls: [],
        className: 'abc',
        inputControlClassName: 'xyz',
      },
    ],
    isEditing: true,
    onValueChange: sinon.fake(),
    field:sinon.fake()
  };

  beforeEach(function() {
    wrapper = shallow(<ViewInputControlsGroup {...props} />);
  });

  it('should render without error', function() {
    expect(wrapper).to.have.length(1);
  });

  it('should not rendered ViewInputControl component', function() {
    wrapper.setProps({ groupInputControls: null });
    expect(wrapper.find(ViewInputControl)).to.have.length(0);
  });

  it('should render ViewInputControl component', function() {
    expect(wrapper.dive().find(ViewInputControl)).exist;
  });

  it('should simulate value change on ViewInputControl', function() {
    const spyValueChange = sinon.spy();
    const newValue = 'new value';

    // Find the ViewInputControl components and simulate a value change
    const viewInputControls = wrapper.find(ViewInputControl);
    viewInputControls.forEach((viewInputControl, index) => {
      viewInputControl.prop('onValueChange')(newValue);
      expect(spyValueChange.calledWith(newValue, props.groupInputControls[0].inputControls[index].field)).to.be.true;
    });
  });
});

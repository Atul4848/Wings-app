import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { it } from 'mocha';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { Coordinate, IOptionValue } from '@wings-shared/core';
import { EDITOR_TYPES } from '../Enums';
import { ViewInputControl } from '../Components';
import { PureLatLongEditor } from '../Components/LatLongEditor/LatLongEditor';

describe('LatLongEditor Component', function() {
  let wrapper: ShallowWrapper;
  let wrapperInstance;
  let popperContent: ShallowWrapper;

  const fields = [
    {
      fieldKey: 'lat',
      type: EDITOR_TYPES.TEXT_FIELD,
    },
    {
      fieldKey: 'min',
      type: EDITOR_TYPES.TEXT_FIELD,
    },
    {
      fieldKey: 'sec',
      type: EDITOR_TYPES.TEXT_FIELD,
    },
    {
      fieldKey: 'dir',
      type: EDITOR_TYPES.DROPDOWN,
      options: [{ label: 'W', value: 'W' }],
    },
  ];

  const props = {
    classes: {},
    value: 'Test',
    isOpen: true,
    coordinate: Coordinate.LAT,
    toggleElement: undefined,
    fields: fields,
    onOkClick: sinon.fake(),
    close: sinon.fake(),
  };

  const valueChange = (index: number, value: IOptionValue, fieldKey: string) =>
    popperContent.find(ViewInputControl).at(index).simulate('valueChange', value, fieldKey);

  beforeEach(function () {
    wrapper = shallow(<PureLatLongEditor {...props} />);
    wrapperInstance = wrapper.instance();
    popperContent = shallow(<div>{wrapperInstance.popperContent}</div>);
  });

  afterEach(function () {
    wrapper.unmount();
  });

  it('should be rendered without error', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should close the popover from onClose Button', () => {
    wrapper.find(PrimaryButton).at(0).simulate('click');
    expect(props.close.calledOnce).to.be.true;
  });

  it('should close the popover from onOk Button', () => {
    wrapper.find(PrimaryButton).at(1).simulate('click');
    expect(props.onOkClick.called).to.be.true;
  });

  it('should call onValueChange', () => {
    valueChange(1, 'Test', 'lat');
    expect(wrapperInstance.getField('lat').value).to.eq('Test');
  });
});

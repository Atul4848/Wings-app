import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { VIEW_MODE } from '@wings/shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { FeatureNoteDialog } from '../Components';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Feature Note Dialog', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: ShallowWrapper;

  const props = {
    classes: {},
    featureNotes: [],
    addFeatureNote: sinon.fake(),
    viewMode: VIEW_MODE.EDIT,
  };

  const renderView = props => {
    wrapper = shallow(<FeatureNoteDialog {...props} />).shallow();
    instance = wrapper.instance();
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
  };

  beforeEach(() => renderView(props));

  afterEach(() => {
    wrapper.unmount();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.be.ok;
  });

  it('save button should call addFeatureNote on props', () => {
    dialogContent.find(PrimaryButton).simulate('click');
    expect(props.addFeatureNote.calledOnce).to.true;
  });

  it('close button should close dialog', () => {
    const closeSpy = sinon.fake();
    ModalStore.close = closeSpy;
    wrapper.find(Dialog).simulate('Close');
    expect(closeSpy.called).to.be.true;
  });

  it('onValueChange should be called on ViewInputControl change', () => {
    const mockValueChange = sinon.fake();
    instance.onValueChange = mockValueChange;
    dialogContent.find(ViewInputControl).at(0).simulate('ValueChange');
    expect(mockValueChange.called).to.be.true;
  })

  it('onValueChange should update form value', () => {
    const mockFormUpdate = sinon.fake();
    instance.getField('title').set = mockFormUpdate;
    instance.onValueChange('test', 'title');
    expect(mockFormUpdate.called).to.be.true;
  });
});

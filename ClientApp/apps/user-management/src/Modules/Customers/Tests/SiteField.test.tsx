import React from 'react';
import { VIEW_MODE } from '@wings/shared';
import { expect } from 'chai';
import { shallow, ShallowWrapper } from 'enzyme';
import sinon from 'sinon';
import { SitesModel } from '../../Shared';
import { Dialog } from '@uvgo-shared/dialog';
import { Button } from '@material-ui/core';
import { PureSiteField } from '../Components/SiteField/SiteField';
import { ViewInputControl } from '@wings-shared/form-controls';

describe('Site Field', () => {
  let wrapper: ShallowWrapper;
  let instance: any;
  let dialogContent: any;

  const props = {
    classes: {},
    title: '',
    siteField: new SitesModel(),
    viewMode: VIEW_MODE.NEW,
    sitesField: [new SitesModel({ name: 'test' })],
    upsertSiteField: sinon.fake(), 
  };

  beforeEach(() => {
    wrapper = shallow(<PureSiteField {...props} />);
    dialogContent = shallow(<div>{wrapper.find(Dialog).prop('dialogContent')()}</div>);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
    sinon.restore();
  });

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('should render ViewInputControls', () => {
    expect(dialogContent.find(ViewInputControl)).to.have.length(2);
  });

  it('should call upsertSiteField method on click of save button', () => {
    dialogContent.find(Button).simulate('click');
    expect(props.upsertSiteField.called).to.be.true;
  });
  
});

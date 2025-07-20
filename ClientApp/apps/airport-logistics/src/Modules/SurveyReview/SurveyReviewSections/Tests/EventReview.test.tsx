import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from "chai";
import MobxReactForm from 'mobx-react-form';
import { getFormValidation } from '@wings-shared/core';
import { EventEditor, EventReview } from '../EventAndPertinent';
import { SurveyReviewLabel, SurveyReviewNoDataLabel } from '../SurveyReviewSection';
import { EventModel } from '../../../Shared/Models';

describe('EventReview Component', () => {
  let wrapper: ShallowWrapper;
  let form: MobxReactForm;

  const fields = {
    testField: {
      label: 'Test field label',
      placeholder: 'Test field placeholder',
      rules: 'string',
      value: 'Test value',
    },
  };

  beforeEach(() => {
    form = getFormValidation(fields);
    wrapper = shallow(<EventReview field={form.$('testField')} isEditMode={true}/>)
  })

  it('should be rendered without errors', () => {
    expect(wrapper).to.have.length(1);
  });

  it('approvedData does not render SurveyReviewNoDataLabel or SurveyReviewLabel if unApproved or isEditMode', () => {
    wrapper.setProps({ unApproved: null, isEditMode: true });
    expect(wrapper.dive().find(SurveyReviewNoDataLabel)).to.have.length(0);
    expect(wrapper.dive().find(SurveyReviewLabel)).to.have.length(0);
  });

  it('approvedData should render SurveyReviewNoDataLabel if approved is not provided', () => {
    wrapper.setProps({ unApproved: null, isEditMode: false, approved: [] });
    expect(wrapper.dive().find(SurveyReviewNoDataLabel)).to.have.length(1);
    expect(wrapper.dive().find(SurveyReviewLabel)).to.have.length(0);
  });

  it('should render EventEditor if isEditMode is true', () => {
    const approved: EventModel[] = [ new EventModel(), new EventModel() ];
    wrapper.setProps({
      unApproved: false,
      approved
    });
    expect(wrapper.dive().find(EventEditor)).to.have.length(1);
  });

  it('approvedData should not render SurveyReviewNoDataLabel if approved provided', () => {
    const approved: EventModel[] = [ new EventModel(), new EventModel() ];
    wrapper.setProps({
      unApproved: null,
      isEditMode: false,
      approved
    });
    expect(wrapper.dive().find(SurveyReviewNoDataLabel)).to.have.length(0);
  });

  it('approvedData should not render null events', () => {
    const approved: EventModel[] = [ null, new EventModel({ id: 1,  name: 'Test' }) ];
    wrapper.setProps({
      unApproved: null,
      isEditMode: false,
      approved
    });

    expect(wrapper.dive().contains(<div>{approved[1].name}</div>)).to.equal(true);
  });

  it('unApprovedData does not render SurveyReviewNoDataLabel or SurveyReviewLabel if unApproved or isEditMode', () => {
    wrapper.setProps({ approved: [], isEditMode: true });
    expect(wrapper.dive().find(SurveyReviewNoDataLabel)).to.have.length(0);
    expect(wrapper.dive().find(SurveyReviewLabel)).to.have.length(0);
  });

  it('unApprovedData should render SurveyReviewNoDataLabel if approved is not provided', () => {
    wrapper.setProps({ approved: null, isEditMode: false, unApproved: [] });
    expect(wrapper.dive().find(SurveyReviewNoDataLabel)).to.have.length(1);
    expect(wrapper.dive().find(SurveyReviewLabel)).to.have.length(0);
  });

  it('unApprovedData should not render SurveyReviewNoDataLabel if unApproved provided', () => {
    const unApproved: EventModel[] = [ new EventModel(), new EventModel() ];
    wrapper.setProps({
      approved: null,
      unApproved
    });
    expect(wrapper.dive().find(SurveyReviewNoDataLabel)).to.have.length(0);
  });

  it('unApprovedData should not render null events', () => {
    const unApproved: EventModel[] = [ null, new EventModel({ id: 1,  name: 'Test' }) ];
    wrapper.setProps({
      unApproved,
      isEditMode: false,
      approved: null
    });

    expect(wrapper.dive().contains(<div>{unApproved[1].name}</div>)).to.equal(true);
  });
})

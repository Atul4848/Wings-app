import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { expect } from 'chai';

import { SurveyReviewBody } from '../SurveyReviewBody';
import { AirportLogisticsStore, StepperStore } from '../../Shared/Stores';
import { Provider } from 'mobx-react';
import { ArrivalLogisticsCrewPax, Ciq, GroundLogisticsAndParking } from '../SurveyReviewSections';
import { ArrivalLogisticsModel, CiqModel } from '../../Shared/Models';
import { StepperKeeper } from '../../Shared/Components';
import { of } from 'rxjs';
import { PureSurveyReview } from '../SurveyReview';
import { AirportLogisticsStoreMock } from '../../Shared/Mocks';
import { SurveyReviewHeader } from '../SurveyReviewHeader';
import SurveyReviewFooter from '../SurveyReviewFooter/SurveyReviewFooter';

describe('SurveyReview Module component', function() {
  let wrapper: ReactWrapper;
  const stepperStore = StepperStore;
  const airportLogisticsStore = new AirportLogisticsStoreMock();
  const props = {
    classes: {},
    params: { id: '1' },
  };

  beforeEach(() => {
    wrapper = mount(
      <Provider stepperStore={stepperStore} airportLogisticsStore={airportLogisticsStore}>
        <PureSurveyReview {...props} />
      </Provider>
    );
  });

  it('should be rendered without errors', () => {
    expect(wrapper.find(PureSurveyReview)).to.have.length(1);
  });

  it('should have header', () => {
    expect(wrapper.find(SurveyReviewHeader)).to.have.length(1);
  });

  it('should have body', () => {
    expect(wrapper.find(SurveyReviewBody)).to.have.length(1);
  });

  it('should have footer', () => {
    expect(wrapper.find(SurveyReviewFooter)).to.have.length(1);
  });
});

import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { withStyles } from '@material-ui/core';
import { SurveyReviewLabel, SurveyReviewNoDataLabel } from '../../SurveyReviewSection';
import { EventModel, EVENT_PERTINENT } from '../../../../Shared';
import EventEditor from '../EventEditor/EventEditor';
import { Field } from 'mobx-react-form';
import { IClasses } from '@wings-shared/core';

import { styles } from './EventReview.styles';

type Props = {
  approved?: EventModel[];
  unApproved?: EventModel[];
  isEditMode: boolean;
  field: Field;
  classes?: IClasses;
};

@observer
class EventReview extends Component<Props> {
  private get editor(): ReactNode {
    if (!this.props.isEditMode) {
      return null;
    }

    return (
      <EventEditor
        field={this.props.field}
      />
    );
  }

  @computed
  private get approvedData(): ReactNode {
    const { approved, unApproved, isEditMode } = this.props;

    if (unApproved || isEditMode) {
      return null;
    }

    if (!approved?.length) {
      return <SurveyReviewNoDataLabel isApproved={true} />
    }

    return (
      <Fragment>
        <SurveyReviewLabel isApproved={true} />
        {approved?.map(event => this.getEvent(event))}
      </Fragment>
    );
  }

  @computed
  private get unApprovedData(): ReactNode {
    const { approved, unApproved, isEditMode } = this.props;

    if (approved || isEditMode) {
      return null;
    }

    if (!unApproved?.length) {
      return <SurveyReviewNoDataLabel />
    }

    return (
      <Fragment>
        <SurveyReviewLabel />
        {unApproved?.map(event => this.getEvent(event))}
      </Fragment>
    );
  }

  private getEvent(event: EventModel): ReactNode {
    const { classes } = this.props;

    if (!event) {
      return null;
    }

    return (
      <div className={classes.container} key={event.id}>
        <div className={classes.section}>
          <div className={classes.label}>
            {EVENT_PERTINENT.NAME}
          </div>
          <div>{event.name}</div>
        </div>
        <div className={classes.section}>
          <div className={classes.label}>
            {EVENT_PERTINENT.START_DATE}
          </div>
          <div>{event.startDate}</div>
        </div>
        <div className={classes.section}>
          <div className={classes.label}>
            {EVENT_PERTINENT.END_DATE}
          </div>
          <div>{event.endDate}</div>
        </div>
        <div className={classes.section}>
          <div className={classes.label}>
            {EVENT_PERTINENT.HOTEL_SHORTAGE}
          </div>
          <div>{event.hotelShortage}</div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        {this.unApprovedData}
        {this.approvedData}
        {this.editor}
      </Fragment>
    );
  }
}
export default withStyles(styles)(EventReview);

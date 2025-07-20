import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, computed, reaction } from 'mobx';
import { withStyles } from '@material-ui/core';
import { OperatingHoursModel } from './../../../../../Shared/Models/index';
import { OperatingHours } from './../../../../OperatingHours/OperatingHours';
import { SurveyHoursEditor } from './../../../../SurveyEditor';
import { SurveyReviewLabel } from './../../../SurveyReviewSection';
import { Field } from 'mobx-react-form';
import { IClasses } from '@wings-shared/core';
import { styles } from './../../../SurveyReviewSection/SurveyReviewSection.styles';


type Props = {
  approved?: any;
  unApproved?: any;
  isEditMode?: boolean;
  field: Field;
  classes?: IClasses;
};

@observer
class FboOperatingHours extends Component<Props> {

  private get editor(): ReactNode {
    if (!this.props.isEditMode) {
      return null;
    }

    return (
      <SurveyHoursEditor
        field={this.props.field.select('operatingHours')}
      />
    );
  }


  private getHours(operatingHours: OperatingHoursModel[]): ReactNode {
    if (!operatingHours?.length) {
      return null;
    }

    return (
      <Fragment>
        <OperatingHours hours={operatingHours} />
      </Fragment>
    );
  }

  @computed
  private get unApprovedData(): ReactNode {
    const { unApproved, isEditMode } = this.props;

    if (!unApproved || isEditMode) {
      return null;
    }

    return (
      <Fragment>
        <SurveyReviewLabel />
        {this.getHours(unApproved?.operatingHours)}
      </Fragment>
    );
  }

  @computed
  private get approvedData(): ReactNode {
    const { approved, isEditMode } = this.props;

    if (!approved || isEditMode) {
      return null;
    }

    return (
      <Fragment>
        <SurveyReviewLabel isApproved={true} />
        {this.getHours(approved?.operatingHours)}
      </Fragment>
    );
  }

  @action
  setDefaultValues(): void {
    this.props.field.set('value', this.props.unApproved);
  }

  componentDidMount(): void {
    reaction(
      () => this.props.isEditMode,
      (isEditMode: boolean) => isEditMode && this.setDefaultValues(),
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

export default withStyles(styles)(FboOperatingHours);

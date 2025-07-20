import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, computed, reaction } from 'mobx';
import { withStyles } from '@material-ui/core';
import { OperatingHoursModel } from './../../../../../Shared/Models/index';
import { OperatingHours } from './../../../../OperatingHours/OperatingHours';
import { CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY, CiqMainTerminalModel } from './../../../../../Shared';
import { SurveyReviewLabel } from '../../../SurveyReviewSection';
import CiqMainTerminalEditor from './CiqMainTerminalEditor';
import { Field } from 'mobx-react-form';
import { styles } from './../../../SurveyReviewSection/SurveyReviewSection.styles';
import { IClasses, emptyLabel } from '@wings-shared/core';

type Props = {
  approved?: CiqMainTerminalModel;
  unApproved?: CiqMainTerminalModel;
  isEditMode?: boolean;
  field: Field;
  classes?: IClasses;
};

@observer
class CiqMainTerminal extends Component<Props> {
  private get editor(): ReactNode {
    if (!this.props.isEditMode) {
      return null;
    }

    return <CiqMainTerminalEditor field={this.props.field} />;
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

  private getDetails(item: CiqMainTerminalModel): ReactNode {
    const { classes } = this.props;
    return (
      <div className={classes.hourDetails}>
        <div className={classes.hourDetailsRow}>
          <div className={classes.hourDetailLabel}>
            {CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.IS_OVER_TIME_POSSIBLE}
          </div>
          <div className={classes.hourDetailValue}>{item.ciqOvertimeRequired || emptyLabel}</div>
        </div>
      </div>
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
        {this.getDetails(unApproved)}
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
        {this.getDetails(approved)}
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
      (isEditMode: boolean) => isEditMode && this.setDefaultValues()
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

export default withStyles(styles)(CiqMainTerminal);

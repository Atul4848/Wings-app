import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, computed, reaction } from 'mobx';
import { withStyles } from '@material-ui/core';
import { OperatingHoursModel, CiqGeneralAviationTerminalModel } from '../../../../../Shared/Models/index';
import { CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY } from './../../../../../Shared';
import { SurveyReviewLabel } from '../../../SurveyReviewSection';
import { OperatingHours } from '../../../../OperatingHours/OperatingHours';
import GeneralAviationTerminalEditor from './GeneralAviationTerminalEditor';
import { Field } from 'mobx-react-form';
import { IClasses, emptyLabel } from '@wings-shared/core';

import { styles } from '../../../SurveyReviewSection/SurveyReviewSection.styles';

type Props = {
  approved?: CiqGeneralAviationTerminalModel;
  unApproved?: CiqGeneralAviationTerminalModel;
  isEditMode?: boolean;
  field: Field;
  classes?: IClasses;
};

@observer
class GeneralAviationTerminal extends Component<Props> {
  private get editor(): ReactNode {
    const { field, isEditMode } = this.props;
    if (!isEditMode) {
      return null;
    }

    return <GeneralAviationTerminalEditor field={field} />;
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

  private getDetails(item: CiqGeneralAviationTerminalModel): ReactNode {
    const { classes } = this.props;

    return (
      <div className={classes.hourDetails}>
        <div className={classes.hourDetailsRow}>
          <div className={classes.hourDetailLabel}>{CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.GAT_COST}</div>
          <div className={classes.hourDetailValue}>{item.costPair.value || emptyLabel}</div>
        </div>
        <div className={classes.hourDetailsRow}>
          <div className={classes.hourDetailLabel}>{CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.GAT_COST_TYPE}</div>
          <div className={classes.hourDetailValue}>{item.costPair.unit || emptyLabel}</div>
        </div>
        <div className={classes.hourDetailsRow}>
          <div className={classes.hourDetailLabel}>
            {CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.CIQ_AVAILABLE_AT_GAT_FBO}
          </div>
          <div className={classes.hourDetailValue}>{item.ciqAvailableLabel || item.ciqAvailable || emptyLabel}</div>
        </div>
        <div className={classes.hourDetailsRow}>
          <div className={classes.hourDetailLabel}>{CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.CIQ_HOURS_LIMITED}</div>
          <div className={classes.hourDetailValue}>
            {item.limitedHoursPossibleLabel || item.limitedHoursPossible || emptyLabel}
          </div>
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

export default withStyles(styles)(GeneralAviationTerminal);

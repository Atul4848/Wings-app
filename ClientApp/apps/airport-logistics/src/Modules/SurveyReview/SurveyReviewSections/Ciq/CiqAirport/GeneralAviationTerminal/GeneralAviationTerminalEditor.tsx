import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { SurveyRadioEditor, SurveyValueUnitPairEditor } from './../../../../SurveyEditor/index';
import { Field } from 'mobx-react-form';
import { SurveyHoursEditor } from './../../../../SurveyEditor';
import { CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY } from './../../../../../Shared';
import { IClasses } from '@wings-shared/core';

import { styles } from './../../../SurveyReviewSection/SurveyReviewSection.styles';

type Props = {
  field: Field;
  classes?: IClasses;
};

@observer
class GeneralAviationTerminalEditor extends Component<Props> {
  private get getTextFields(): ReactNode {
    const { classes, field } = this.props;

    return (
      <Fragment>
        <div className={classes.fieldContainer}>
          <SurveyValueUnitPairEditor field={field.select('costPair')} />
        </div>
        <div className={classes.fieldContainer}>
          <div className={classes.fieldLabel}>{CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.CIQ_AVAILABLE_AT_GAT_FBO}</div>
          <SurveyRadioEditor field={field.select('ciqAvailable')} />
        </div>
        <div className={classes.fieldContainer}>
          <div className={classes.fieldLabel}>{CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.CIQ_HOURS_LIMITED}</div>
          <SurveyRadioEditor field={field.select('limitedHoursPossible')} />
        </div>
      </Fragment>
    );
  }

  render() {
    return (
      <Fragment>
        <SurveyHoursEditor field={this.props.field.select('operatingHours')} />
        {this.getTextFields}
      </Fragment>
    );
  }
}

export default withStyles(styles)(GeneralAviationTerminalEditor);

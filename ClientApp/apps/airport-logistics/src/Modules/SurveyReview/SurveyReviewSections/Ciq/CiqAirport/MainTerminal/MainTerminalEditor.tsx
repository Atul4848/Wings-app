import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { SurveyRadioEditor } from './../../../../SurveyEditor/index';
import { CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY } from './../../../../../Shared';
import { Field } from 'mobx-react-form';
import { SurveyHoursEditor, SurveyValueEditor } from './../../../../SurveyEditor';
import { IClasses } from '@wings-shared/core';
import { styles } from './../../../SurveyReviewSection/SurveyReviewSection.styles';

type Props = {
  field: Field;
  classes?: IClasses;
};

@observer
class MainTerminalEditor extends Component<Props> {
  render() {
    const { classes, field } = this.props;

    return (
      <Fragment>
        <SurveyHoursEditor field={field.$('operatingHours')} />
        <div className={classes.fieldContainer}>
          <div className={classes.fieldLabel}>
            {CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.IS_CIQ_REQUIRED_MAIN_TERMINAL}
          </div>
          <SurveyRadioEditor field={field.select('ciqRequired')} />
        </div>
        <div className={classes.fieldContainer}>
          <div className={classes.fieldLabel}>{CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.CREW_PAX_PRIORITY}</div>
          <SurveyRadioEditor field={field.select('crewPaxPriority')} />
        </div>
        <div className={classes.fieldContainer}>
          <div className={classes.fieldLabel}>
            {CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.CREW_PAX_PRIORITY_EXPLANATION}
          </div>
          <SurveyValueEditor field={field.select('crewPaxPriorityExplanation')} />
        </div>
      </Fragment>
    );
  }
}

export default withStyles(styles)(MainTerminalEditor);

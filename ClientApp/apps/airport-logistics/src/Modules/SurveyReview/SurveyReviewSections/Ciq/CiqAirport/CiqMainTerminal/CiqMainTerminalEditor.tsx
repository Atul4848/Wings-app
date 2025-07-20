import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { SurveyRadioEditor } from './../../../../SurveyEditor/index';
import { CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY } from './../../../../../Shared';
import { Field } from 'mobx-react-form';
import { SurveyHoursEditor } from './../../../../SurveyEditor';
import { styles } from './../../../SurveyReviewSection/SurveyReviewSection.styles';
import { IClasses } from '@wings-shared/core';

type Props = {
  field: Field;
  classes?: IClasses;
};

@observer
class CiqMainTerminalEditor extends Component<Props> {

  render() {
    const { classes, field } = this.props;

    return (
      <Fragment>
        <SurveyHoursEditor
          field={field.$('operatingHours')}
        />
        <div className={classes.fieldContainer}>
          <div className={classes.fieldLabel}>
            {CIQ_LOGISTICS_CREW_PAX_AVAILABLE_FACILITY.IS_OVER_TIME_POSSIBLE}
          </div>
          <SurveyRadioEditor field={field.select('ciqOvertimeRequired')} />
        </div>
      </Fragment>
    );
  }
}

export default withStyles(styles)(CiqMainTerminalEditor);

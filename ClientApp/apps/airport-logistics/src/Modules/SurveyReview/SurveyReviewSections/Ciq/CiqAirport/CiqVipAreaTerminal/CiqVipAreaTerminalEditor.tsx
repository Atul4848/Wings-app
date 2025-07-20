import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { SurveyValueUnitPairEditor } from './../../../../SurveyEditor/index';
import { Field } from 'mobx-react-form';
import { SurveyHoursEditor } from './../../../../SurveyEditor';
import { IClasses } from '@wings-shared/core';
import { styles } from './../../../SurveyReviewSection/SurveyReviewSection.styles';

type Props = {
  field: Field;
  classes?: IClasses;
};

@observer
class CiqVipAreaTerminalEditor extends Component<Props> {
  private get getTextFields(): ReactNode {
    const { classes, field } = this.props;
    return (
      <Fragment>
        <div className={classes.fieldContainer}>
          <SurveyValueUnitPairEditor field={field.select('usageCostPair')} />
        </div>
        <div className={classes.fieldContainer}>
          <SurveyValueUnitPairEditor field={field.select('overTimeCostPair')} />
        </div>
      </Fragment>
    );
  }

  render() {
    const { field } = this.props;
    return (
      <Fragment>
        <SurveyHoursEditor field={field.select('operatingHours')} />
        {this.getTextFields}
      </Fragment>
    );
  }
}

export default withStyles(styles)(CiqVipAreaTerminalEditor);

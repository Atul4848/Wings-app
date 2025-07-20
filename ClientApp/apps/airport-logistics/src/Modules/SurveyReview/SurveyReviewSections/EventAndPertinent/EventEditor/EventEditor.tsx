import React, { Component, Fragment, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { Button, IconButton, withStyles } from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { SurveyRadioEditor, SurveyValueEditor, SurveyDatePickerEditor } from './../../../SurveyEditor/index';
import { Field } from 'mobx-react-form';
import { EVENT_PERTINENT } from './../../../../Shared';
import classNames from 'classnames';
import { IClasses } from '@wings-shared/core';

import { styles } from './../EventReview/EventReview.styles';

type Props = {
  field: Field;
  classes?: IClasses;
};

@observer
class EventEditor extends Component<Props> {
  private getEditorFields(field: Field): ReactNode {
    const { classes } = this.props;
    const containerClasses = classNames({
      [classes.container]: true,
      [classes.editor]: true,
    });
    return (
      <div className={containerClasses} key={field.key}>
        <div className={classes.section}>
          <div className={classes.label}>{EVENT_PERTINENT.NAME}</div>
          <SurveyValueEditor field={field.select('name')} />
          {this.removeButton(field.key)}
        </div>
        <div className={classes.section}>
          <div className={classes.label}>{EVENT_PERTINENT.START_DATE}</div>
          <SurveyDatePickerEditor
            maxDate={field.select('endDate').value}
            field={field.select('startDate')}
          />
        </div>
        <div className={classes.section}>
          <div className={classes.label}>{EVENT_PERTINENT.END_DATE}</div>
          <SurveyDatePickerEditor
            minDate={field.select('startDate').value}
            field={field.select('endDate')}
          />
        </div>
        <div className={classes.section}>
          <div className={classes.label}>
            {EVENT_PERTINENT.HOTEL_SHORTAGE}
          </div>
          <SurveyRadioEditor field={field.select('hotelShortage')} />
        </div>
      </div>
    );
  }

  private get addButton(): ReactNode {
    const { classes } = this.props;
    return (
      <Button
        color="primary"
        variant="contained"
        size="small"
        className={classes.addButton}
        onClick={() => this.props.field.add()}
      >
        <Add />
        Add New
      </Button>
    );
  }

  private removeButton(key: string): ReactNode {
    const { classes } = this.props;
    return (
      <IconButton
        size="small"
        color="primary"
        className={classes.removeButton}
        onClick={() => this.props.field.del(key)}
      >
        <Delete />
      </IconButton>
    )
  }

  render() {
    return (
      <Fragment>
        {this.props.field.map((field: Field) => this.getEditorFields(field))}
        {this.addButton}
      </Fragment>
    );
  }
}

export default withStyles(styles)(EventEditor);

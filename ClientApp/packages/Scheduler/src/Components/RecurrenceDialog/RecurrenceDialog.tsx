import React, { Component, ReactNode } from 'react';
import { Box, withStyles } from '@material-ui/core';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { styles } from './RecurrenceDialog.styles';
import { SCHEDULE_TYPE } from '../../Enums';
import { ScheduleModel } from '../../Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import RecurrenceEditor from '../RecurrenceEditor/RecurrenceEditor';
import { IClasses, ViewPermission } from '@wings-shared/core';

interface Props {
  classes?: IClasses;
  isEditable?: boolean;
  scheduleData: ScheduleModel;
  hasPermission: boolean;
  onSave?: (scheduleType: SCHEDULE_TYPE, scheduleData?: ScheduleModel) => void;
  isLoading: () => boolean;
}

@observer
class RecurrenceDialog extends Component<Props> {
  @observable scheduleData: ScheduleModel;

  constructor(p) {
    super(p);
    this.scheduleData = p.scheduleData;
  }

  @computed
  private get dialogContent(): ReactNode {
    const { classes, isEditable } = this.props;
    return (
      <div className={classes.root}>
        <RecurrenceEditor
          isEditable={isEditable}
          scheduleData={this.scheduleData}
          onChange={(updatedScheduleData: ScheduleModel) => {
            this.scheduleData = updatedScheduleData;
          }}
        />
      </div>
    );
  }

  @computed
  private get dialogActions(): ReactNode {
    const { classes, hasPermission, isEditable } = this.props;
    return (
      <div className={classes.dialogActions}>
        <PrimaryButton
          variant="outlined"
          className={classes.cancelButton}
          onClick={() => ModalStore.close()}
        >
          Cancel
        </PrimaryButton>
        <ViewPermission hasPermission={hasPermission}>
          <Box>
            <ViewPermission hasPermission={false}>
              <PrimaryButton
                key="remove"
                variant="contained"
                className={classes.actionButton}
                onClick={() => {
                  this.scheduleData.scheduleType = ScheduleModel.getScheduleType(
                    SCHEDULE_TYPE.SINGLE_INSTANCE
                  );
                  this.props.onSave(
                    SCHEDULE_TYPE.SINGLE_INSTANCE,
                    this.scheduleData
                  );
                }}
              >
                Remove
              </PrimaryButton>
            </ViewPermission>
            <ViewPermission hasPermission={isEditable}>
              <PrimaryButton
                key="save"
                variant="contained"
                className={classes.actionButton}
                disabled={!this.scheduleData.isDataValid}
                onClick={() => {
                  this.scheduleData.scheduleType = ScheduleModel.getScheduleType(
                    SCHEDULE_TYPE.RECURRENCE
                  );
                  this.props.onSave(
                    SCHEDULE_TYPE.RECURRENCE,
                    this.scheduleData
                  );
                }}
              >
                Update
              </PrimaryButton>
            </ViewPermission>
          </Box>
        </ViewPermission>
      </div>
    );
  }

  public render(): ReactNode {
    const { classes } = this.props;
    return (
      <Dialog
        title="Recurrence"
        open={true}
        classes={{ paperSize: classes.paperSize }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
        dialogActions={() => this.dialogActions}
      />
    );
  }
}

export default withStyles(styles)(RecurrenceDialog);
export { RecurrenceDialog as PureRecurrenceDialog };

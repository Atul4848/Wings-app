import React, { FC, useState } from 'react';
import { Box } from '@material-ui/core';
import { useStyles } from './RecurrenceDialog.styles';
import { SCHEDULE_TYPE } from '../../Enums';
import { ScheduleModel } from '../../Models';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import RecurrenceEditorV2 from '../RecurrenceEditor/RecurrenceEditorV2';
import { ViewPermission } from '@wings-shared/core';
import { observer } from 'mobx-react';

interface Props {
  isEditable?: boolean;
  scheduleData: ScheduleModel;
  hasPermission: boolean;
  onSave?: (scheduleType: SCHEDULE_TYPE, scheduleData?: ScheduleModel) => void;
  isLoading: () => boolean;
}

const RecurrenceDialogV2: FC<Props> = ({
  hasPermission,
  isEditable,
  onSave,
  ...props
}) => {
  const styles = useStyles();
  const [scheduleData, setScheduleData] = useState<ScheduleModel>(
    props.scheduleData
  );

  const dialogContent = () => {
    return (
      <div className={styles.root}>
        <RecurrenceEditorV2
          isEditable={isEditable}
          scheduleData={scheduleData}
          onChange={(updatedScheduleData: ScheduleModel) => {
            setScheduleData(updatedScheduleData);
          }}
        />
      </div>
    );
  };

  const dialogActions = () => {
    return (
      <div className={styles.dialogActions}>
        <PrimaryButton
          variant="outlined"
          className={styles.actionButton}
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
                className={styles.actionButton}
                onClick={() => {
                  scheduleData.scheduleType = ScheduleModel.getScheduleType(
                    SCHEDULE_TYPE.SINGLE_INSTANCE
                  );
                  onSave(SCHEDULE_TYPE.SINGLE_INSTANCE, scheduleData);
                }}
              >
                Remove
              </PrimaryButton>
            </ViewPermission>
            <ViewPermission hasPermission={isEditable}>
              <PrimaryButton
                key="save"
                variant="contained"
                className={styles.actionButton}
                disabled={!scheduleData.isDataValid}
                onClick={() => {
                  scheduleData.scheduleType = ScheduleModel.getScheduleType(
                    SCHEDULE_TYPE.RECURRENCE
                  );
                  onSave(SCHEDULE_TYPE.RECURRENCE, scheduleData);
                }}
              >
                Update
              </PrimaryButton>
            </ViewPermission>
          </Box>
        </ViewPermission>
      </div>
    );
  };

  return (
    <Dialog
      title="Recurrence"
      open={true}
      classes={{ paperSize: styles.paperSize }}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
      dialogActions={dialogActions}
    />
  );
};

export default observer(RecurrenceDialogV2);

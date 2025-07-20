import { Typography } from '@material-ui/core';
import { SettingsTypeModel } from '@wings-shared/core';
import { observer } from 'mobx-react';
import React, { FC, Ref } from 'react';
import { ScheduleModel } from '../../Models';
import { useStyles } from './RecurrenceEditor.styles';
import DateTimeWidgetV2 from '../DateTimeWidget/DateTimeWidgetV2';
import RecurrencePatternViewV2 from '../RecurrencePatternView/RecurrencePatternViewV2';
import RecurrenceRangeViewV2 from '../RecurrenceRangeView/RecurrenceRangeViewV2';

interface Props {
  ref?: Ref<any>;
  scheduleData: ScheduleModel;
  isEditable?: boolean;
  stddstTypes?: SettingsTypeModel[];
  onChange: (scheduleData: ScheduleModel, callback: Function) => void;
}

const RecurrenceEditorV2: FC<Props> = ({
  scheduleData,
  isEditable,
  onChange,
}) => {
  const style = useStyles();

  return (
    <div className={style.root}>
      <div className={style.flexRow}>
        <RecurrenceRangeViewV2
          isEditable={isEditable}
          scheduleData={scheduleData}
          onChange={(updatedData, callback) => onChange(updatedData, callback)}
        />
      </div>
      <div className={style.flexRow}>
        <DateTimeWidgetV2
          isEditable={isEditable}
          scheduleData={scheduleData}
          onChange={(updatedData, callback) => onChange(updatedData, callback)}
        />
      </div>
      <div className={style.flexRow}>
        <Typography variant="h6" className={style.groupTitle}>
          Recurrence Pattern
        </Typography>
        <RecurrencePatternViewV2
          isEditable={isEditable}
          scheduleData={scheduleData}
          onChange={(updatedData, callback) => onChange(updatedData, callback)}
        />
      </div>
    </div>
  );
};
export default observer(RecurrenceEditorV2);

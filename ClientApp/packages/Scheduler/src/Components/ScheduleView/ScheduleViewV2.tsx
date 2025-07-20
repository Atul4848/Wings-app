import React, { FC, Ref, useEffect } from 'react';
import { fields } from './Fields';
import {
  RecurrenceModel,
  RecurrenceRangeModel,
  ScheduleModel,
} from '../../Models';
import {
  IOptionValue,
  Utilities,
  SettingsTypeModel,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { dateTimeTypeOptions } from '../fields';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IViewInputControl,
} from '@wings-shared/form-controls';
import { useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router';
import { useStyles } from './ScheduleView.styles';
import { observer } from 'mobx-react';

interface Props {
  ref?: Ref<any>;
  isEditable?: boolean;
  scheduleData: ScheduleModel;
  stddstTypes: SettingsTypeModel[];
  onChange?: (updatedData: ScheduleModel, callback: Function) => void;
}

const ScheduleViewV2: FC<Props> = ({
  scheduleData,
  isEditable,
  stddstTypes,
  onChange,
}) => {
  const params = useParams();
  const styles = useStyles();
  const useUpsert = useBaseUpsertComponent<ScheduleModel>(
    params,
    fields,
    baseEntitySearchFilters
  );

  useEffect(() => {
    useUpsert.setFormValues(scheduleData);
  });

  const inputControls = (): IViewInputControl[] => {
    return [
      {
        fieldKey: 'timeType',
        type: EDITOR_TYPES.DROPDOWN,
        options: dateTimeTypeOptions,
        isDisabled: true,
      },
      {
        fieldKey: 'stddstType',
        type: EDITOR_TYPES.DROPDOWN,
        options: stddstTypes || [],
      },
      {
        fieldKey: 'includeHoliday',
        type: EDITOR_TYPES.CHECKBOX,
      },
    ];
  };

  const onValueChange = (value: IOptionValue, fieldKey: string) => {
    useUpsert.getField(fieldKey).set(value);
    const { recurrenceRange } = scheduleData.patternedRecurrence;
    let recurrenceRangeData: RecurrenceRangeModel = new RecurrenceRangeModel({
      ...recurrenceRange,
    });

    if (Utilities.isEqual(fieldKey, 'stddstType') && value) {
      recurrenceRangeData = new RecurrenceRangeModel({
        id: recurrenceRange.id,
        patternedRecurrenceId: recurrenceRange.patternedRecurrenceId,
        startDate: null,
      });
    }

    const schedule = new ScheduleModel({
      ...scheduleData,
      patternedRecurrence: new RecurrenceModel({
        ...scheduleData.patternedRecurrence,
        recurrenceRange: recurrenceRangeData,
      }),
      ...useUpsert.form.values(),
    });
    onChange(schedule, (cancel: boolean) => {
      if (cancel) {
        useUpsert.setFormValues(scheduleData);
      }
    });
  };

  return (
    <div className={styles.flexRow}>
      {inputControls().map((inputControl: IViewInputControl, index: number) => (
        <ViewInputControl
          {...inputControl}
          key={index}
          field={useUpsert.getField(inputControl.fieldKey)}
          isEditable={isEditable}
          isDisabled={inputControl.isDisabled}
          onValueChange={(option, _fieldKey) =>
            onValueChange(option, inputControl.fieldKey)
          }
        />
      ))}
    </div>
  );
};

export default observer(ScheduleViewV2);

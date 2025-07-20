import React, { FC, ChangeEvent } from 'react';
import { Filed } from 'mobx-react-form';
import { FormControlLabel, Checkbox, FormGroup } from '@material-ui/core';
import { DayOfWeekModel } from '../../Models';
import { daysOfWeekOptions } from '../fields';
import { observer } from 'mobx-react';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { IOptionValue, SelectOption } from '@wings-shared/core';
import { useStyles } from './WeeklyView.styles';

interface Props {
  isEditable?: boolean;
  recurrencePatternId: number;
  onChange: (updatedData: IOptionValue, fieldKey: string) => void;
  getField: (fieldKey: string) => Filed;
}

const WeeklyView: FC<Props> = ({ onChange, getField, recurrencePatternId, isEditable }: Props) => {
  const styles = useStyles()
  const daysOfWeeks: DayOfWeekModel[] = getField('daysOfWeeks').value || [];
  const onDaySelection = (day: SelectOption, isSelected: boolean): void => {
    const tempList: DayOfWeekModel[] = daysOfWeeks.filter(({ dayOfWeekId }) => dayOfWeekId !== day.value);
    if (isSelected) {
      tempList.push(
        new DayOfWeekModel({ dayOfWeekId: Number(day.value), recurrencePatternId: recurrencePatternId || 0 })
      );
    }
    onChange(tempList, 'daysOfWeeks');
  };
  const selectedWeekDaysList: number[] = daysOfWeeks.map(dayOfWeek => dayOfWeek.dayOfWeekId);
  const isDisable = (currentDay: number): boolean => {
    if (!isEditable) {
      return true;
    }
    return Boolean(selectedWeekDaysList.length >= 6 && !selectedWeekDaysList.includes(currentDay));
  };
  return (
    <div className={styles.root}>
      <div className={styles.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.TEXT_FIELD}
          isEditable={isEditable}
          field={getField('interval')}
          onValueChange={(value, fieldKey) => onChange(value, fieldKey)}
        />
      </div>
      <FormGroup row>
        {daysOfWeekOptions.map((day: SelectOption) => (
          <FormControlLabel
            className={styles.formControlLabel}
            key={day.name}
            label={day.name}
            control={
              <Checkbox
                name={day.name}
                disabled={isDisable(Number(day.value))}
                checked={selectedWeekDaysList.includes(Number(day.value))}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onDaySelection(day, e.target.checked)}
              />
            }
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default observer(WeeklyView);

import React, { FC } from 'react';
import { Filed } from 'mobx-react-form';
import { useStyles } from './MonthlyView.styles';
import { RECURRENCE_PATTERN_TYPE } from '../../Enums';
import {
  monthTypeOptions,
  weekIndexOptions,
  daysOfWeekOptions,
} from '../fields';
import { IOptionValue } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';

interface Props {
  isEditable?: boolean;
  onChange: (updatedData: IOptionValue, fieldKey: string) => void;
  getField: (fieldKey: string) => Filed;
}

const MonthlyViewV2: FC<Props> = ({ ...props }) => {
  const styles = useStyles();
  const { getField, onChange, isEditable } = props;

  /* istanbul ignore next */
  const recurrencePatternLabel = (): string => {
    const { value } = props.getField('recurrencePatternTypeId');
    return value === RECURRENCE_PATTERN_TYPE.MONTHLY
      ? monthTypeOptions[1].label
      : monthTypeOptions[0].label;
  };

  /* istanbul ignore next */
  const weekIndexLabel = (): string => {
    const week = props.getField('weekIndexId')?.value;
    return weekIndexOptions.find(x => x.value === week)?.label;
  };

  /* istanbul ignore next */
  const dayOfWeekLabel = (): string => {
    const day = props.getField('firstDayOfWeekId')?.value;
    return daysOfWeekOptions.find(x => x.value === day)?.label;
  };

  const relativeMonthly = () => {
    return (
      <div className={styles.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('weekIndexId')}
          options={weekIndexOptions}
          getOptionLabel={option => {
            if (option?.label && isEditable) return option?.label;
            return weekIndexLabel();
          }}
          onValueChange={(value, fieldKey) =>
            onChange(value && value['value'], fieldKey)
          }
        />
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('firstDayOfWeekId')}
          options={daysOfWeekOptions}
          getOptionLabel={option => {
            if (isEditable && option?.label) return option?.label;
            return dayOfWeekLabel();
          }}
          onValueChange={(value, fieldKey) =>
            onChange(value && value['value'], fieldKey)
          }
        />
        <ViewInputControl
          type={EDITOR_TYPES.TEXT_FIELD}
          isEditable={isEditable}
          field={getField('interval')}
          onValueChange={(value, fieldKey) => onChange(value, fieldKey)}
        />
      </div>
    );
  };

  const absoluteMonthly = () => {
    return (
      <div className={styles.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.TEXT_FIELD}
          isEditable={isEditable}
          field={getField('dayOfMonth')}
          options={monthTypeOptions}
          onValueChange={(value, fieldKey) => onChange(value, fieldKey)}
        />

        <ViewInputControl
          type={EDITOR_TYPES.TEXT_FIELD}
          isEditable={isEditable}
          field={getField('interval')}
          options={monthTypeOptions}
          onValueChange={(value, fieldKey) => onChange(value, fieldKey)}
        />
      </div>
    );
  };

  const { value } = getField('recurrencePatternTypeId');
  return (
    <div className={styles.root}>
      <div className={styles.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('recurrencePatternTypeId')}
          options={monthTypeOptions}
          getOptionLabel={option => {
            if (option?.label && isEditable) return option?.label;
            return recurrencePatternLabel();
          }}
          onValueChange={(value, fieldKey) =>
            onChange(value && value['value'], fieldKey)
          }
        />
      </div>
      {value === RECURRENCE_PATTERN_TYPE.MONTHLY
        ? absoluteMonthly()
        : relativeMonthly()}
    </div>
  );
};

export default MonthlyViewV2;

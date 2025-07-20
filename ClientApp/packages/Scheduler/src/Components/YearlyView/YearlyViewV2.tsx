import React, { FC } from 'react';
import { Filed } from 'mobx-react-form';
import { RECURRENCE_PATTERN_TYPE } from '../../Enums';
import {
  monthOptions,
  weekIndexOptions,
  daysOfWeekOptions,
  yearTypeOptions,
} from '../fields';
import { useStyles } from './YearlyView.styles';
import { IOptionValue } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { observer } from 'mobx-react';

interface Props {
  isEditable?: boolean;
  onChange: (updatedData: IOptionValue, fieldKey: string) => void;
  getField: (fieldKey: string) => Filed;
}

const YearlyViewV2: FC<Props> = ({ onChange, getField, isEditable }) => {
  const { value } = getField('recurrencePatternTypeId');
  const styles = useStyles();
  
  /* istanbul ignore next */
  const recurrencePatternLabel = (): string => {
    const { value } = getField('recurrencePatternTypeId');
    return value === RECURRENCE_PATTERN_TYPE.YEARLY
      ? yearTypeOptions[1].label
      : yearTypeOptions[0].label;
  };

  /* istanbul ignore next */
  const monthLabel = (): string => {
    const month = getField('month')?.value;
    return monthOptions.find(x => x.value === month)?.label;
  };

  /* istanbul ignore next */
  const weekIndexLabel = (): string => {
    const week = getField('weekIndexId')?.value;
    return weekIndexOptions.find(x => x.value === week)?.label;
  };

  /* istanbul ignore next */
  const dayOfWeekLabel = (): string => {
    const day = getField('firstDayOfWeekId')?.value;
    return daysOfWeekOptions.find(x => x.value === day)?.label;
  };

  const absoluteYearly = () => {
    return (
      <div className={styles.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('month')}
          options={monthOptions}
          getOptionLabel={option => {
            if (isEditable && option?.label) return option?.label;
            return monthLabel();
          }}
          onValueChange={(value, fieldKey) =>
            onChange(value && value['value'], fieldKey)
          }
        />
        <ViewInputControl
          type={EDITOR_TYPES.TEXT_FIELD}
          isEditable={isEditable}
          field={getField('dayOfMonth')}
          options={monthOptions}
          onValueChange={(value, fieldKey) => onChange(value, fieldKey)}
        />
      </div>
    );
  };

  const relativeYearly = () => {
    return (
      <div className={styles.flex}>
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('weekIndexId')}
          options={weekIndexOptions}
          getOptionLabel={option => {
            if (isEditable && option?.label) return option?.label;
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
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('month')}
          options={monthOptions}
          getOptionLabel={option => {
            if (isEditable && option?.label) return option?.label;
            return monthLabel();
          }}
          onValueChange={(value, fieldKey) =>
            onChange(value && value['value'], fieldKey)
          }
        />
      </div>
    );
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
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isEditable={isEditable}
          field={getField('recurrencePatternTypeId')}
          options={yearTypeOptions}
          getOptionLabel={option => {
            if (isEditable && option?.label) return option?.label;
            return recurrencePatternLabel();
          }}
          onValueChange={(value, fieldKey) =>
            onChange(value && value['value'], fieldKey)
          }
        />
      </div>
      {value === RECURRENCE_PATTERN_TYPE.YEARLY
        ? absoluteYearly()
        : relativeYearly()}
    </div>
  );
};

export default observer(YearlyViewV2);

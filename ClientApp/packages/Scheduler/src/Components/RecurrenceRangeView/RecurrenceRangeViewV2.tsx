import {
  baseEntitySearchFilters,
  DATE_FORMAT,
  IOptionValue,
  regex,
  Utilities,
} from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { useBaseUpsertComponent } from '@wings/shared';
import { Field } from 'mobx-react-form';
import moment from 'moment';
import React, { FC, Ref, useEffect } from 'react';
import { useParams } from 'react-router';
import { RECURRENCE_RANGE_TYPE } from '../../Enums';
import {
  RecurrenceModel,
  RecurrenceRangeModel,
  ScheduleModel,
} from '../../Models';
import { fields } from './Fields';
import { useStyles } from './RecurrenceRangeView.styles';
import { observer } from 'mobx-react';

interface Props {
  ref?: Ref<any>;
  isEditable?: boolean;
  scheduleData: ScheduleModel;
  onChange: (updatedData: ScheduleModel, callback: Function) => void;
}

const RecurrenceRangeViewV2: FC<Props> = ({ isEditable, ...props }) => {
  const params = useParams();
  const styles = useStyles();
  const useUpsert = useBaseUpsertComponent<ScheduleModel>(
    params,
    fields,
    baseEntitySearchFilters
  );

  useEffect(() => {
    setFormValues();
  }, []);

  /* istanbul ignore next */
  const setFormValues = (recurrenceRangeData?: RecurrenceRangeModel) => {
    if (!recurrenceRange()) {
      return;
    }
    useUpsert.form.set(recurrenceRangeData || recurrenceRange());
    const rangeTypeId: number =
      recurrenceRangeData?.recurrenceRangeType?.id ||
      recurrenceRange().recurrenceRangeType?.id;
    setRecurrenceRangeField(rangeTypeId);
  };

  const recurrenceRange = (): RecurrenceRangeModel =>
    props.scheduleData?.patternedRecurrence?.recurrenceRange;

  const hasStartDate = (): boolean =>
    Boolean(useUpsert.getField('startDate').value);

  const endDate = (): string => {
    const { value } = useUpsert.getField('startDate');
    const numberOfOccurrences = useUpsert.getField('numberOfOccurrences').value;
    const startDate = moment(value, DATE_FORMAT.API_FORMAT);
    return startDate.isValid()
      ? startDate
          .add(numberOfOccurrences, 'days')
          .format(DATE_FORMAT.API_FORMAT)
      : '';
  };

  const onValueChange = (value: IOptionValue, fieldKey: string) => {
    useUpsert.getField(fieldKey).set(value);
    if (Utilities.isEqual(fieldKey, 'recurrenceRangeType')) {
      useUpsert.getField('numberOfOccurrences').set(1);
      const {
        recurrenceRangeType,
      }: RecurrenceRangeModel = useUpsert.form.values();
      if (recurrenceRangeType) {
        useUpsert
          .getField('endDate')
          .set(
            Utilities.isEqual(
              recurrenceRangeType.id,
              RECURRENCE_RANGE_TYPE.NO_END
            )
              ? ''
              : endDate()
          );

        setRecurrenceRangeField(recurrenceRangeType.id);
      }
    }

    if (Utilities.isEqual(fieldKey, 'numberOfOccurrences')) {
      useUpsert.getField('endDate').set(endDate());
    }

    const schedule: ScheduleModel = new ScheduleModel({
      ...props.scheduleData,
      startDate: useUpsert.getField('startDate').value,
      endDate: useUpsert.getField('endDate').value,
      patternedRecurrence: new RecurrenceModel({
        ...props.scheduleData?.patternedRecurrence,
        recurrenceRange: new RecurrenceRangeModel({
          ...recurrenceRange(),
          ...useUpsert.form.values(),
        }),
      }),
    });
    props.onChange(schedule, (cancelChanges: boolean) => {
      if (!cancelChanges) {
        return;
      }
      setFormValues();
    });
  };

  const setRecurrenceRangeField = (recurrenceRangeTypeId: number) => {
    switch (recurrenceRangeTypeId) {
      case RECURRENCE_RANGE_TYPE.END_DATE:
        setFieldRules('endDate', 'required');
        setFieldRules('numberOfOccurrences', '');
        break;
      case RECURRENCE_RANGE_TYPE.NUMBERED:
        setFieldRules('numberOfOccurrences', `required|regex:${regex.numeric}`);
        setFieldRules('endDate', '');
        break;
    }
  };

  const setFieldRules = (fieldKey: string, rule: string) => {
    const requiredField: Field = useUpsert.getField(fieldKey);
    requiredField.set('rules', rule);
  };

  const getLabel = (labelValue: RECURRENCE_RANGE_TYPE) => {
    switch (labelValue) {
      case RECURRENCE_RANGE_TYPE.NUMBERED:
        return (
          <ViewInputControl
            type={EDITOR_TYPES.TEXT_FIELD}
            isEditable={isEditable}
            field={useUpsert.getField('numberOfOccurrences')}
            isDisabled={!hasStartDate()}
            onValueChange={(option, fieldKey) =>
              onValueChange(option, fieldKey)
            }
          />
        );
      case RECURRENCE_RANGE_TYPE.END_DATE:
        return (
          <ViewInputControl
            type={EDITOR_TYPES.DATE}
            field={useUpsert.getField('endDate')}
            minDate={useUpsert.getField('startDate').value}
            isEditable={isEditable}
            isDisabled={!hasStartDate()}
            dateTimeFormat={DATE_FORMAT.DATE_PICKER_FORMAT}
            onValueChange={(option, fieldKey) =>
              onValueChange(option, fieldKey)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.root}>
      <ViewInputControl
        type={EDITOR_TYPES.DATE}
        isEditable={isEditable}
        field={useUpsert.getField('startDate')}
        maxDate={useUpsert.getField('endDate').value}
        dateTimeFormat={DATE_FORMAT.DATE_PICKER_FORMAT}
        onValueChange={(value, fieldKey) => onValueChange(value, fieldKey)}
      />
      <ViewInputControl
        type={EDITOR_TYPES.DATE}
        field={useUpsert.getField('endDate')}
        minDate={useUpsert.getField('startDate').value}
        isEditable={isEditable}
        isDisabled={!hasStartDate()}
        dateTimeFormat={DATE_FORMAT.DATE_PICKER_FORMAT}
        onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
      />
      {getLabel(useUpsert.getField('recurrenceRangeType').value?.id)}
    </div>
  );
};

export default observer(RecurrenceRangeViewV2);

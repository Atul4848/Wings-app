import React, { FC, Ref, useEffect, useState } from 'react';
import { Field } from 'mobx-react-form';
import { InputLabel } from '@material-ui/core';
import { recurrencePatternOptions, recurrencePatternViews } from '../fields';
import WeeklyView from '../WeeklyView/WeeklyView';
import MonthlyViewV2 from '../MonthlyView/MonthlyViewV2';
import YearlyViewV2 from '../YearlyView/YearlyViewV2';
import RecurrenceTabsV2 from '../RecurrenceTabs/RecurrenceTabsV2';
import {
  RecurrenceModel,
  RecurrencePatternModel,
  ScheduleModel,
} from '../../Models';
import { fields } from './Fields';
import { RECURRENCE_PATTERN_TYPE } from '../../Enums';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import {
  baseEntitySearchFilters,
  IOptionValue,
  SelectOption,
} from '@wings-shared/core';
import { useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router';
import { useStyles } from './RecurrencePatternView.styles';
import { observer } from 'mobx-react';

interface Props {
  ref?: Ref<any>;
  isEditable?: boolean;
  scheduleData: ScheduleModel;
  onChange: (updatedData: ScheduleModel, callback: Function) => void;
}

const RecurrencePatternViewV2: FC<Props> = ({
  scheduleData,
  isEditable,
  ...props
}) => {
  const params = useParams();
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabs: string[] = recurrencePatternOptions.map(x => x.name);
  const useUpsert = useBaseUpsertComponent<ScheduleModel>(
    params,
    fields,
    baseEntitySearchFilters
  );

  useEffect(() => {
    setFormValues();
  }, []);

  const setFormValues = (recurrencePatternData?: RecurrencePatternModel) => {
    if (!recurrencePattern()) {
      return;
    }
    useUpsert.form.set(recurrencePatternData || recurrencePattern());
    const recurrencePatternTypeId: RECURRENCE_PATTERN_TYPE =
      recurrencePatternData?.recurrencePatternTypeId ||
      recurrencePattern().recurrencePatternTypeId;
    setActiveTab(getDefaultActiveTab(recurrencePatternTypeId));
    setRecurrencePatternTypeField(
      recurrencePatternViews.find(
        ({ value }) => value === recurrencePatternTypeId
      )
    );
  };

  // get default active tab based on the recurrencePatternTypeId
  const getDefaultActiveTab = (id: RECURRENCE_PATTERN_TYPE): number => {
    switch (id) {
      case RECURRENCE_PATTERN_TYPE.DAILY:
        return 0;
      case RECURRENCE_PATTERN_TYPE.WEEKLY:
        return 1;
      case RECURRENCE_PATTERN_TYPE.MONTHLY:
      case RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY:
        return 2;
      case RECURRENCE_PATTERN_TYPE.YEARLY:
      case RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY:
        return 3;
    }
  };

  const recurrencePattern = (): RecurrencePatternModel => {
    return scheduleData?.patternedRecurrence?.recurrencePattern;
  };

  const isDisable = (_tabIndex: number): boolean => {
    if (!isEditable) {
      return true;
    }
    return false;
  };

  const onValueChange = (value: IOptionValue, filedKey: string) => {
    useUpsert.getField(filedKey).set(value);

    const schedule: ScheduleModel = new ScheduleModel({
      ...scheduleData,
      patternedRecurrence: new RecurrenceModel({
        ...scheduleData?.patternedRecurrence,
        recurrencePattern: new RecurrencePatternModel({
          ...recurrencePattern(),
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

  const onTabChange = (tabIndex: number, tabName: string) => {
    setActiveTab(tabIndex);
    useUpsert.form.reset();
    useUpsert.getField('interval').set(1);
    setRecurrencePatternTypeField(
      recurrencePatternOptions.find(({ name }) => name === tabName)
    );
    const recurrencePatternTypeField: Field = useUpsert.getField(
      'recurrencePatternTypeId'
    );
    onValueChange(recurrencePatternTypeField.value, 'recurrencePatternTypeId');
  };

  const setRecurrencePatternTypeField = (tab: SelectOption) => {
    const recurrencePatternTypeField: Field = useUpsert.getField(
      'recurrencePatternTypeId'
    );
    const intervalField: Field = useUpsert.getField('interval');
    switch (tab.value) {
      case RECURRENCE_PATTERN_TYPE.DAILY:
        intervalField.set('label', 'Every Day(s)*');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.DAILY);
        break;
      case RECURRENCE_PATTERN_TYPE.WEEKLY:
        intervalField.set('label', 'Every Week(s)*');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.WEEKLY);
        break;
      case RECURRENCE_PATTERN_TYPE.MONTHLY:
        intervalField.set('label', 'Every Month(s)');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.MONTHLY);
        recurrencePatternTypeField.set('label', 'Month Type*');
        break;
      case RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY:
        intervalField.set('label', 'Every Month(s)');
        recurrencePatternTypeField.set(
          RECURRENCE_PATTERN_TYPE.RELATIVE_MONTHLY
        );
        recurrencePatternTypeField.set('label', 'Month Type*');
        break;
      case RECURRENCE_PATTERN_TYPE.YEARLY:
        intervalField.set('label', 'Every Year(s)');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.YEARLY);
        recurrencePatternTypeField.set('label', 'Year Type*');
        break;
      case RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY:
        intervalField.set('label', 'Every Year(s)');
        recurrencePatternTypeField.set(RECURRENCE_PATTERN_TYPE.RELATIVE_YEARLY);
        recurrencePatternTypeField.set('label', 'Year Type*');
        break;
    }
  };

  return (
    <div className={styles.root}>
      <InputLabel className={styles.title}>Period</InputLabel>
      <RecurrenceTabsV2
        tabs={tabs}
        activeTab={activeTab}
        isDisable={index => isDisable(index)}
        onTabChange={(tabIndex, tabName) => onTabChange(tabIndex, tabName)}
      >
        <div className={styles.flex}>
          <ViewInputControl
            type={EDITOR_TYPES.TEXT_FIELD}
            isEditable={isEditable}
            field={useUpsert.getField('interval')}
            onValueChange={(value, fieldKey) => onValueChange(value, fieldKey)}
          />
        </div>
        <WeeklyView
          recurrencePatternId={recurrencePattern().id}
          getField={key => useUpsert.getField(key)}
          isEditable={isEditable}
          onChange={(option, fieldKey) => onValueChange(option, fieldKey)}
        />
        <MonthlyViewV2
          isEditable={isEditable}
          getField={key => useUpsert.getField(key)}
          onChange={(option, fieldKey) => onValueChange(option, fieldKey)}
        />
        <YearlyViewV2
          isEditable={isEditable}
          getField={key => useUpsert.getField(key)}
          onChange={(option, fieldKey) => onValueChange(option, fieldKey)}
        />
      </RecurrenceTabsV2>
    </div>
  );
};

export default observer(RecurrencePatternViewV2);

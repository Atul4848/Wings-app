import React, { FC, FormEvent, useEffect, useState } from 'react';
import { baseEntitySearchFilters, DATE_FORMAT, getFormValidation, SelectOption } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useStyles } from './TimeConversion.module.styles';
import { TextField, Typography } from '@material-ui/core';
import { TIME_CONVERSION_FILTERS, TimeZoneStore, updateTimezoneSidebarOptions } from '../Shared';
import { AutoCompleteControl, DateTimePicker, SelectInputControl } from '@wings-shared/form-controls';
import { AirportModel, useBaseUpsertComponent } from '@wings/shared';
import { observable } from 'mobx';
import MobxReactForm from 'mobx-react-form';
import { conversionInputFields } from './fields';
import { SidebarStore } from '@wings-shared/layout';
import { useParams } from 'react-router';

interface Props {
  timeZoneStore?: TimeZoneStore;
  sidebarStore?: typeof SidebarStore;
  submitted?: (formValue: FormEvent<EventTarget>) => void;
}

const TimeConversionModule: FC<Props> = ({ submitted, timeZoneStore, sidebarStore }) => {
  const classes = useStyles();
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const options: string[] = [ 'Local', 'Zulu' ];
  const [ selectedTimeZoneOption, setSelectedTimeZoneOption ] = useState(TIME_CONVERSION_FILTERS.LOCAL);
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<AirportModel>(params, conversionInputFields, baseEntitySearchFilters);
  const form: MobxReactForm = observable(
    getFormValidation(conversionInputFields, {
      successHandler: (formValue: FormEvent<EventTarget>) => submitted(formValue),
    })
  );

  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Time Conversion'), 'geographic');
    _timeZoneStore.loadAllAirports();
  }, []);

  const convertHandler = (): void => {
    convertTime(useUpsert.form.values());
  };

  /* istanbul ignore next */
  const convertTime = (values): void => {
    const { conversionDate } = values;
    const convertedTime = _timeZoneStore.convertTime(conversionDate);
    if (!convertedTime) {
      return;
    }
    const { localTime, zuluTime } = convertedTime;
    useUpsert.getField('localTime').set(localTime.format(DATE_FORMAT.GRID_DISPLAY));
    useUpsert.getField('zuluTime').set(`${zuluTime.format(DATE_FORMAT.GRID_DISPLAY)}Z`);
  };

  const resetValues = (): void => {
    useUpsert.getField('airport').set('');
    useUpsert.getField('localTime').set('');
    useUpsert.getField('zuluTime').set('');
  };

  /* istanbul ignore next */
  const onDropDownChange = (selectedOption): void => {
    resetValues();
    if (selectedOption) {
      useUpsert.getField('airport').set(selectedOption);
      _timeZoneStore.loadAirportTimezones(selectedOption.id);
    }
  };

  const selectOptions = (): SelectOption[] => {
    return options.map(option => new SelectOption({ name: option, value: option }));
  };

  const setSelectedOption = (selectedValue: string): void => {
    setSelectedTimeZoneOption(selectedValue);
  };

  return (
    <React.Fragment>
      <div className={classes.inputsContainer}>
        <div className={classes.textField}>
          <AutoCompleteControl
            placeHolder="Search ICAO"
            options={_timeZoneStore.airports}
            value={useUpsert.getField('airport').value}
            onDropDownChange={selectedOption => onDropDownChange(selectedOption as AirportModel)}
          />
        </div>
        <div className={classes.conversionDateField}>
          <DateTimePicker {...useUpsert.getField('conversionDate').bind()} allowKeyboardInput={false} />
        </div>
        <SelectInputControl
          value={selectedTimeZoneOption}
          selectOptions={selectOptions()}
          containerClass={classes.selectedOption}
          onOptionChange={(selectedValue: string) => setSelectedOption(selectedValue as string)}
        />
        <div>
          <PrimaryButton variant="contained" disabled={useUpsert.form.hasError} onClick={convertHandler}>
            Convert
          </PrimaryButton>
        </div>
        {selectedTimeZoneOption === TIME_CONVERSION_FILTERS.ZULU && (
          <div className={classes.textField}>
            <Typography className={classes.textFieldLabel}>Local Time:</Typography>
            <TextField
              inputProps={{ readOnly: true }}
              {...useUpsert.getField('localTime').bind()}
              className={classes.inputField}
            />
          </div>
        )}
        {selectedTimeZoneOption === TIME_CONVERSION_FILTERS.LOCAL && (
          <div className={classes.textField}>
            <Typography className={classes.textFieldLabel}>Zulu Time:</Typography>
            <TextField inputProps={{ readOnly: true }} {...useUpsert.getField('zuluTime').bind()} />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default inject('timeZoneStore', 'sidebarStore')(observer(TimeConversionModule));

import { Checkbox, FormControlLabel, Typography, withStyles } from '@material-ui/core';
import React, { FC, useEffect, useState } from 'react';
import { Scrollable } from '@uvgo-shared/scrollable';
import { styles } from './Preferences.style';
import { PreferencesModel, SalesPersonModel, TeamContactModel, UserStore } from '../../../Shared';
import { IClasses, ISelectOption, IdNameModel, SelectOption } from '@wings-shared/core';
import { AutoCompleteControl, SelectInputControl } from '@wings-shared/form-controls';

type Preferences = {
  key: string;
  value: string[];
};

interface Props {
  classes?: IClasses;
  preferencesOfList: PreferencesModel[];
  id: string;
  userStore?: UserStore;
}

export const coordinateFormat: SelectOption[] = [
  new SelectOption({ name: 'Decimal degrees', value: 'Decimal degrees' }),
  new SelectOption({ name: 'Decimal, minutes, and seconds', value: 'Decimal, minutes, and seconds' }),
  new SelectOption({ name: 'FPL 11-Character', value: 'FPL 11-Character' }),
];

export const tripFilter: SelectOption[] = [
  new SelectOption({ name: 'All', value: 'All' }),
  new SelectOption({ name: 'Future', value: 'Future' }),
  new SelectOption({ name: 'Past', value: 'Past' }),
];

export const defaultMapType: SelectOption[] = [
  new SelectOption({ name: 'Standard', value: 'Standard' }),
  new SelectOption({ name: 'Satellite', value: 'Satellite' }),
  new SelectOption({ name: 'Hybrid', value: 'Hybrid' }),
  new SelectOption({ name: 'Navigation Light', value: 'Navigation Light' }),
  new SelectOption({ name: 'Navigation Dark', value: 'Navigation Dark' }),
];

export const tripFolderType: SelectOption[] = [
  new SelectOption({ name: 'Trip Support Services', value: 'Trip Support Services' }),
  new SelectOption({ name: 'Hotel Only', value: 'Hotel Only' }),
  new SelectOption({ name: 'Trip Cost Estimate only', value: 'Trip Cost Estimate only' }),
  new SelectOption({ name: 'Uv Italy,Milan', value: 'Uv Italy,Milan' }),
  new SelectOption({ name: 'Uv Italy,Rome', value: 'Uv Italy,Rome' }),
  new SelectOption({ name: 'Fg Only', value: 'Fg Only' }),
];

const Preferences: FC<Props> = ({ classes, preferencesOfList: ListOfPreferences, id, userStore }: Props) => {
  const [ preferences, setPreferences ] = useState<PreferencesModel[]>([]);
  const [ salesPerson, setSalesPerson ] = useState<SelectOption[]>([]);
  const [ teamContacts, setTeamContacts ] = useState<SelectOption[]>([]);
  const [ defaultSales, setDefaultSales ] = useState<ISelectOption>({ label: '', value: '' });
  const [ coordinateFormatValue, setCoordinateFormatValue ] = useState<ISelectOption>({ label: '', value: '' });
  const [ defaultTeamValue, setDefaultTeamValue ] = useState<ISelectOption>({ label: '', value: '' });
  const [ tripFilterValue, setTripFilterValue ] = useState<ISelectOption>({ label: '', value: '' });
  const [ defaultMapTypeValue, setDefaultMapTypeValue ] = useState<ISelectOption>({ label: '', value: '' });
  const [ tripFolderTypesValue, setTripFolderTypesValue ] = useState<ISelectOption>({ label: '', value: '' });
  const [ suppressWebGettingStartedGuideValue, setSuppressWebGettingStartedGuideValue ] = useState<string>('');
  useEffect(() => {
    userStore?.getPreferences(id).subscribe(ListOfPreferences => {
      setPreferences(ListOfPreferences);
      userStore.setPreferences(ListOfPreferences);
      ListOfPreferences.forEach(x => {
        if (x.key === 'DefaultSalesRepresentative') {
          setDefaultSales({ label: x.value, value: x.value });
        }
        if (x.key === 'CoordinateFormat') {
          setCoordinateFormatValue({ label: x.value, value: x.value });
        }
        if (x.key === 'DefaultTeam') {
          setDefaultTeamValue({ label: x.value, value: x.value });
        }
        if (x.key === 'TripFilter') {
          setTripFilterValue({ label: x.value, value: x.value });
        }
        if (x.key === 'DefaultMapType ') {
          setDefaultMapTypeValue({ label: x.value, value: x.value });
        }
        if (x.key === 'SelectedTripFolderTypes') {
          setTripFolderTypesValue({ label: x.value, value: x.value });
        }
        if (x.key === 'SuppressWebGettingStartedGuide') {
          setSuppressWebGettingStartedGuideValue(x.value);
        }
        return x;
      });
    });
    userStore?.salesPersons().subscribe(ListOfSalesPerson => {
      const salesOptions = ListOfSalesPerson.map(x => {
        return new SelectOption({ name: x.fullName, value: x.fullName });
      });
      setSalesPerson(salesOptions);
    });

    userStore?.teamContacts().subscribe(ListOfTeams => {
      const teamsOptions = ListOfTeams.map(x => {
        return new SelectOption({ name: x.description, value: x.description });
      });
      setTeamContacts(teamsOptions);
    });
  }, []);

  const setDefaultSalesRepresentative = item => {
    setDefaultSales(item);
    const hasKey = userStore?.preferences?.find(x => x.key === 'DefaultSalesRepresentative');
    const preferences = hasKey
      ? userStore?.preferences
      : [ ...userStore?.preferences, { key: 'DefaultSalesRepresentative', value: '' }];
    userStore?.setPreferences(
      preferences?.map(x => {
        if (x.key === 'DefaultSalesRepresentative') {
          x.value = item?.value;
        }
        return x;
      }) || []
    );
  };

  const setCoordinateFilter = item => {
    setCoordinateFormatValue(item);
    const hasKey = userStore?.preferences?.find(x => x.key === 'CoordinateFormat');
    const preferences = hasKey
      ? userStore?.preferences
      : [ ...userStore?.preferences, { key: 'CoordinateFormat', value: '' }];
    userStore?.setPreferences(
      preferences?.map(x => {
        if (x.key === 'CoordinateFormat') {
          x.value = item?.value;
        }
        return x;
      }) || []
    );
  };

  const setDefaultTeam = item => {
    setDefaultTeamValue(item);
    const hasKey = userStore?.preferences?.find(x => x.key === 'DefaultTeam');
    const preferences = hasKey
      ? userStore?.preferences
      : [ ...userStore?.preferences, { key: 'DefaultTeam', value: '' }];
    userStore?.setPreferences(
      preferences?.map(x => {
        if (x.key === 'DefaultTeam') {
          x.value = item?.value;
        }
        return x;
      }) || []
    );
  };

  const setTripFilter = item => {
    setTripFilterValue(item);
    const hasKey = userStore?.preferences?.find(x => x.key === 'TripFilter');
    const preferences = hasKey ? userStore?.preferences : 
      [ ...userStore?.preferences, { key: 'TripFilter', value: '' }];
    userStore?.setPreferences(
      preferences?.map(x => {
        if (x.key === 'TripFilter') {
          x.value = item?.value;
        }
        return x;
      }) || []
    );
  };

  const setDefaultMapTypeFilter = item => {
    setDefaultMapTypeValue(item);
    const hasKey = userStore?.preferences?.find(x => x.key === 'DefaultMapType ');
    const preferences = hasKey
      ? userStore?.preferences
      : [ ...userStore?.preferences, { key: 'DefaultMapType ', value: '' }];
    userStore?.setPreferences(
      preferences?.map(x => {
        if (x.key === 'DefaultMapType ') {
          x.value = item?.value;
        }
        return x;
      }) || []
    );
  };

  const setSelectedTripFolderTypes = item => {
    setTripFolderTypesValue(item);
    const hasKey = userStore?.preferences?.find(x => x.key === 'SelectedTripFolderTypes');
    const preferences = hasKey
      ? userStore?.preferences
      : [ ...userStore?.preferences, { key: 'SelectedTripFolderTypes', value: '' }];
    userStore?.setPreferences(
      preferences?.map(x => {
        if (x.key === 'SelectedTripFolderTypes') {
          x.value = item?.value;
        }
        return x;
      }) || []
    );
  };

  const setSuppressWebGettingStartedGuide = item => {
    setSuppressWebGettingStartedGuideValue(item);
    const hasKey = userStore?.preferences?.find(x => x.key === 'SuppressWebGettingStartedGuide');
    const preferences = hasKey
      ? userStore?.preferences
      : [ ...userStore?.preferences, { key: 'SuppressWebGettingStartedGuide', value: '' }];
    userStore?.setPreferences(
      preferences?.map(x => {
        if (x.key === 'SuppressWebGettingStartedGuide') {
          x.value = item;
        }
        return x;
      }) || []
    );
  };

  return (
    <>
      <div className={classes.detailList}>
        <div className={classes.selectInput}>
          <Typography variant="h6" className={classes.subTitle}>
            Default Sales Representative
          </Typography>
          <AutoCompleteControl
            placeHolder='Select Default Sales Representative'
            value={defaultSales}
            options={salesPerson}
            onDropDownChange={item => setDefaultSalesRepresentative(item)}
          />
        </div>
        <div className={classes.selectInput}>
          <Typography variant="h6" className={classes.subTitle}>
            Coordinate Format
          </Typography>
          <AutoCompleteControl
            placeHolder='Select Coordinate Format'
            value={coordinateFormatValue}
            options={coordinateFormat}
            onDropDownChange={item => setCoordinateFilter(item)}
          />
        </div>
        <div className={classes.selectInput}>
          <Typography variant="h6" className={classes.subTitle}>
            Default Team
          </Typography>
          <AutoCompleteControl
            placeHolder='Select Default Team'
            value={defaultTeamValue}
            options={teamContacts}
            onDropDownChange={item => setDefaultTeam(item)}
          />
        </div>
        <div className={classes.selectInput}>
          <Typography variant="h6" className={classes.subTitle}>
            Trip Filter
          </Typography>
          <AutoCompleteControl
            placeHolder='Select Trip Filter'
            value={tripFilterValue}
            options={tripFilter}
            onDropDownChange={item => setTripFilter(item)}
          />
        </div>
        <div className={classes.selectInput}>
          <Typography variant="h6" className={classes.subTitle}>
            Default Map Type
          </Typography>
          <AutoCompleteControl
            placeHolder='Select Default Map Type'
            value={defaultMapTypeValue}
            options={defaultMapType}
            onDropDownChange={item => setDefaultMapTypeFilter(item)}
          />
        </div>
        <div className={classes.selectInput}>
          <Typography variant="h6" className={classes.subTitle}>
            Selected Trip Folder Types
          </Typography>
          <AutoCompleteControl
            placeHolder='Select Trip Folder Types'
            value={tripFolderTypesValue}
            options={tripFolderType}
            onDropDownChange={item => setSelectedTripFolderTypes(item)}
          />
        </div>
      </div>
      <div className={classes.checkboxSection}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={suppressWebGettingStartedGuideValue === 'true'}
              onChange={e => setSuppressWebGettingStartedGuide(e.target.checked ? 'true' : 'false')}
            />
          }
          label="Suppress Web Getting Started Guide"
        />
      </div>
    </>
  );
};

export default withStyles(styles)(Preferences);

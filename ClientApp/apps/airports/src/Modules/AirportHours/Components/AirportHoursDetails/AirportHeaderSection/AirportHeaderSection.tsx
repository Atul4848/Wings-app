import React, { FC } from 'react';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { VIEW_MODE, AirportModel } from '@wings/shared';
import { useAirportModuleSecurity } from '../../../../Shared';
import { Field } from 'mobx-react-form';
import { useStyles } from './AirportHeaderSection.styles';
import { PrimaryButton, SecondaryButton } from '@uvgo-shared/buttons';
import { IOptionValue, Utilities, ViewPermission, SettingsTypeModel } from '@wings-shared/core';
import { observer } from 'mobx-react';

interface Props {
  viewMode: VIEW_MODE;
  isDisabled?: boolean;
  isEditing?: boolean;
  isLoading?: boolean;
  airportHourTypes: SettingsTypeModel[];
  wingsAirports: AirportModel[];
  onAddNewAirport?: () => void;
  onValueChange: (value: IOptionValue, fieldKey: string) => void;
  getField: (fieldKey: string) => Field;
  onViewModeChange: (viewMode: VIEW_MODE) => void;
  onSearchAirport: (searchValue: string) => void;
  onAssociateAirport: () => void;
}

const AirportHeaderSection: FC<Props> = ({ isDisabled, viewMode, getField, isEditing, ...props }: Props) => {
  const isDetailsView: boolean = Utilities.isEqual(viewMode, VIEW_MODE.DETAILS);
  const classes = useStyles();

  const { isGRSUser, isEditable } = useAirportModuleSecurity();

  const hasAirportAndAirportHoursType = (): boolean => {
    const airport = getField('airport').value;
    const airportHoursType = getField('airportHoursType').value;
    return Boolean(airport && airportHoursType);
  };

  const airport: Field = getField('airport');
  const airportHoursType: Field = getField('airportHoursType');
  const associateAirport: Field = getField('associateAirport');
  const isInactive: boolean = airport.value?.inactive;
  const needAssociation = airport.value
    ? !Boolean(airport.value?.id) && !Utilities.isEqual(viewMode, VIEW_MODE.NEW)
    : false;

  const hasEditPermission = () => {
    // Has Edit Permissions
    if (isEditable || isGRSUser) {
      // GRS users can edit only CIQ Hours as per 91169
      return isGRSUser && !isEditable
        ? Utilities.isEqual(airportHoursType.value?.label, 'ciq')
        : true;
    }
    return false;
  };

  const disableHourType = () => {
    if (isGRSUser && !isEditable) {
      return Utilities.isEqual(airportHoursType.value?.label, 'ciq');
    }
    return isDisabled || needAssociation;
  };

  return (
    <div className={classes.root}>
      <ViewInputControl
        type={EDITOR_TYPES.DROPDOWN}
        isServerSideSearch={true}
        isEditable={true}
        options={props.wingsAirports}
        field={airport}
        isLoading={props.isLoading}
        isDisabled={isDisabled || needAssociation}
        getOptionLabel={options => (options as AirportModel).displayCode}
        filterOption={(value, { inputValue }) => {
          return value.filter(a => a.displayCode?.toLowerCase().includes(inputValue?.toLowerCase()));
        }}
        classes={{ flexRow: classes.flexRow }}
        onValueChange={props.onValueChange}
        onSearch={(searchValue, _) => props.onSearchAirport(searchValue)}
      />
      <ViewInputControl
        isEditable={true}
        type={EDITOR_TYPES.DROPDOWN}
        options={props.airportHourTypes}
        field={airportHoursType}
        isDisabled={disableHourType()}
        classes={{ flexRow: classes.flexRow }}
        onValueChange={props.onValueChange}
      />
      <ViewPermission hasPermission={needAssociation}>
        <ViewInputControl
          type={EDITOR_TYPES.DROPDOWN}
          isServerSideSearch={true}
          isEditable={true}
          options={props.wingsAirports}
          field={associateAirport}
          isLoading={props.isLoading}
          getOptionLabel={options => (options as AirportModel).displayCode}
          filterOption={(value, { inputValue }) => {
            return value.filter(a => a.displayCode?.toLowerCase().includes(inputValue?.toLowerCase()));
          }}
          classes={{ flexRow: classes.flexRow }}
          onValueChange={props.onValueChange}
          onSearch={(searchValue, _) => props.onSearchAirport(searchValue)}
        />
      </ViewPermission>
      <ViewPermission hasPermission={hasEditPermission()}>
        <div className={classes.addHours}>
          <ViewPermission hasPermission={isDetailsView && !isInactive}>
            <PrimaryButton
              variant="contained"
              disabled={isDisabled || props.isLoading}
              onClick={() => props.onViewModeChange(isEditing ? VIEW_MODE.DETAILS : VIEW_MODE.EDIT)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </PrimaryButton>
          </ViewPermission>
          <ViewPermission hasPermission={needAssociation}>
            <PrimaryButton
              variant="contained"
              onClick={props.onAssociateAirport}
              disabled={!Boolean(associateAirport.value?.id)}
            >
              Associate Airport
            </PrimaryButton>
          </ViewPermission>
          <ViewPermission hasPermission={Boolean(airport.value?.id)}>
            {isInactive ? (
              <SecondaryButton variant="contained">Inactive</SecondaryButton>
            ) : (
              <PrimaryButton
                variant="contained"
                disabled={
                  isDisabled || !isEditing || !hasAirportAndAirportHoursType() || needAssociation || props.isLoading
                }
                onClick={props.onAddNewAirport}
              >
                {`Add ${airportHoursType.value?.name || 'Airport'} Hours`}
              </PrimaryButton>
            )}
          </ViewPermission>
        </div>
      </ViewPermission>
    </div>
  );
};

export default observer(AirportHeaderSection);

import React, { FC, ReactNode, useEffect } from 'react';
import { CountryModel } from '@wings/shared';
import {
  FLIGHT_ALLOWED,
  HealthAuthModel,
  HealthAuthorizationLinkModel,
  HealthAuthorizationNOTAMModel,
  HealthAuthStore,
  SettingsStore,
} from '../../../../../Shared';
import { Field } from 'mobx-react-form';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import classNames from 'classnames';
import { forkJoin } from 'rxjs';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import {
  IAPIGridRequest,
  IOptionValue,
  ISelectOption,
  UIStore,
  Utilities,
  Loader,
  IdNameCodeModel,
  SettingsTypeModel,
} from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { Collapsable } from '@wings-shared/layout';
import { useStyles } from './GeneralRequirement.style';
import { useUnsubscribe } from '@wings-shared/hooks';
import HealthAuthLinkGrid from './HealthAuthLinkGrid/HealthAuthLinkGrid';
import HealthAuthorizationNOTAMGrid from './HealthAuthorizationNOTAMGrid/HealthAuthorizationNOTAMGrid';

interface Props {
  isEditable?: boolean;
  getField: (fieldKey: string) => Field;
  onChange: (value: IOptionValue, fieldKey: string) => void;
  setRules?: (fieldKey: string, required: boolean, label: string) => void;
  clearFields?: (fields: string[]) => void;
  onRowEdit: (isRowEditing: boolean) => void;
  healthAuth?: HealthAuthModel;
  settingsStore?: SettingsStore;
  healthAuthStore?: HealthAuthStore;
  isRowEditing?: boolean;
}

const GeneralRequirement: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const loader: Loader = new Loader(false, { type: PROGRESS_TYPES.CIRCLE });
  const _settingsStore = props.settingsStore as SettingsStore;
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;

  /* istanbul ignore next */
  useEffect(() => {
    const { generalInformation } = props.healthAuth as HealthAuthModel;
    setBusinessExemptionValidation(generalInformation.isBusinessExemption);
    forkJoin([ _settingsStore?.getFlightsAllowed(), _settingsStore?.getWhoCanLeaveAircraft() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    if (!props.isEditable) {
      const { generalInformation } = props.healthAuth as HealthAuthModel;
      setBusinessExemptionValidation(generalInformation.isBusinessExemption);
    }
  }, [ !props.isEditable ]);

  const flightsAllowedOptions = (): (IdNameCodeModel | SettingsTypeModel)[] => {
    const allFlights: SettingsTypeModel = new SettingsTypeModel({
      id: Utilities.getTempId(true),
      name: FLIGHT_ALLOWED.ALL_FLIGHT,
    });
    const noFlight: SettingsTypeModel = new SettingsTypeModel({
      id: Utilities.getTempId(true),
      name: FLIGHT_ALLOWED.NO_FLIGHT,
    });
    return [ ...[ allFlights, noFlight ], ...(_settingsStore?.flightsAllowed as IdNameCodeModel[]) ];
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General',
        inputControls: [
          {
            fieldKey: 'generalInformation.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isFullFlex: true,
            isHidden: !Boolean(_healthAuthStore?.selectedHealthAuth.parentId),
            isDisabled: props.isRowEditing,
          },
          {
            fieldKey: 'generalInformation.healthAuthorizationBannedTraveledCountries',
            type: EDITOR_TYPES.DROPDOWN,
            options: _healthAuthStore?.countries,
            multiple: true,
            getChipLabel: option => (option as CountryModel).isO2Code,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.isEssentialWorkersAllowed',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.flightsAllowed',
            type: EDITOR_TYPES.DROPDOWN,
            options: flightsAllowedOptions(),
            multiple: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.isCTSAccepted',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.isBusinessExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.businessExemptions',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isBusinessExemption() || isInherited(),
            isHidden: isBusinessExemption(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
          },
          {
            fieldKey: 'generalInformation.activeDutyCrewDefinition',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.crewSwapOnlyLegDetails',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isInherited(),
          },
        ],
      },
      {
        title: 'Tech Stop Details',
        inputControls: [
          {
            fieldKey: 'generalInformation.isTechStopAllowed',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.isFuelStopAllowed',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.whoCanLeaveAircraft',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore?.whoCanLeaveAircraft,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.serviceRestrictions',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isInherited(),
          },
        ],
      },
      {
        title: 'Spray Requirements',
        inputControls: [
          {
            fieldKey: 'generalInformation.isDisinsectionRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.isTopOfDescentSprayRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.isAircraftDisinfectionRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.isDocumentationRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.disinsectionSprayRequirements',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'generalInformation.otherInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isInherited(),
          },
        ],
      },
    ];
  };

  const isInherited = (): boolean => {
    return Boolean(props.getField('generalInformation.isInherited').value);
  };

  const isBusinessExemption = (): boolean => {
    return !Boolean(props.getField('generalInformation.isBusinessExemption').value);
  };

  const setBusinessExemptionValidation = (isRequired: boolean): void => {
    const { setRules, clearFields } = props as Required<Props>;
    setRules('generalInformation.businessExemptions', isRequired, 'Business Exemption Requirements');
    if (!isRequired) {
      clearFields([ 'generalInformation.businessExemptions' ]);
    }
  };

  const onChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    switch (fieldKey) {
      case 'generalInformation.isBusinessExemption':
        setBusinessExemptionValidation(Boolean(value));
        props.onChange(value, fieldKey);
        break;
      case 'generalInformation.flightsAllowed':
        const isAllorNoFlight = (value as SettingsTypeModel[]).find(
          x => x.name === FLIGHT_ALLOWED.ALL_FLIGHT || x.name === FLIGHT_ALLOWED.NO_FLIGHT
        );
        props.onChange(isAllorNoFlight ? [ isAllorNoFlight ] : value, fieldKey);
        break;
      case 'generalInformation.isInherited':
        props.onChange(value, fieldKey);
        break;
      default:
        props.onChange(value, fieldKey);
        break;
    }
  };

  const getOptionDisabled = (option: ISelectOption, value: ISelectOption[]): boolean => {
    if (value?.length) {
      const noFlight: boolean = value.some(x => x.label === FLIGHT_ALLOWED.NO_FLIGHT);
      const allFlights: boolean = value.some(x => x.label === FLIGHT_ALLOWED.ALL_FLIGHT);
      if (
        (option.label === FLIGHT_ALLOWED.NO_FLIGHT && noFlight) ||
        (option.label === FLIGHT_ALLOWED.ALL_FLIGHT && allFlights)
      ) {
        return false;
      }
      return noFlight || allFlights;
    }
    return false;
  };

  const healthAuthLinks = (): HealthAuthorizationLinkModel[] => {
    return props.getField('generalInformation.healthAuthorizationLinks').values();
  };

  const healthAuthorizationNOTAMs = (): HealthAuthorizationNOTAMModel[] => {
    return props.getField('generalInformation.healthAuthorizationNOTAMs').values();
  };

  const healthAuthLinkGrid = (): ReactNode => {
    const { isEditable, onRowEdit, getField } = props as Required<Props>;
    return (
      <HealthAuthLinkGrid
        isEditable={isEditable && !isInherited()}
        rowData={healthAuthLinks()}
        onDataUpdate={(formRequirements: HealthAuthorizationLinkModel[]) =>
          onChange(formRequirements, 'generalInformation.healthAuthorizationLinks')
        }
        onRowEdit={isRowEditing => {
          getField('generalInformation.healthAuthorizationLinks').onFocus();
          onRowEdit(isRowEditing);
        }}
      />
    );
  };

  const healthAuthorizationNOTAMGrid = (): ReactNode => {
    const { isEditable, onRowEdit, getField } = props as Required<Props>;
    return (
      <HealthAuthorizationNOTAMGrid
        isEditable={isEditable && !isInherited()}
        rowData={healthAuthorizationNOTAMs()}
        onDataUpdate={(formRequirements: HealthAuthorizationNOTAMModel[]) =>
          onChange(formRequirements, 'generalInformation.healthAuthorizationNOTAMs')
        }
        onRowEdit={isRowEditing => {
          getField('generalInformation.healthAuthorizationNOTAMs').onFocus();
          onRowEdit(isRowEditing);
        }}
      />
    );
  };

  const onFocus = (fieldkey: string): void => {
    if (fieldkey === 'healthAuthorizationBannedTraveledCountries') {
      loadCountries();
    }
  };

  const onSearch = (option: string, fieldKey: string): void => {
    if (fieldKey === 'healthAuthorizationBannedTraveledCountries') {
      loadCountries(option);
    }
  };

  /* istanbul ignore next */
  const loadCountries = (propertyValue?: string, regionId: number = 0): void => {
    loader.setLoadingState(true);
    const searchCollection = [
      {
        propertyName: 'CommonName',
        operator: 'and',
        propertyValue,
      },
      {
        propertyName: 'ISO2Code',
        operator: 'or',
        propertyValue,
      },
    ];

    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: regionId ? 0 : 10,
      searchCollection: propertyValue ? JSON.stringify(searchCollection) : null,
      filterCollection: regionId
        ? JSON.stringify([
          {
            propertyName: 'AssociatedRegions.RegionId',
            propertyValue: regionId,
          },
        ])
        : null,
    };
    props.healthAuthStore
      ?.getCountries(request, true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => loader.setLoadingState(false))
      )
      .subscribe();
  };

  return (
    <div className={classes.flexContainer}>
      <div className={classes.flexRow}>
        {groupInputControls().map((groupInputControl, index) => (
          <div key={index}>
            <Collapsable title={groupInputControl.title}>
              <div className={classes.flexWrap}>
                {groupInputControl.inputControls
                  .filter((inputControl: IViewInputControl) => !inputControl.isHidden)
                  .map((inputControl: IViewInputControl, index: number) => {
                    return (
                      <ViewInputControl
                        {...inputControl}
                        key={index}
                        isExists={inputControl.isExists}
                        isEditable={props.isEditable}
                        classes={{
                          flexRow: classNames({
                            [classes.inputControl]: !inputControl.isFullFlex,
                            [classes.fullFlex]: inputControl.isFullFlex,
                            [classes.leftIndent]: inputControl.isIndent,
                          }),
                          autoCompleteInputRoot: classNames({
                            [classes.autoCompleteInputRoot]: inputControl.multiple,
                          }),
                        }}
                        getOptionDisabled={(option: ISelectOption, selectedOption: ISelectOption | ISelectOption[]) => {
                          return getOptionDisabled(option, selectedOption as ISelectOption[]);
                        }}
                        field={props.getField(inputControl.fieldKey || '')}
                        onValueChange={(option, fieldKey) => onChange(option, inputControl.fieldKey || '')}
                        onFocus={(fieldKey: string) => onFocus(fieldKey)}
                        onSearch={(option: string, fieldKey: string) => onSearch(option, fieldKey)}
                      />
                    );
                  })}
              </div>
            </Collapsable>
          </div>
        ))}
        <div>{healthAuthLinkGrid()}</div>
        <div>{healthAuthorizationNOTAMGrid()}</div>
      </div>
    </div>
  );
};

export default inject('settingsStore', 'healthAuthStore')(observer(GeneralRequirement));

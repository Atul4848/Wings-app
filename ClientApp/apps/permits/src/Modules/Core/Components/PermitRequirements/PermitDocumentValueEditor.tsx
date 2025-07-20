/* eslint-disable no-debugger */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  AgGridAutoCompleteV2,
  AgGridCellEditor,
  AgGridSelectControl,
  ICellInstance,
  AgGridPopoverWrapper,
} from '@wings-shared/custom-ag-grid';
import { UIStore, getYesNoNullToBoolean, tapWithAction } from '@wings-shared/core';
import { ICellEditorParams, RowNode } from 'ag-grid-community';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { inject, observer } from 'mobx-react';
import { of } from 'rxjs';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import {
  CONDITION_EDITOR,
  PermitSettingsStore,
  PermitStore,
  RuleFilterModel,
  PermitDocumentRuleValueModel,
} from '../../../Shared';
import { integerFields } from './Fields';

export interface Props extends ICellEditorParams {
  settingsStore: PermitSettingsStore;
  permitStore: PermitStore;
  isRequired?: (node: RowNode) => boolean;
  getDisableState?: (node: RowNode) => boolean;
}

export interface IAirportConditionValueEditor extends ICellInstance {
  current: ICellInstance;
}

export interface IChildRef extends ICellInstance {
  getValue: () => any;
  setConditionOperator: (conditionOperator) => void;
}

const PermitDocumentValueEditor = (props: Props, ref) => {
  const [ isLoading, setIsLoading ] = useState(false);
  const childComponentRef = useRef<ICellInstance>();

  const [ refreshKey, setRefreshKey ] = useState(new Date().getTime().toString());
  const [ value, setValue ] = useState<PermitDocumentRuleValueModel[]>([]);
  const [ isMounted, setIsMounted ] = useState(false);
  const [ editorType, setEditorType ] = useState('');
  const [ entityOptions, setEntityOptions ] = useState<PermitDocumentRuleValueModel[]>([]);
  const _settingsStore = props.settingsStore;
  const _permitStore = props.permitStore;
  const unsubscribe = useUnsubscribe();
  // Condition Operators i.e = != > < in Not In
  const [ conditionOperator, setConditionOperator ] = useState('');

  const isMultiSelect = [ 'In', 'NotIn' ].includes(conditionOperator);

  const inputType = useMemo(() => {
    if (integerFields.includes(editorType)) {
      return 'number';
    }
    return 'text';
  }, [ editorType ]);

  useEffect(() => {
    const tempValue = PermitDocumentRuleValueModel.mapBooleanFields(props.value || []).filter(x => x.label?.toString());
    setValue(tempValue);
    const tempEditorType = props.data?.condition?.conditionType?.label;
    setEditorType(tempEditorType);
    setIsMounted(true);
  }, []);

  /* istanbul ignore next */
  useImperativeHandle(ref, () => {
    return {
      setValue: val => {
        setValue(val);
        setRefreshKey(new Date().getTime().toString());
        if (typeof childComponentRef.current?.setValue === 'function') {
          childComponentRef.current?.setValue(val);
        }
      },
      getValue: () => value,
      setRules: r => {
        setTimeout(() => {
          if (typeof childComponentRef.current?.setRules === 'function') {
            childComponentRef.current?.setRules(r);
            setRefreshKey(new Date().getTime().toString());
          }
        }, 100);
      },
      setCustomError: r => {
        if (typeof childComponentRef.current?.setCustomError === 'function') {
          childComponentRef.current?.setCustomError(r);
        }
      },
      setEditorType: e => {
        setEditorType(e);
      },
      setConditionOperator,
    };
  });

  // When Editor Type changed then Load it's corresponding options
  useEffect(() => {
    loadEntityOptions();
  }, [ editorType, conditionOperator ]);

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    if (!editorType) {
      return;
    }
    let observableOfType = of<any>([]);
    switch (editorType) {
      case CONDITION_EDITOR.AIRCRAFT_CATEGORY:
        observableOfType = _permitStore
          .getAircraftCategories()
          .pipe(map(response => PermitDocumentRuleValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.ICAO_AERODROME_REFERENCE_CODE:
        observableOfType = _permitStore.getAerodromeReferenceCodes().pipe(
          map(response => {
            return response.map(x => PermitDocumentRuleValueModel.mapEntity(x.code, x.id));
          })
        );
        break;
      case CONDITION_EDITOR.NOISE_CHAPTER:
        observableOfType = _settingsStore
          .getNoiseChapters()
          .pipe(map(response => PermitDocumentRuleValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.REGISTRATION_NATIONALITY_SOVEREIGNTY:
      case CONDITION_EDITOR.REGISTRATION_NATIONALITY:
      case CONDITION_EDITOR.ARRIVAL_COUNTRY:
      case CONDITION_EDITOR.COUNTRIES_OVERFLOWN:
      case CONDITION_EDITOR.COUNTRY_FIRS_OVERFLOWN:
      case CONDITION_EDITOR.COUNTRY_POLYGONS_OVERFLOWN:
      case CONDITION_EDITOR.DEPARTURE_COUNTRY:
      case CONDITION_EDITOR.NEXT_DESTINATION_COUNTRY:
      case CONDITION_EDITOR.OPERATOR_NATIONALITY:
        observableOfType = _permitStore.getCountries().pipe(
          map(response => {
            return response.map(x =>
              PermitDocumentRuleValueModel.mapEntity(`${x.commonName} (${x.isO2Code})`, x.countryId)
            );
          })
        );
        break;
      case CONDITION_EDITOR.REGISTRATION_NATIONALITY_REGION:
      case CONDITION_EDITOR.DEPARTURE_REGION:
      case CONDITION_EDITOR.NEXT_DESTINATION_REGION:
      case CONDITION_EDITOR.OPERATOR_NATIONALITY_REGION:
        observableOfType = _permitStore
          .getRegions()
          .pipe(map(response => PermitDocumentRuleValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.AIRPORTOFENTRY_AOE:
        observableOfType = _permitStore.getAirportOfEntries().pipe(
          map(response => {
            return response.results?.map(x => PermitDocumentRuleValueModel.mapEntity(`${x.name} (${x.code})`, x.id));
          })
        );
        break;
      case CONDITION_EDITOR.CROSSING_TYPE:
        observableOfType = _settingsStore
          .getCrossingType()
          .pipe(map(response => PermitDocumentRuleValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.FARTYPE:
        observableOfType = _settingsStore.getFARTypes().pipe(
          map(response => {
            return response.map(x => PermitDocumentRuleValueModel.mapEntity(x.name, x.id));
          })
        );
        break;
      case CONDITION_EDITOR.FIR:
        observableOfType = _permitStore
          .getFIRs()
          .pipe(map(response => PermitDocumentRuleValueModel.mapIdNameCodeEntities(response)));
        break;

      case CONDITION_EDITOR.PURPOSE_OF_Flight:
        observableOfType = _settingsStore
          .getFlightPurposes()
          .pipe(map(response => PermitDocumentRuleValueModel.mapSettingsTypeModel(response)));
        break;

      default:
        observableOfType = of([]);
    }
    UIStore.setPageLoader(true);
    observableOfType
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$),
        tapWithAction(response => setEntityOptions(response))
      )
      .subscribe();
  };

  // When user search something
  const onSearch = (ruleFilter: RuleFilterModel | null, searchValue: string) => {
    // only search if there is search value and it's aircraft type settings

    if (
      !searchValue &&
      editorType !==
        (CONDITION_EDITOR.ARRIVAL_AIRPORT ||
          CONDITION_EDITOR.DEPARTURE_AIRPORT ||
          CONDITION_EDITOR.ARRIVAL_STATE ||
          CONDITION_EDITOR.NEXT_DESTINATION_AIRPORT)
    ) {
      return;
    }
    switch (editorType) {
      case CONDITION_EDITOR.DEPARTURE_AIRPORT:
      case CONDITION_EDITOR.NEXT_DESTINATION_AIRPORT:
      case CONDITION_EDITOR.ARRIVAL_AIRPORT:
        if (!searchValue) {
          _permitStore.wingsAirports = [];
          return;
        }
        UIStore.setPageLoader(true);
        _permitStore
          .searchWingsAirports(searchValue, true)
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe(response => {
            const options = PermitDocumentRuleValueModel.mapIdNameCodeEntitiesOfAirport(response);
            setEntityOptions(options);
          });
        break;
      case CONDITION_EDITOR.ARRIVAL_STATE:
        {
          UIStore.setPageLoader(true);
          const searchCollection = JSON.stringify(
            searchValue
              ? [
                { propertyName: 'CommonName', operator: 'and', propertyValue: searchValue },
                { propertyName: 'ISOCode', operator: 'or', propertyValue: searchValue },
              ]
              : []
          );
          _permitStore
            .getStates({ searchCollection, pageSize: 50 })
            .pipe(
              takeUntil(unsubscribe.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe(response => {
              const options = PermitDocumentRuleValueModel.mapIdNameCodeEntitiesOfState(response);
              setEntityOptions(options);
            });
        }
        break;
    }
  };

  //Modify Props To inject dropdown method into context
  const modifiedProps = {
    ...props,
    value,
    context: {
      ...props.context,
      componentParent: {
        ...props.context.componentParent,
        onDropDownChange: (params, value) => {
          const arrayValue = Array.isArray(value)
            ? value
            : typeof value === 'boolean'
              ? [ new PermitDocumentRuleValueModel({ ruleValue: value }) ]
              : [ value ];
          setValue(arrayValue);
          props.context.componentParent.onDropDownChange(params, arrayValue);
          // need some delay to prepare ag grid context
          setTimeout(() => props.context.componentParent.onDropDownChange(params, arrayValue), 300);
        },
        onInputChange: (params, value) => {
          const cValue = [ new PermitDocumentRuleValueModel({ ruleValue: value }) ];
          setValue(cValue);
          const { componentParent } = props.context;
          if (componentParent && typeof componentParent.onInputChange === 'function') {
            componentParent.onInputChange(params, cValue);
          }
          // need some delay to prepare ag grid context
          setTimeout(() => props.context.componentParent.onInputChange(params, cValue), 300);
        },
      },
    },
  };

  if (!isMounted) {
    return <></>;
  }
  switch (editorType) {
    case CONDITION_EDITOR.AIRPORT_OF_ENTRY:
    case CONDITION_EDITOR.MILITARY_AIRPORT:
    case CONDITION_EDITOR.IS_CARGO_DISEMBARKATION:
    case CONDITION_EDITOR.IS_CARGO_EMBARKATION:
    case CONDITION_EDITOR.IS_CARGO_FLIGHT:
    case CONDITION_EDITOR.IS_FLIGHT_NUMBER_EXISTS:
    case CONDITION_EDITOR.IS_PAX_DISEMBARKATION:
    case CONDITION_EDITOR.IS_PAX_EMBARKATION:
    case CONDITION_EDITOR.IS_RON:
    case CONDITION_EDITOR.IS_TECH_STOP:
    case CONDITION_EDITOR.IS_ARRIVAL_COUNTRY_REGISTRATION_NATIONALITY_COUNTRY:
    case CONDITION_EDITOR.IS_DEPARTURE_COUNTRY_REGISTRATION_NATIONALITY_COUNTRY:
    case CONDITION_EDITOR.IS_NEXT_DESTINATION_COUNTRY_REGISTRATION_NATIONALITY_COUNTRY:
      return (
        <AgGridSelectControl
          {...modifiedProps}
          innerRef={childComponentRef}
          value={getYesNoNullToBoolean(value[0]?.label) ?? []}
          isBoolean={true}
          excludeEmptyOption={true}
        />
      );
    case CONDITION_EDITOR.ARRIVAL_AIRPORT:
    case CONDITION_EDITOR.DEPARTURE_REGION:
    case CONDITION_EDITOR.ICAO_AERODROME_REFERENCE_CODE:
    case CONDITION_EDITOR.NOISE_CHAPTER:
    case CONDITION_EDITOR.REGISTRATION_NATIONALITY_REGION:
    case CONDITION_EDITOR.REGISTRATION_NATIONALITY:
    case CONDITION_EDITOR.DEPARTURE_COUNTRY:
    case CONDITION_EDITOR.REGISTRATION_NATIONALITY_SOVEREIGNTY:
    case CONDITION_EDITOR.STATE:
    case CONDITION_EDITOR.AIRPORTOFENTRY_AOE:
    case CONDITION_EDITOR.CROSSING_TYPE:
    case CONDITION_EDITOR.ARRIVAL_COUNTRY:
    case CONDITION_EDITOR.COUNTRIES_OVERFLOWN:
    case CONDITION_EDITOR.COUNTRY_FIRS_OVERFLOWN:
    case CONDITION_EDITOR.COUNTRY_POLYGONS_OVERFLOWN:
    case CONDITION_EDITOR.AIRCRAFT_CATEGORY:
    case CONDITION_EDITOR.DEPARTURE_AIRPORT:
    case CONDITION_EDITOR.ARRIVAL_STATE:
    case CONDITION_EDITOR.FARTYPE:
    case CONDITION_EDITOR.FIR:
    case CONDITION_EDITOR.NEXT_DESTINATION_AIRPORT:
    case CONDITION_EDITOR.NEXT_DESTINATION_COUNTRY:
    case CONDITION_EDITOR.NEXT_DESTINATION_REGION:
    case CONDITION_EDITOR.OPERATOR_NATIONALITY:
    case CONDITION_EDITOR.OPERATOR_NATIONALITY_REGION:
    case CONDITION_EDITOR.PURPOSE_OF_Flight:
      const autoCompleteValue = isMultiSelect ? value || [] : value[0];
      const hasError = isMultiSelect ? !Boolean(autoCompleteValue[0]?.label) : false;
      return (
        <AgGridPopoverWrapper
          suppressPopover={!isMultiSelect}
          chipsValues={value}
          key={refreshKey}
          hasError={hasError}
          tooltip={`${props.colDef.headerName} is Required`}
        >
          <AgGridAutoCompleteV2
            {...(modifiedProps as any)}
            ref={childComponentRef}
            optionCompareKey={() => 'value'}
            getAutoCompleteOptions={() => entityOptions}
            onSearch={(value: string) => onSearch(null, value)}
            getIsLoading={() => isLoading}
            isRequired={() => Boolean(conditionOperator)}
            multiple={() => isMultiSelect}
            value={autoCompleteValue}
            hideTooltip={isMultiSelect}
          />
        </AgGridPopoverWrapper>
      );
    default:
      if (isMultiSelect) {
        const stringValue = value.map(x => x?.ruleValue?.toString());
        return (
          <AgGridPopoverWrapper suppressPopover={!isMultiSelect} chipsValues={value}>
            <Autocomplete
              id="free-solo-input-control"
              freeSolo
              multiple
              autoSelect
              options={[]}
              value={stringValue as any}
              disableClearable={true}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Type something and press enter to add"
                  type={inputType}
                  inputProps={{ ...params.inputProps, min: 0 }}
                />
              )}
              onChange={(e, arr, reason) => {
                if ([ 'remove-option', 'create-option' ].includes(reason)) {
                  const newOptions = [ ...new Set(arr) ].map(x => {
                    return new PermitDocumentRuleValueModel({
                      ruleValue: x,
                    });
                  });
                  modifiedProps.context.componentParent.onDropDownChange(modifiedProps, newOptions);
                }
              }}
            />
          </AgGridPopoverWrapper>
        );
      }

      return (
        <AgGridCellEditor
          {...modifiedProps}
          ref={childComponentRef}
          value={value ? value[0]?.label || '' : ''}
          type={inputType}
          inputProps={{ min: 0 }}
          key={inputType}
        />
      );
  }
};

export default inject('settingsStore', 'permitStore')(observer(forwardRef(PermitDocumentValueEditor)));

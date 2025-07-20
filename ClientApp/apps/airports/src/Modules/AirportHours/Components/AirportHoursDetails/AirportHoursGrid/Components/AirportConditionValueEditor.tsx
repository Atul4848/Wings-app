/* eslint-disable no-debugger */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  AgGridAutoCompleteV2,
  AgGridCellEditor,
  AgGridSelectControl,
  ICellInstance,
  AgGridPopoverWrapper,
} from '@wings-shared/custom-ag-grid';
import { UIStore, Utilities, tapWithAction } from '@wings-shared/core';
import { AirportSettingsStore, CONDITION_EDITOR, ConditionValueModel } from '../../../../../Shared';
import { ICellEditorParams, RowNode } from 'ag-grid-community';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { observer } from 'mobx-react';
import { of } from 'rxjs';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import { integerFields } from '../AirportHoursGridHelper';

export interface Props extends Partial<ICellEditorParams> {
  settingsStore: AirportSettingsStore;
  isRequired: (node: RowNode) => boolean;
  getDisableState: (node: RowNode) => boolean;
}

export interface IAirportConditionValueEditor extends ICellInstance {
  current: ICellInstance;
}

export interface IChildRef extends ICellInstance {
  getValue: () => any;
  setConditionOperator: (conditionOperator) => void;
}

const AirportConditionValueEditor = (props: Props, ref) => {
  const [ isLoading, setIsLoading ] = useState(false);
  const childComponentRef = useRef<ICellInstance>();

  const [ refreshKey, setRefreshKey ] = useState(new Date().getTime().toString());
  const [ value, setValue ] = useState<ConditionValueModel[]>([]);
  const [ isMounted, setIsMounted ] = useState(false);
  const [ editorType, setEditorType ] = useState('');
  const [ entityOptions, setEntityOptions ] = useState<ConditionValueModel[]>([]);
  const _settingsStore = props.settingsStore;
  const unsubscribe = useUnsubscribe();
  // Condition Operators i.e = != > < in Not In
  const [ conditionOperator, setConditionOperator ] = useState('');

  const isMultiSelect = [ 'in', 'not in' ].includes(conditionOperator?.toLocaleLowerCase());

  const inputType = useMemo(() => {
    if (integerFields.includes(editorType?.toLowerCase())) {
      return 'number';
    }
    return 'text';
  }, [ editorType ]);

  /* istanbul ignore next */
  useEffect(() => {
    const tempValue = Array.isArray(props.value) ? props.value.filter(x => x.label?.toString()) : [];
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
        setTimeout(() => {
          if (typeof childComponentRef.current?.setValue === 'function') {
            childComponentRef.current?.setValue(val);
          }
        }, 100);
      },
      setRules: r => {
        setTimeout(() => {
          if (typeof childComponentRef.current?.setRules === 'function') {
            childComponentRef.current?.setRules(r);
            setRefreshKey(new Date().getTime().toString());
          }
        }, 100);
      },
      getValue: () => value,
      setEditorType: e => {
        setEntityOptions([]);
        setEditorType(e);
      },
      setConditionOperator,
    };
  });

  /* istanbul ignore next */
  // When Editor Type changed then Load it's corresponding options
  useEffect(() => {
    loadEntityOptions();
  }, [ editorType ]);

  const loadEntityOptions = () => {
    if (!editorType) {
      return;
    }
    const _editorType = editorType.toLowerCase();
    let observableOfType = of<any>([]);
    switch (_editorType) {
      case CONDITION_EDITOR.TRAFFIC:
      case CONDITION_EDITOR.TRAFFIC_ARRIVAL_ONLY:
      case CONDITION_EDITOR.TRAFFIC_DEPARTURE_ONLY:
        observableOfType = _settingsStore
          .getFarTypes()
          .pipe(map(response => response.map(x => ConditionValueModel.mapEntity(x.id, x.name, x.cappsCode))));
        break;
      case CONDITION_EDITOR.NOISE_CHAPTER_ARRIVAL:
      case CONDITION_EDITOR.NOISE_CHAPTER:
      case CONDITION_EDITOR.NOISE_CHAPTER_DEPARTURE:
        observableOfType = _settingsStore
          .getNoiseChapters()
          .pipe(map(response => ConditionValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.FLIGHT_TYPES:
        observableOfType = _settingsStore
          .loadFlightType()
          .pipe(map(response => response.map(x => ConditionValueModel.mapEntity(x.id, x.code))));
        break;
      case CONDITION_EDITOR.OVERTIME:
        observableOfType = _settingsStore
          .loadOvertime()
          .pipe(map(response => ConditionValueModel.mapSettingsTypeModel(response)));
        break;
      case CONDITION_EDITOR.EPN_DB:
        observableOfType = _settingsStore
          .loadNoiseClassifications()
          .pipe(map(response => ConditionValueModel.mapSettingsTypeModel(response)));
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
  const onSearch = (searchValue: string) => {
    // only search if there is search value and it's aircraft type settings
    if (!searchValue || editorType.toLowerCase() !== CONDITION_EDITOR.AIRCRAFT_TYPE) {
      return;
    }
    const request = {
      searchCollection: JSON.stringify([{ propertyName: 'CAPPSRecordId', propertyValue: searchValue }]),
      specifiedFields: [ 'CAPPSRecordId', 'AircraftVariationId' ],
    };
    setIsLoading(true);
    _settingsStore
      .getAircraftVariations(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => setIsLoading(false))
      )
      .subscribe(response => {
        const options = ConditionValueModel.mapIdNameCodeEntities(response.results);
        setEntityOptions(options);
      });
  };

  /* istanbul ignore next */
  // Modify Props To inject dropdown method into context
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
              ? [ new ConditionValueModel({ entityValue: value }) ]
              : [ value ];
          setValue(arrayValue);
          // need some delay to prepare ag grid context
          setTimeout(() => props.context.componentParent.onDropDownChange(params, arrayValue), 300);
        },
        onInputChange: (params, value) => {
          const cValue = [ new ConditionValueModel({ entityValue: value }) ];
          setValue(cValue);
          // need some delay to prepare ag grid context
          setTimeout(() => props.context.componentParent.onInputChange(params, cValue), 300);
        },
      },
    },
  };

  if (!isMounted) {
    return <></>;
  }

  switch (editorType?.toLowerCase()) {
    case CONDITION_EDITOR.ARRIVAL:
    case CONDITION_EDITOR.DEPARTURE:
    case CONDITION_EDITOR.USE_AS_ALTERNATE:
    case CONDITION_EDITOR.EVENT:
      return (
        <AgGridSelectControl
          {...modifiedProps}
          innerRef={childComponentRef}
          disabled={props.getDisableState(props.node)}
          value={value[0]?.label}
          isBoolean={true}
          excludeEmptyOption={true}
        />
      );
    case CONDITION_EDITOR.AIRCRAFT_TYPE:
    case CONDITION_EDITOR.FLIGHT_TYPES:
    case CONDITION_EDITOR.TRAFFIC:
    case CONDITION_EDITOR.TRAFFIC_ARRIVAL_ONLY:
    case CONDITION_EDITOR.TRAFFIC_DEPARTURE_ONLY:
    case CONDITION_EDITOR.NOISE_CHAPTER_ARRIVAL:
    case CONDITION_EDITOR.NOISE_CHAPTER:
    case CONDITION_EDITOR.NOISE_CHAPTER_DEPARTURE:
    case CONDITION_EDITOR.OVERTIME:
    case CONDITION_EDITOR.EPN_DB:
      const autoCompleteValue = isMultiSelect ? value || [] : value[0];
      const hasError = isMultiSelect ? !Boolean(autoCompleteValue[0]?.entityValue) : false;
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
            onSearch={onSearch}
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
        const stringValue = value.map(x => x.entityValue?.toString());
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
                  const newOptions = [ ...new Set(arr) ].map(
                    x =>
                      new ConditionValueModel({
                        entityValue: x,
                        isTempId: true,
                        entityValueId: Utilities.getTempId(true),
                      })
                  );
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
          value={value ? value[0]?.entityValue || '' : ''}
          type={inputType}
          inputProps={{ min: 0 }}
          key={inputType}
        />
      );
  }
};

export default observer(forwardRef(AirportConditionValueEditor));

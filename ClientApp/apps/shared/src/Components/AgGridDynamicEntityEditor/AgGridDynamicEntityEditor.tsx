/* eslint-disable no-debugger */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { EntityMapModel, ISelectOption, Utilities } from '@wings-shared/core';
import {
  AgGridAutoCompleteV2,
  AgGridCellEditor,
  AgGridPopoverWrapper,
  AgGridSelectControl,
  ICellInstance,
} from '@wings-shared/custom-ag-grid';
import { EDITOR_TYPES } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ICellEditorParams, RowNode } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DynamicEntityModel } from '../../Models';

export interface Props extends Partial<ICellEditorParams> {
  settingsStore: any;
  isRequired: (node: RowNode) => boolean;
  getDisableState: (node: RowNode) => boolean;
  onSearch: (searchText) => Observable<ISelectOption[]>;
}

export interface IAgGridDynamicEntityEditor extends ICellInstance {
  current: ICellInstance;
  setEditorType: (a: EDITOR_TYPES) => void;
  setConditionOperator: (a) => void;
  setInputType: (a) => void;
}

export interface IChildRef extends ICellInstance {
  getValue: () => any;
  setConditionOperator: (conditionOperator) => void;
}

const AgGridDynamicEntityEditor = (props: Props, ref) => {
  const [ isLoading, setIsLoading ] = useState(false);
  const childComponentRef = useRef<ICellInstance>();

  const [ refreshKey, setRefreshKey ] = useState(new Date().getTime().toString());
  const [ value, setValue ] = useState<ISelectOption[]>([]);
  const [ isMounted, setIsMounted ] = useState(false);
  const [ editorType, setEditorType ] = useState('');
  const [ inputType, setInputType ] = useState('text');
  const [ entityOptions, setEntityOptions ] = useState<ISelectOption[]>([]);
  const unsubscribe = useUnsubscribe();

  // Condition Operators i.e = != > < in Not In
  const [ conditionOperator, setConditionOperator ] = useState('');

  const isMultiSelect = [ 'in', 'not in' ].includes(conditionOperator?.toLocaleLowerCase());

  /* istanbul ignore next */
  useEffect(() => {
    const tempValue = Array.isArray(props.value) ? props.value.filter(x => x.label?.toString()) : [];
    setValue(tempValue);
    const tempEditorType = props.data?.condition?.conditionType?.label;
    setEditorType(tempEditorType);
    setIsMounted(true);
  }, []);

  /* istanbul ignore next */
  useImperativeHandle(
    ref,
    () => {
      return {
        setInputType,
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
        setEntityOptions: e => {
          setEntityOptions(e);
        },
        setConditionOperator,
      };
    },
    [ value ]
  );

  // When user search something
  const onSearch = (searchValue: string) => {
    if (!searchValue) {
      return;
    }
    // Make sure this on search return the obserable object
    if (!props.onSearch) return;

    setIsLoading(true);
    props
      .onSearch(searchValue)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => setIsLoading(false))
      )
      .subscribe(response => setEntityOptions(response));
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
              ? [ new DynamicEntityModel({ name: value as any }) ]
              : [ value ];
          setValue(arrayValue);
          // need some delay to prepare ag grid context
          setTimeout(() => props.context.componentParent.onDropDownChange(params, arrayValue), 300);
        },
        onInputChange: (params, value) => {
          const cValue = [ new EntityMapModel({ name: value }) ];
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

  switch (editorType) {
    case EDITOR_TYPES.SELECT_CONTROL:
      return (
        <AgGridSelectControl
          {...modifiedProps}
          innerRef={childComponentRef}
          disabled={props.getDisableState(props.node)}
          value={value[0]?.label}
          isBoolean={true}
          excludeEmptyOption={true}
          isRequired={() => Boolean(conditionOperator)}
        />
      );
    case EDITOR_TYPES.DROPDOWN:
    case EDITOR_TYPES.AUTO_COMPLETE:
      const autoCompleteValue = isMultiSelect ? value || [] : value[0];
      const hasError = isMultiSelect ? !Boolean(autoCompleteValue[0]?.name) : false;
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
        const stringValue = value.map(x => x.value?.toString());
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
                      new DynamicEntityModel({
                        name: x,
                        isTempId: true,
                        entityId: Utilities.getTempId(true),
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
          ref={childComponentRef as any}
          value={value ? value[0]?.value || value[0]?.label : ''}
          type={inputType}
          inputProps={{ min: 0 }}
          key={inputType}
          getRules={() => (Boolean(conditionOperator) ? 'required' : '')}
        />
      );
  }
};

export default observer(forwardRef(AgGridDynamicEntityEditor));

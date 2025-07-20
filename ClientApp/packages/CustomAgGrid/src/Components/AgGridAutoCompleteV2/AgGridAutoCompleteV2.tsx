import { TextField, debounce } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { ISelectOption, Utilities } from '@wings-shared/core';
import { ICellEditorParams, RowNode } from 'ag-grid-community';
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { ICellInstance } from '../../Interfaces';
import AgGridTooltip from '../AgGridTooltip/AgGridTooltip';
import { useStyles } from './AgGridAutoCompleteV2.styles';

export interface Props extends ICellEditorParams {
  optionCompareKey?: (node?: RowNode) => string;
  isRequired: (node: RowNode) => boolean;
  getDisableState: (node: RowNode) => boolean;
  // Auto Complete Props
  getAutoCompleteOptions: () => ISelectOption[];
  getIsLoading?: () => boolean;
  onSearch?: (searchValue?: string, node?: RowNode) => void;
  onDropDownChange?: (props: ICellEditorParams, value) => void;
  // Add Props which directly used in Auto complete
  freeSolo: (node) => boolean;
  multiple: (node) => boolean;
  disableClearable: false;
  hideTooltip?: boolean;
}

export interface IAirportConditionValueEditor extends ICellInstance {
  current: ICellInstance;
}

export interface IChildRef extends ICellInstance {
  getValue: () => any;
}

// Call a optional function
const callable = (fun, ...params) => (typeof fun === 'function' ? fun(...params) : '');

// Note : please do not over load with props
const AgGridAutoCompleteV2 = (props: Props, ref) => {
  const classes = useStyles();
  const [ value, setValue ] = useState<any>(props.value);

  const multiple = useMemo(() => callable(props.multiple, props.node), []);
  const freeSolo = useMemo(() => callable(props.freeSolo, props.node), []);

  // Components which can be accessed by Parent Components
  useImperativeHandle(ref, () => {
    return {
      setValue,
      getValue: () => value,
    };
  });

  const onDropDownChange = (event, value: ISelectOption | ISelectOption[]) => {
    setValue(value);
    callable(props?.context?.componentParent?.onDropDownChange, props, value);
  };

  const getOptionSelected = (currentOption: ISelectOption, values: ISelectOption | ISelectOption[]) => {
    if (!values) {
      return false;
    }
    const fieldKey = props.optionCompareKey(props.node);
    return Array.isArray(values)
      ? values.map(options => options[fieldKey]).includes(currentOption[fieldKey])
      : Utilities.isEqual(currentOption[fieldKey], values[fieldKey]);
  };

  // If is required true then we needs to check if user provided the value or not
  const isRequired = callable(props.isRequired, props.node);
  const hasError = isRequired ? !Boolean(Array.isArray(value) ? value[0]?.value : value?.value) : false;

  const showTooltip = hasError && !props.hideTooltip;

  return (
    <Autocomplete
      freeSolo={freeSolo}
      multiple={multiple}
      options={props.getAutoCompleteOptions()}
      value={value || null}
      loading={callable(props.getIsLoading, props.node)}
      disabled={callable(props.getDisableState, props.node)}
      getOptionLabel={o => o?.label || ''}
      renderInput={params => (
        <AgGridTooltip
          arrow
          open={showTooltip}
          title={`${props.colDef.headerName} is Required`}
          placement="bottom-start"
        >
          <TextField {...params} placeholder="Search.." error={hasError && showTooltip} />
        </AgGridTooltip>
      )}
      onChange={onDropDownChange}
      getOptionSelected={getOptionSelected}
      classes={{ root: classes.root, inputRoot: classes.inputRoot }}
      debug={true}
      onInputChange={debounce((e, value, reason) => {
        if ([ 'input' ].includes(reason)) {
          props.onSearch(value, props.node);
        }
      }, 300)}
    />
  );
};

export default forwardRef(AgGridAutoCompleteV2);

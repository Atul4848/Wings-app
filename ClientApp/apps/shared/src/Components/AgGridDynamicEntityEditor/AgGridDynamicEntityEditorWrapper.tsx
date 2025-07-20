import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { ViewPermission, Utilities } from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Box, Typography } from '@material-ui/core';
import PopoverWrapper from './PopoverWrapper/PopoverWrapper';
import { DynamicEntityModel } from '../../Models';
import AgGridDynamicEntityEditor from './AgGridDynamicEntityEditor';

interface Props extends Partial<ICellEditorParams> {
  isRowEditing: boolean;
  getDisabledState?: () => boolean;
}

const ConditionEditor = (props: Props, ref) => {
  const [ value, setValue ] = useState({});
  const [ finalValues, setFinalValue ] = useState<DynamicEntityModel[]>(props.value);

  // hold errors from array items
  const [ hasErrorItems, setHasErrorItems ] = useState({});
  const hasError = useMemo(() => Object.keys(value).some(key => hasErrorItems[key]), [ hasErrorItems ]);

  // Setup default Values on Mount and the cancel event
  const setMappedValues = value => {
    const mappedObject = Array.isArray(value) ? value.reduce((t, c) => ({ ...t, [Utilities.getTempId()]: c }), {}) : {};
    setValue(mappedObject);
  };

  /* istanbul ignore next */
  // Mount Event
  useEffect(() => setMappedValues(props.value), []);

  /* istanbul ignore next */
  // Used by AgGrid to get the updated values
  useImperativeHandle(
    ref,
    () => ({
      getValue: () => finalValues,
      setValue: v => {
        setMappedValues(v);
        setFinalValue(v);
      },
    }),
    [ finalValues ]
  );

  return (
    <PopoverWrapper
      chipsValues={finalValues}
      isRowEditing={props.isRowEditing}
      disabled={typeof props.getDisabledState === 'function' ? props.getDisabledState() : false}
      hasError={hasError}
      onPopoverOpen={() => {
        if (Object.keys(value).length) {
          return;
        }
        setMappedValues([ new DynamicEntityModel() ]);
      }}
      onOkClick={() => {
        if (!props.isRowEditing) {
          return;
        }
        const item = Object.keys(value).map(key => value[key]);
        setFinalValue(item);
        // need some delay to prepare ag grid context
        setTimeout(() => props.context.componentParent.onDropDownChange(props, item), 300);
      }}
      onCancelClick={() => {
        // avoid reset flicker on UI
        setTimeout(() => setMappedValues(finalValues), 100);
      }}
    >
      <Box>
        <Typography variant="h6">Values</Typography>
        <ViewPermission hasPermission={props.isRowEditing}>
          <Box display="flex" justifyContent="end" pr="20px" pb="10px">
            <PrimaryButton
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setValue(values => ({ ...values, [Utilities.getTempId()]: new DynamicEntityModel() }));
              }}
            >
              Add New Condition
            </PrimaryButton>
          </Box>
        </ViewPermission>
        <Box maxHeight="200px" overflow="auto">
          <AgGridDynamicEntityEditor {...(props as any)} />
        </Box>
      </Box>
    </PopoverWrapper>
  );
};

export default observer(forwardRef(ConditionEditor));

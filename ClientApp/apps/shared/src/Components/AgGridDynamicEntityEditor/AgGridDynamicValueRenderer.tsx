import React, { FC } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Chip } from '@material-ui/core';
import { getStringToYesNoNull } from '@wings-shared/core';
import { AgGridPopoverWrapper } from '@wings-shared/custom-ag-grid';

export const AgGridDynamicValueRenderer: FC<Partial<ICellRendererParams>> = ({ value }) => {
  if (!Array.isArray(value)) {
    return '';
  }
  if (value.length > 1) {
    return (
      <AgGridPopoverWrapper chipsValues={value}>
        <>
          {value.map((x, index) => (
            <Chip size="small" label={x.label} key={index} />
          ))}
        </>
      </AgGridPopoverWrapper>
    );
  }
  const bool_value = getStringToYesNoNull(value[0]?.name); // This will only return value if it's boolean or yes no
  return bool_value || value[0]?.label;
};

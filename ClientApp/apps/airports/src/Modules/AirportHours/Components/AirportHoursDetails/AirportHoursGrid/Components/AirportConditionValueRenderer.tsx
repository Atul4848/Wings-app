import React, { FC } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Chip } from '@material-ui/core';
import { getStringToYesNoNull } from '@wings-shared/core';
import { AgGridPopoverWrapper } from '@wings-shared/custom-ag-grid';

const AirportConditionValueRenderer: FC<Partial<ICellRendererParams>> = ({ value }) => {
  if (!Array.isArray(value)) {
    return '';
  }
  if (value.length > 1) {
    return (
      <AgGridPopoverWrapper chipsValues={value}>
        <>
          {value.map((x, index) => (
            <Chip size="small" label={x.entityValue} key={index} />
          ))}
        </>
      </AgGridPopoverWrapper>
    );
  }
  return typeof value[0]?.entityValue === 'boolean'
    ? getStringToYesNoNull(value[0]?.entityValue)
    : value[0]?.entityValue;
};

export default AirportConditionValueRenderer;

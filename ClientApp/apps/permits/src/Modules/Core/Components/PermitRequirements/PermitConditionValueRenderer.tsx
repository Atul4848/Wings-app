import React, { FC } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Chip } from '@material-ui/core';
import { getStringToYesNoNull } from '@wings-shared/core';
import { AgGridPopoverWrapper } from '@wings-shared/custom-ag-grid';

const PermitConditionValueRenderer: FC<Partial<ICellRendererParams>> = ({ value }) => {
  if (!Array.isArray(value)) {
    return '';
  }

  if (value.length > 1) {
    return (
      <AgGridPopoverWrapper chipsValues={value}>
        {value.map((x, index) => (
          <Chip size="small" label={x.code || x.ruleValue} key={index} />
        ))}
      </AgGridPopoverWrapper>
    );
  }
  return value[0]?.code === '' || value[0]?.code === null
    ? [ 'True', 'False', false, true ].includes(value[0]?.ruleValue)
      ? getStringToYesNoNull(value[0]?.ruleValue)
      : value[0]?.ruleValue
    : value[0]?.code;
};

export default PermitConditionValueRenderer;

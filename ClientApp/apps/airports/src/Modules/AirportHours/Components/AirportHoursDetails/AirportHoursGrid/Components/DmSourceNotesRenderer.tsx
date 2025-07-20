import React, { FC } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { AgGridPopover } from '@wings-shared/custom-ag-grid';
import { ExpandIcon } from '@uvgo-shared/icons';
import { regex } from '@wings-shared/core';
import { observer } from 'mobx-react';

const DmSourceNotesRenderer: FC<Partial<ICellRendererParams>> = ({ value }) => {
  if (!value) {
    return '';
  }

  const popperContent = () => {
    return value?.split(regex.url).map((part, index) => {
      if (regex.url.test(part)) {
        return (
          <a key={index} href={part} target="_blank">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <AgGridPopover
      popperContent={popperContent()}
      endAdornmentIcon={<ExpandIcon />}
      onOkClick={() => {}}
      onCancelClick={() => {}}
      value={value}
      readOnly={true}
    />
  );
};

export default observer(DmSourceNotesRenderer);

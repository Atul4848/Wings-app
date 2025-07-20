import React, { FC, ReactNode } from 'react';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { styles } from './SyncHistoryChanges.styles';
import { SyncHistoryChangeModel } from '../../../Shared';
import { GridOptions } from 'ag-grid-community';

interface Props {
  changes?: SyncHistoryChangeModel[];
}

const SyncHistoryChanges: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<any, SyncHistoryChangeModel>([], gridState);
  const classes: Record<string, string> = styles();
  const dialogContent = (): ReactNode => {
    return (
      <CustomAgGridReact rowData={props.changes} gridOptions={gridOptions()} isRowEditing={gridState.isRowEditing} />
    );
  }

  const columnDefs = [
    {
      headerName: 'Property',
      field: 'property',
    },
    {
      headerName: 'Old Value',
      field: 'oldValue',
    },
    {
      headerName: 'New Value',
      field: 'newValue',
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,

    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
    };
  }

  return (
    <Dialog
      title="Changes"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.paperSize,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
};

export default (observer(SyncHistoryChanges));

import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { UIStore, IAPIGridRequest } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { EventStore, ExportedEventsErrorModel } from '../../../Shared';
import { useStyles } from './ImportErrorsDialog.styles';

interface Props {
  runId: string;
  eventStore: EventStore;
}

const ImportErrorsDialog: FC<Props> = ({ runId, eventStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<[], ExportedEventsErrorModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _eventStore = eventStore as EventStore;

  // Load Data on Mount
  useEffect(() => {
    loadErrorsReport();
  }, []);

  /* istanbul ignore next */
  const loadErrorsReport = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    _eventStore
      ?.getExportedEventsErrors(runId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response || []);
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Row Number',
      field: 'rowNumber',
      maxWidth: 130,
    },
    {
      headerName: 'Error Message',
      field: 'message',
      editable: false,
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
    });

    return { ...baseOptions };
  };

  const dialogContent = (): ReactNode => {
    return (
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    );
  };

  return (
    <>
      <Dialog
        title="Import Errors"
        open={true}
        isLoading={() => UIStore.pageLoading}
        onClose={() => ModalStore.close()}
        dialogContent={dialogContent}
        dialogActions={() => (
          <PrimaryButton variant="contained" onClick={() => ModalStore.close()}>
            Cancel
          </PrimaryButton>
        )}
        classes={{ paperSize: classes.paperSize }}
      />
    </>
  );
};

export default inject('eventStore')(observer(ImportErrorsDialog));

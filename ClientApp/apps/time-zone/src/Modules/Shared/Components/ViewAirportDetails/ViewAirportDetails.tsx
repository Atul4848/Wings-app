import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, FirstDataRenderedEvent, GridOptions } from 'ag-grid-community';
import { IconButton, Typography } from '@material-ui/core';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { TimeZoneReviewStore, AirportModel } from '../../../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { observer } from 'mobx-react';
import { UIStore } from '@wings-shared/core';
import { useStyles } from './ViewAirportDetails.styles';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
interface Props {
  timeZoneId?: number;
  stagingTimeZoneId?: number;
  isStagingTimezones: boolean;
}

const ViewAirportDetails: FC<Props> = observer(({ timeZoneId, stagingTimeZoneId, isStagingTimezones }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<[], AirportModel>([], gridState);
  const timeZoneReviewStore = new TimeZoneReviewStore();
  const classes = useStyles();

  /* istanbul ignore next */
  useEffect(() => {
    const id = isStagingTimezones ? stagingTimeZoneId : timeZoneId;
    UIStore.setPageLoader(true);
    timeZoneReviewStore
      .getTimeZoneAirports(isStagingTimezones, id as number)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  }, []);

  const title = (): ReactNode => {
    return (
      <div className={classes.titleWrapper}>
        <Typography variant="h6">Timezone Airports</Typography>
        <ExpandCollapseButton onExpandCollapse={() => agGrid.autoSizeColumns()} />
      </div>
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    { headerName: 'Airport Code', field: 'airportCode' },
    { headerName: 'Airport Name', field: 'name' },
    { headerName: 'Longitude Degrees', field: 'longitudeDegrees' },
    { headerName: 'Latitude Degrees', field: 'latitudeDegrees' },
    ...agGrid.auditFields(gridState.isRowEditing),
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });
    return {
      ...baseOptions,
      onFirstDataRendered: (event: FirstDataRenderedEvent) => {
        gridState.gridApi.sizeColumnsToFit();
      },
    };
  };

  const closeHandler = (): void => {
    ModalStore.close();
  };

  const dialogContent = (): ReactNode => {
    return (
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    );
  };

  const dialogActions = (): ReactNode => {
    return (
      <PrimaryButton variant="outlined" onClick={() => closeHandler()}>
        Close
      </PrimaryButton>
    );
  };

  return (
    <Dialog
      title={title()}
      fullScreen={true}
      open={true}
      isLoading={() => UIStore.pageLoading}
      onClose={() => closeHandler()}
      dialogContent={() => dialogContent()}
      dialogActions={() => dialogActions()}
      classes={{ paperSize: classes.paperSize }}
    />
  );
});

export default ViewAirportDetails;

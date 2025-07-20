import React, { FC, ReactNode, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { DATE_FORMAT, Utilities, IClasses, UIStore, IAPIGridRequest, SettingsTypeModel } from '@wings-shared/core';
import { TimeZoneDetailStore, TimeZoneModel } from '../../../../Shared';
import { observer } from 'mobx-react';
import { useStyles } from './ViewTimeZoneDetails.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  timeZoneDetailStore?: TimeZoneDetailStore;
  airportId: number;
  classes?: IClasses;
  submitted?: () => void;
}

const ViewTimeZoneDetails: FC<Props> = ({ timeZoneDetailStore, airportId, submitted }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<[], TimeZoneModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _timeZoneDetailStore = timeZoneDetailStore as TimeZoneDetailStore;

  // Load Data on Mount
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    _timeZoneDetailStore
      ?.loadAirportTimeZones(airportId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  const closeHandler = (): void => {
    ModalStore.close();
  };

  const title = (): ReactNode => {
    return (
      <div className={classes.titleWrapper}>
        <Typography variant="h5">Timezone Details</Typography>
        <ExpandCollapseButton onExpandCollapse={() => agGrid.autoSizeColumns()} />
      </div>
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Zone Name',
      field: 'zoneName',
    },
    {
      headerName: 'Zone Abbreviation',
      field: 'zoneAbbreviation',
    },
    {
      headerName: 'Year',
      field: 'year',
      width: 80,
      suppressSizeToFit: true,
    },
    {
      headerName: 'Start Date & Time',
      field: 'startDateTime',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'End Date & Time',
      field: 'endDateTime',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Offset After',
      field: 'offset',
      valueGetter: ({ data }: ValueGetterParams) => `UTC${data?.offset || ''}`,
    },
    {
      headerName: 'Status',
      field: 'status',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return {
      ...agGrid.gridOptionsBase({ context: this, columnDefs: columnDefs }),
      onFirstDataRendered: () => gridState.gridApi?.sizeColumnsToFit(),
    };
  };

  const dialogContent = (): ReactNode => {
    return (
      <div className={classes.gridContainer}>
        <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
      </div>
    );
  };

  const dialogActions = (): ReactNode => {
    return (
      <Box ml={2}>
        <PrimaryButton variant="contained" className="ml-10" onClick={() => closeHandler()}>
          Ok
        </PrimaryButton>
      </Box>
    );
  };

  return (
    <>
      <Dialog
        title={title()}
        open={true}
        isLoading={() => UIStore.pageLoading}
        onClose={() => closeHandler()}
        dialogContent={() => dialogContent()}
        dialogActions={() => dialogActions()}
        classes={{ paperSize: classes.paperSize }}
      />
    </>
  );
};

export default observer(ViewTimeZoneDetails);

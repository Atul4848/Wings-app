import React, { FC, ReactNode, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { DATE_FORMAT, Utilities, IClasses, UIStore } from '@wings-shared/core';
import { observer } from 'mobx-react';
import { useStyles } from './ViewTimeZoneHistory.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Dialog } from '@uvgo-shared/dialog';
import { ExpandCollapseButton } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { TimeZoneModel, TimeZoneSettingsStore, TimeZoneStore } from '../../../Shared';
import { CountryModel } from '@wings/shared';

interface Props {
  timezoneId: number;
  timezoneStore: TimeZoneStore;
  classes?: IClasses;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
}

const ViewTimeZoneHistory: FC<Props> = ({ timezoneId, timezoneStore, timeZoneSettingsStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<[], TimeZoneModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _timezoneStore = timezoneStore as TimeZoneStore;
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;

  // Load Data on Mount
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _timezoneStore
      .auditHistory(timezoneId)
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
        <Typography variant="h5">Time Zone History</Typography>
        <ExpandCollapseButton onExpandCollapse={() => agGrid.autoSizeColumns()} />
      </div>
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Year',
      field: 'year',
    },
    {
      headerName: 'Country',
      field: 'countryName',
      valueGetter: ({ data }: ValueGetterParams) => data?.countryName,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Country',
        getAutoCompleteOptions: () => _timezoneStore.countries,
        valueGetter: (selectedOption: CountryModel) => selectedOption,
      },
    },
    {
      headerName: 'Zone Name',
      field: 'zoneName',
    },
    {
      headerName: 'Zone Abbreviation',
      field: 'zoneAbbreviation',
    },
    {
      headerName: 'Old Time',
      field: 'oldLocalTime',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    {
      headerName: 'Offset',
      field: 'offset',
    },
    {
      headerName: 'Zone DST',
      field: 'zoneDst',
    },
    {
      headerName: 'New Time',
      field: 'newLocalTime',
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
    },
    ...agGrid.generalFields(_timeZoneSettingsStore),
    { headerName: 'Modified By', field: 'modifiedBy' },
    {
      headerName: 'Modified On',
      field: 'modifiedOn',
      minWidth: 150,
      valueFormatter: ({ value }: ValueFormatterParams) => Utilities.getformattedDate(value, DATE_FORMAT.GRID_DISPLAY),
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
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    );
  };

  const dialogActions = (): ReactNode => {
    return (
      <Box ml={2}>
        <PrimaryButton variant="outlined" color="primary" className="ml-10" onClick={() => closeHandler()}>
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

export default observer(ViewTimeZoneHistory);

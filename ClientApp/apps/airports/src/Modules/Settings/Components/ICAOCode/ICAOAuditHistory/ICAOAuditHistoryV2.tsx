import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './ICAOAuditHistory.styles';
import { AirportSettingsStore, RUNWAY_LIGHT_TYPE_FILTERS, RunwayLightTypeModel } from '../../../../Shared';
import { DATE_FORMAT, Loader, Utilities } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  icaoCode: string;
}

const ICAOAuditHistory: FC<Props> = ({ airportSettingsStore, icaoCode }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<RUNWAY_LIGHT_TYPE_FILTERS, RunwayLightTypeModel>([], gridState);
  const progressLoader: Loader = new Loader(false);

  /* istanbul ignore next */
  useEffect(() => {
    loadAuditHistory();
  }, []);

  /* istanbul ignore next */
  const loadAuditHistory = (): void => {
    progressLoader.showLoader();
    airportSettingsStore
      ?.loadICAOAuditHistory(icaoCode)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => progressLoader.hideLoader())
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Airport Name',
      field: 'name',
      minWidth: 140,
    },
    {
      headerName: 'ICAO Code',
      field: 'icao',
      sortable: false,
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'UWA Code',
      field: 'uwaCode',
      sortable: false,
    },
    {
      headerName: 'Changed Date',
      field: 'modifiedOn',
      minWidth: 160,
      maxWidth: 160,
      valueFormatter: ({ value }) => Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN),
      hide: true, // temporarily hidden
    },
    {
      headerName: 'Changed By',
      field: 'modifiedBy',
      minWidth: 130,
      hide: true, // temporarily hidden
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return agGrid.gridOptionsBase({ context: {}, columnDefs });
  };

  const dialogContent = (): ReactNode => {
    return <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />;
  };

  return (
    <Dialog
      title={`History ${icaoCode}`}
      open={true}
      isLoading={() => progressLoader.isLoading}
      classes={{ paperSize: classes.paperSize }}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
    />
  );
};
export default inject('airportSettingsStore')(observer(ICAOAuditHistory));

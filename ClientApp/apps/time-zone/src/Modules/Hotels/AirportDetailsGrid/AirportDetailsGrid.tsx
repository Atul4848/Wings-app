import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgGridMasterDetails, useAgGrid, CustomAgGridReact, useGridState } from '@wings-shared/custom-ag-grid';
import { observer } from 'mobx-react';
import { UIStore } from '@wings-shared/core';
import { HotelAirportModel, TimeZoneStore } from '../../Shared';
import { useStyles } from './AirportDetailsGrid.styles';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props extends ICellRendererParams {
  isEditable?: boolean;
  timeZoneStore?: TimeZoneStore;
}

const AirportDetailsGrid: FC<Props> = ({ isEditable, data, timeZoneStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<'', HotelAirportModel>([], gridState);
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const _timeZoneStore = timeZoneStore as TimeZoneStore;

  // Load Data on Mount
  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = () => {
    UIStore.setPageLoader(true);
    const request = {
      filterCollection: JSON.stringify([{ propertyName: 'HotelId', propertyValue: data.id }]),
      specifiedFields: [ 'Airports' ],
    };
    _timeZoneStore
      .getHotelsNosql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response.results[0]?.airports);
        unsubscribe.setHasLoaded(true);
      });
  };
  
  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Airport',
      field: 'airport',
      valueFormatter: ({ value }) => value?.label || '',
    },
    {
      headerName: 'Distance From Airport',
      field: 'distance',
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });
    return {
      ...baseOptions,
      suppressCellSelection: true,
    };
  };

  return (
    <AgGridMasterDetails addButtonTitle="" onAddButtonClick={() => ''} hasAddPermission={false}>
      <CustomAgGridReact
        rowData={gridState.data}
        gridOptions={gridOptions()}
        isRowEditing={gridState.isRowEditing}
        classes={{ customHeight: classes.customHeight }}
      />
    </AgGridMasterDetails>
  );
};

export default observer(AirportDetailsGrid);

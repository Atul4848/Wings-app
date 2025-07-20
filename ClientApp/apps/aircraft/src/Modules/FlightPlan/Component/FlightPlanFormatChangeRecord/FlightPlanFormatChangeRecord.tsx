import React, { FC, useEffect } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { Utilities, DATE_FORMAT, UIStore, IClasses } from '@wings-shared/core';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams, ValueGetterParams, RowNode } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  FlightPlanChangeRecordModel,
  FlightPlanStore,
  FLIGHT_PLAN_CHANGE_RECORDS_FILTERS,
  updateAircraftSidebarOptions,
} from '../../../Shared';
import { Link } from 'react-router-dom';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  flightPlanStore?: FlightPlanStore;
  sidebarStore?: typeof SidebarStore;
}

const FlightPlanFormatChangeRecord: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<FLIGHT_PLAN_CHANGE_RECORDS_FILTERS, FlightPlanChangeRecordModel>([], gridState);
  const searchHeader = useSearchHeader();
  const _flightPlanStore = props.flightPlanStore as FlightPlanStore;

  useEffect(() => {
    props.sidebarStore?.setNavLinks(updateAircraftSidebarOptions('Change Record'), 'aircraft');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _flightPlanStore
      .getFlightPlanChnageRecords()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(flightPlans => gridState.setGridData(flightPlans));
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Format',
      field: 'format',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => (
          <Link
            className={classes?.link}
            to={`/aircraft/flight-plan/${node.data.flightPlanFormatId}/${VIEW_MODE.DETAILS.toLowerCase()}`}
          >
            {node.data?.format}
          </Link>
        ),
      },
    },
    {
      headerName: 'Requested By',
      field: 'requestedBy',
    },
    {
      headerName: 'Changed By',
      field: 'changedBy',
    },
    {
      headerName: 'Notes',
      field: 'notes',
      minWidth: 700,
    },
    {
      headerName: 'Changed Date',
      field: 'changedDate',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.changedDate, DATE_FORMAT.API_DATE_FORMAT),
    },
    ...agGrid.auditFields(gridState.isRowEditing),
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const { format, id, requestedBy, changedBy, notes } = node.data as FlightPlanChangeRecordModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [FLIGHT_PLAN_CHANGE_RECORDS_FILTERS.FORMAT]: format,
              [FLIGHT_PLAN_CHANGE_RECORDS_FILTERS.REQUESTED_BY]: requestedBy,
              [FLIGHT_PLAN_CHANGE_RECORDS_FILTERS.CHANGED_BY]: changedBy,
              [FLIGHT_PLAN_CHANGE_RECORDS_FILTERS.NOTES]: notes,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      groupHeaderHeight: 0,
      suppressColumnVirtualisation: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        filter: true,
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(
            FLIGHT_PLAN_CHANGE_RECORDS_FILTERS,
            FLIGHT_PLAN_CHANGE_RECORDS_FILTERS.FORMAT
          ),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        onExpandCollapse={agGrid.autoSizeColumns}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('flightPlanStore', 'sidebarStore')(observer(FlightPlanFormatChangeRecord));

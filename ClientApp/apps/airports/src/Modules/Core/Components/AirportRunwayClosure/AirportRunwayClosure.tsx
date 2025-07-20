import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { useAgGrid, CustomAgGridReact, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { inject, observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { IAPIGridRequest, UIStore, Utilities, DATE_FORMAT } from '@wings-shared/core';
import {
  AirportSettingsStore,
  AirportStore,
  AirportRunwayClosureModel,
  RunwayClosureModel,
  AirportModel,
  updateAirportSidebarOptions,
  airportBasePath,
} from '../../../Shared';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useParams } from 'react-router';
import { AIRPORT_RUNWAY_CLOSURES } from '../../../Shared/Enums/AirportRunwayClosure.enum';
import { ModelStatusOptions } from '@wings/shared';
import { observable } from 'mobx';
import { useStyles } from './AirportRunwayClosure.styles';

interface Props extends Partial<ICellRendererParams> {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportRunwayClosure: FC<Props> = ({ airportStore, data, airportSettingsStore, sidebarStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_RUNWAY_CLOSURES, AirportRunwayClosureModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const _airportStore = airportStore as AirportStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const searchHeader = useSearchHeader();
  const runwayClosure = observable({
    isStatusFilter: Utilities.isEqual(searchHeader.searchType, AIRPORT_RUNWAY_CLOSURES.STATUS),
  });

  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Runway Closure', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    loadInitialData();
  }, []);

  useEffect(() => {
    if (runwayClosure.isStatusFilter) {
      searchHeader.setupDefaultFilters({
        searchValue: '',
        selectInputsValues: searchHeader.getFilters()?.selectInputsValues,
        chipValue: [ ModelStatusOptions[0] ],
      });
    }
  }, [ runwayClosure.isStatusFilter ]);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      specifiedFields: [ 'RunwayClosures', 'RunwayId', 'Runway_Id', 'AirportId' ],
      filterCollection: JSON.stringify([
        { propertyName: 'RunwayClosures', propertyValue: null, operator: 'and', filterType: 'ne' },
        { propertyName: 'AirportId', propertyValue: Number(params?.airportId), operator: 'and', filterType: 'eq' },
      ]),
    };
    UIStore.setPageLoader(true);
    _airportStore
      .getAirportRunwayClosure(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const flattenedData = response.results.flatMap((item: AirportRunwayClosureModel) =>
          item.runwayClosures.map(closure => ({
            ...closure,
            runway_Id: item.runway_Id,
          }))
        );
        gridState.setGridData(flattenedData);
        agGrid.reloadColumnState();
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Runway',
      field: 'runway_Id',
      headerTooltip: 'Runway',
    },
    {
      headerName: 'Notam Id',
      field: 'notamId',
      headerTooltip: 'Notam Id',
    },
    {
      headerName: 'Start Date',
      field: 'closureStartDate',
      headerTooltip: 'Start Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'Start Time',
      field: 'closureStartTime',
      headerTooltip: 'Start Time',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.APPOINTMENT_TIME) || '',
    },
    {
      headerName: 'End Date',
      field: 'closureEndDate',
      headerTooltip: 'End Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'End Time',
      field: 'closureEndTime',
      headerTooltip: 'End Time',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.APPOINTMENT_TIME) || '',
    },
    ...agGrid.generalFields(airportSettingsStore),
    ...agGrid.auditFields(gridState.isRowEditing),
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      gridActionProps: {
        showDeleteButton: true,
      },
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () =>
        Boolean(searchHeader.getFilters().searchValue) ||
        Boolean(searchHeader.getFilters().chipValue?.length),
      doesExternalFilterPass: node => {
        const { chipValue, searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue && !chipValue?.length) {
          return false;
        }
        const { id, runway_Id } = node.data as AirportRunwayClosureModel;
        const { notamId, status, accessLevel, sourceType } = node.data as RunwayClosureModel;
        const isExactMatch = Utilities.isEqual(selectInputsValues.get('defaultOption'), AIRPORT_RUNWAY_CLOSURES.STATUS);
        const _searchValue = isExactMatch ? chipValue[0]?.name : searchValue;

        return (
          !id ||
          agGrid.isFilterPass(
            {
              [AIRPORT_RUNWAY_CLOSURES.RUNWAY]: runway_Id,
              [AIRPORT_RUNWAY_CLOSURES.NOTAM_ID]: notamId,
              [AIRPORT_RUNWAY_CLOSURES.STATUS]: status?.name,
              [AIRPORT_RUNWAY_CLOSURES.ACCESS_TYPE]: accessLevel?.label.toLocaleLowerCase(),
              [AIRPORT_RUNWAY_CLOSURES.SOURCE_TYPE]: sourceType?.label.toLocaleLowerCase(),
            },
            _searchValue,
            selectInputsValues.get('defaultOption'),
            isExactMatch
          )
        );
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  };

  /* istanbul ignore next */
  const _searchFilters = () => {
    runwayClosure.isStatusFilter = Utilities.isEqual(
      searchHeader.getFilters().selectInputsValues.get('defaultOption'),
      AIRPORT_RUNWAY_CLOSURES.STATUS
    );
    gridState.gridApi.onFilterChanged();
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(AIRPORT_RUNWAY_CLOSURES, AIRPORT_RUNWAY_CLOSURES.STATUS) ]}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={_searchFilters}
        isChipInputControl={runwayClosure.isStatusFilter}
        chipInputProps={{
          options: ModelStatusOptions,
          allowOnlySingleSelect: true,
        }}
        onSearch={(sv) => gridState.gridApi?.onFilterChanged()}
      />

      <CustomAgGridReact
        rowData={gridState.data}
        gridOptions={gridOptions()}
        isRowEditing={gridState.isRowEditing}
        classes={{ customHeight: classes.customHeight }}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('airportStore', 'airportSettingsStore', 'sidebarStore')(observer(AirportRunwayClosure));

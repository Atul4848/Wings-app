import React, { FC, ReactNode, useEffect } from 'react';
import {
  GridOptions,
  ColDef,
  ValueFormatterParams,
  ICellEditorParams,
  EditableCallbackParams,
} from 'ag-grid-community';
import { observer, inject } from 'mobx-react';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  IAPIGridRequest,
  GridPagination,
  IAPIPageResponse,
  ISelectOption,
  SelectOption,
  ViewPermission,
  cellStyle,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  AIRPORT_MAPPING_BETA_FILTERS,
  AirportFlightPlanInfoModel,
  AirportMappingsBetaModel,
  airportSidebarOptions,
  AirportStore,
  useAirportModuleSecurity,
} from '../Shared';
import { AirportModel, BaseAirportStore } from '@wings/shared';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { gridFilters } from './fields';
import { observable } from 'mobx';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SidebarStore } from '@wings-shared/layout';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportMappingBeta: FC<Props> = ({ airportStore, sidebarStore }: Props) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<AIRPORT_MAPPING_BETA_FILTERS, AirportMappingsBetaModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const _airportStore = airportStore as AirportStore;
  const baseAirportStore = new BaseAirportStore();
  const airportModuleSecurity = useAirportModuleSecurity();
  const airports = observable({
    data: {
      icaoCode: [],
      uwaAirportCode: [],
      faaCode: [],
      regionalAirportCode: [],
    },
  });
  const disabledColumns: any = observable({
    data: [],
  });
  const airportId: any = observable({
    data: '',
  });
  const optionalColumns: string[] = observable([ 'uwaAirportCode', 'regionalAirportCode', 'faaCode', 'icaoCode' ]);
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  /* istanbul ignore next */
  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    loadAirportMapping();
  }, []);

  /* istanbul ignore next */
  const loadAirportMapping = (pageRequest?: IAPIGridRequest): void => {
    const request = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
    };
    UIStore.setPageLoader(true);
    _airportStore
      ?.loadAirportMappingsBeta(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
      });
  };

  /* istanbul ignore next */
  const setAutoCompleteOptions = (key: string, response: AirportModel[]): void => {
    airports.data = {
      ...airports.data,
      [key]: response.map(item => {
        return {
          label: [ 'icaoCode', 'uwaAirportCode', 'regionalAirportCode' ].includes(key) ? item[key].code : item[key],
          value: item.id,
        };
      }),
    };
  };

  /* istanbul ignore next */
  const searchAirports = (key: string, propertyName: string, propertyValue: string): void => {
    if (!Boolean(propertyValue)) return;
    const airportRequest = {
      searchCollection: JSON.stringify([{ propertyName, propertyValue }]),
    };
    baseAirportStore
      .getWingsAirports(airportRequest)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: airports => setAutoCompleteOptions(key, airports.results),
      });
  };

  const upsertAirportFlightPlanInfo = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    const request = new AirportFlightPlanInfoModel({ ...model?.airportFlightPlanInfo, airportId: airportId.data });
    UIStore.setPageLoader(true);
    _airportStore
      ?.upsertAirportFlightPlanInfo(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportFlightPlanInfoModel) => {
          agGrid._updateTableItem(
            rowIndex,
            AirportMappingsBetaModel.deserialize({
              ...model,
              ...response,
              id: model.id,
              icaoCode: { code: model?.icaoCode?.label, id: model?.icaoCode?.value },
              airportFlightPlanInfo: { ...response },
            })
          );
          disabledColumns.data = [];
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, columnDefs[4].field || '');
          AlertStore.critical(error.message);
        },
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        disabledColumns.data = optionalColumns;
        agGrid._startEditingCell(rowIndex, columnDefs[4].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAirportFlightPlanInfo(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        disabledColumns.data = [];
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'ICAO Code',
      field: 'icaoCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        getAutoCompleteOptions: () => {
          return airports.data['icaoCode'];
        },
        onSearch: value => searchAirports('icaoCode', 'ICAOCode.Code', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => disabledColumns.data?.includes('icaoCode'),
      },
    },
    {
      headerName: 'UWA Airport Code',
      field: 'uwaAirportCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        getAutoCompleteOptions: () => airports.data['uwaAirportCode'],
        onSearch: value => searchAirports('uwaAirportCode', 'UWAAirportCode.Code', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => disabledColumns.data?.includes('uwaAirportCode'),
      },
    },
    {
      headerName: 'Regional Airport Code',
      field: 'regionalAirportCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        getAutoCompleteOptions: () => airports.data['regionalAirportCode'],
        onSearch: value => searchAirports('regionalAirportCode', 'RegionalAirportCode.Code', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => disabledColumns.data?.includes('regionalAirportCode'),
      },
    },
    {
      headerName: 'FAA Code',
      field: 'faaCode',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value,
      cellEditorParams: {
        getAutoCompleteOptions: () => airports.data['faaCode'],
        onSearch: value => searchAirports('faaCode', 'FAACode', value),
        valueGetter: (option: SelectOption) => option.value,
        getDisableState: () => disabledColumns.data?.includes('faaCode'),
      },
    },
    {
      headerName: 'NAVBLUE Code',
      field: 'airportFlightPlanInfo.navBlueCode',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:3,4',
      },
    },
    {
      headerName: 'APG Code',
      field: 'airportFlightPlanInfo.apgCode',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'string|between:3,4',
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
      hide: !airportModuleSecurity.isEditable,
    },
  ];

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || !airportId.data);
  };

  // Called from Ag Grid Component
  const onDropDownChange = (params: ICellEditorParams, option: ISelectOption): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || !option?.value);
    if (option?.value) {
      airportId.data = Number(option.value);
      disabledColumns.data = optionalColumns.filter(item => !Utilities.isEqual(params.colDef.field || '', item));
      return;
    }
    disabledColumns.data = [];
  };

  const addNewMapping = (): void => {
    disabledColumns.data = [];
    const airportMappingsBeta = new AirportMappingsBetaModel({
      id: 0,
      airportFlightPlanInfo: new AirportFlightPlanInfoModel({ airportId: 0 }),
    });
    agGrid.addNewItems([ airportMappingsBeta ], { startEditing: false, colKey: 'icaoCode' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs: columnDefs,
      isEditable: airportModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
      suppressRowHoverHighlight: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      onRowEditingStarted: node => {
        agGrid.onRowEditingStarted(node);
        airportId.data = node.data.airportFlightPlanInfo?.airportId;
      },
      onFilterChanged: () => loadAirportMapping(),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadAirportMapping();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing}
          onClick={() => addNewMapping()}
        >
          Add Airport Mapping
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(
            AIRPORT_MAPPING_BETA_FILTERS,
            AIRPORT_MAPPING_BETA_FILTERS.ICAO
          ),
        ]}
        onSearch={(sv) => loadAirportMapping()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={() => loadAirportMapping({ pageNumber: 1 })}
      />
      <CustomAgGridReact
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadAirportMapping}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('airportStore', 'sidebarStore')(observer(AirportMappingBeta));

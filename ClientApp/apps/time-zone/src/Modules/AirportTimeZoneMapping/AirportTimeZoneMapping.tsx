import React, { FC, ReactNode, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams, ICellEditorParams } from 'ag-grid-community';
import { useBaseUpsertComponent } from '@wings/shared';
import {
  AgGridStatusBadge,
  CustomAgGridReact,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import {
  ViewPermission,
  GRID_ACTIONS,
  UIStore,
  Utilities,
  IAPIGridRequest,
  SearchStore,
  SettingsTypeModel,
  EntityMapModel,
  GridPagination,
  SourceTypeModel,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { gridFilters } from './fields';
import {
  AIRPORT_TIME_ZONE_MAPPING,
  AirportTimeZoneMappingModel,
  AirportTimeZoneMappingStore,
  TimeZoneDetailStore,
  TimeZoneSettingsStore,
  TimeZoneStore,
  updateTimezoneSidebarOptions,
} from '../Shared';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import { ConfirmDialog, SidebarStore } from '@wings-shared/layout';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  timeZoneStore?: TimeZoneStore;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  timeZoneDetailStore?: TimeZoneDetailStore;
  airportTimeZoneMappingStore?: AirportTimeZoneMappingStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportTimeZoneMapping: FC<Props> = ({
  timeZoneStore,
  timeZoneSettingsStore,
  timeZoneDetailStore,
  airportTimeZoneMappingStore,
  sidebarStore,
}) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const location = useLocation();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<AirportTimeZoneMappingModel>(params, gridFilters, baseEntitySearchFilters);
  const agGrid = useAgGrid<AIRPORT_TIME_ZONE_MAPPING, AirportTimeZoneMappingModel>(gridFilters, gridState);
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const _timeZoneDetailStore = timeZoneDetailStore as TimeZoneDetailStore;
  const _airportTimeZoneMappingStore = airportTimeZoneMappingStore as AirportTimeZoneMappingStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Airport Time Zone Mapping'), 'geographic');
    const searchData = SearchStore.searchData.get(location.pathname);
    /* istanbul ignore next */
    if (searchData) {
      gridState.setPagination(searchData.pagination);
      searchHeader.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname);
      return;
    }
    loadInitialData();
    _timeZoneSettingsStore.getSourceTypes().subscribe();
  }, []);

  const getAirportLocationValue = () =>
    gridState.gridApi.getCellEditorInstances({ columns: [ 'airportLocation' ] })[0]?.getValue() || null;

  const isMappingExist = (timeZoneMappingModel: AirportTimeZoneMappingModel) => {
    const airportLocationValue = getAirportLocationValue();
    const isDuplicateData = gridState.data.some(
      a => a.airportId === airportLocationValue.id && timeZoneMappingModel?.id !== a.id
    );

    if (airportLocationValue) {
      if (isDuplicateData) {
        AlertStore.info(
          `Airport Timezone Mapping already exists for Airport: ${airportLocationValue.name} (${airportLocationValue.code})`
        );
        return isDuplicateData;
      }
      return false;
    }
  };

  /* istanbul ignore next */
  const saveChanges = (rowIndex): void => {
    const data: AirportTimeZoneMappingModel = agGrid._getTableItem(rowIndex);
    if (isMappingExist(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _airportTimeZoneMappingStore
      .upsertAirportTimeZoneMapping(data.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportTimeZoneMappingModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
          AlertStore.critical(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        saveChanges(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const confirmRemoveRecord = (rowIndex: number): void => {
    const model: AirportTimeZoneMappingModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteRecord(rowIndex);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this record?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => deleteRecord(rowIndex)}
      />
    );
  };

  /* istanbul ignore next */
  const deleteRecord = (rowIndex: number): void => {
    const data: AirportTimeZoneMappingModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _airportTimeZoneMappingStore
      .removeAirportTimeZoneMapping(data.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          ModalStore.close();
          agGrid._removeTableItems([ data ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => {
          ModalStore.close(), AlertStore.critical(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const onAirportSearch = (searchValue?: string): void => {
    const filterCollection = JSON.stringify([{ airport: searchValue || '' }]);

    const request = {
      pageNumber: 1,
      pageSize: 30,
      filterCollection,
    };
    _timeZoneDetailStore.getAirportLocation(request).subscribe({ next: () => UIStore.setPageLoader(false) });
  };

  /* istanbul ignore next */
  const onRegionSearch = (searchValue?: string): void => {
    const filterCollection = JSON.stringify([{ regionName: searchValue || '' }]);

    const request = {
      pageNumber: 1,
      pageSize: 30,
      filterCollection,
    };
    _timeZoneStore?.loadTimeZoneRegion(request).subscribe({
      next: response => {
        UIStore.setPageLoader(false);
      },
    });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Airport Code',
      field: 'airportCode',
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'Airport Name',
      field: 'airportLocation',
      minWidth: 120,
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Airport Name',
        getAutoCompleteOptions: () => {
          return _timeZoneDetailStore.airportLocation;
        },
        onSearch: onAirportSearch.bind(this),
        valueGetter: (option: EntityMapModel) => {
          return option;
        },
      },
      headerTooltip: 'Airport Name',
    },
    {
      headerName: 'Timezone Name(Region Name)',
      field: 'timeZoneRegion',
      minWidth: 120,
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Region',
        onSearch: onRegionSearch.bind(this),
        getAutoCompleteOptions: () => _timeZoneStore.timeZoneRegions,
        valueGetter: (option: SettingsTypeModel) => {
          return option.label;
        },
      },
      headerTooltip: 'Timezone Name(Region Name)',
    },
    ...agGrid.generalFields(_timeZoneSettingsStore),
    ...agGrid.auditFields(gridState.isRowEditing, false),
    {
      ...agGrid.actionColumn({
        hide: !geographicModuleSecurity.isEditable,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
              isHidden: !geographicModuleSecurity.isEditable,
            },
            {
              title: 'Delete',
              action: GRID_ACTIONS.DELETE,
              isHidden: !geographicModuleSecurity.isEditable,
            },
          ],
        },
      }),
    },
  ];

  const onDropDownChange = (params: ICellEditorParams, value: any): void => {
    if (Utilities.isEqual(params.colDef.field || '', 'airportLocation')) {
      agGrid.fetchCellInstance('airportCode').setValue(value?.code || '');
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange,
      },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        sortable: false,
      },
      pagination: false,
      suppressClickEdit: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        _timeZoneSettingsStore.getAccessLevels().subscribe();
      },
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        statusRenderer: AgGridStatusBadge,
      },
    };
  };

  const getFilterCollection = (): IAPIGridRequest => {
    if (!searchHeader.getFilters().searchValue) {
      return {};
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, searchHeader.getFilters().selectInputsValues.get('defaultOption'))
    );
    return {
      filterCollection: JSON.stringify([{ [property?.columnId || '']: searchHeader.getFilters().searchValue }]),
    };
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...getFilterCollection(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    _airportTimeZoneMappingStore
      .getAirportTimeZoneMapping(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
      });
  };

  /* istanbul ignore next */
  const addNewTimeZoneMapping = () => {
    const _sourceType = _timeZoneSettingsStore.sourceTypes.find(x => x.name === 'UWA');
    const timeZoneMapping = new AirportTimeZoneMappingModel({
      id: 0,
      sourceType: new SourceTypeModel(_sourceType as SourceTypeModel),
    });
    agGrid.addNewItems([ timeZoneMapping ], { startEditing: false, colKey: 'airportCode' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={geographicModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing}
          onClick={addNewTimeZoneMapping}
        >
          Add TimeZone Mapping
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
          agGridUtilities.createSelectOption(AIRPORT_TIME_ZONE_MAPPING, AIRPORT_TIME_ZONE_MAPPING.AIRPORT_CODE),
        ]}
        disableControls={gridState.isRowEditing}
        rightContent={rightContent}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject(
  'timeZoneStore',
  'timeZoneDetailStore',
  'timeZoneSettingsStore',
  'airportTimeZoneMappingStore',
  'sidebarStore'
)(observer(AirportTimeZoneMapping));

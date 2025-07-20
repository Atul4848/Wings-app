import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams, RowNode, ICellEditor } from 'ag-grid-community';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import {
  ViewPermission,
  GRID_ACTIONS,
  UIStore,
  Utilities,
  GridPagination,
  IAPIGridRequest,
  SearchStore,
  SettingsTypeModel,
  rowStyle,
} from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useUnsubscribe, useConfirmDialog } from '@wings-shared/hooks';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useSearchHeader, SearchHeaderV3 } from '@wings-shared/form-controls';
import {
  SettingsStore,
  CountryStore,
  AIP_FILTERS,
  AeronauticalInformationPublicationModel,
  useCountryModuleSecurity,
  updateCountrySidebarOptions,
} from '../Shared';
import { gridFilters } from './fields';
import { SidebarStore } from '@wings-shared/layout';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  countryId?: number;
  isEditable?: boolean;
  sidebarStore: typeof SidebarStore;
}

const AeronauticalInformationPublication: FC<Props> = ({ countryStore, settingsStore, countryId, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<AIP_FILTERS, AeronauticalInformationPublicationModel>(gridFilters, gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const _countryStore = countryStore as CountryStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const _useConfirmDialog = useConfirmDialog();
  const countryModuleSecurity = useCountryModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateCountrySidebarOptions('AIP'), 'countries');
    loadAeronauticalInformationPublication();
    _settingsStore?.getAIPSourceTypes().subscribe();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadAeronauticalInformationPublication());
    return () => {
      const { clientSearchValue } = SearchStore;
      if (clientSearchValue.searchValue) {
        return;
      }
      SearchStore.clearSearch();
    };
  }, []);

  /* istanbul ignore next */
  const loadAeronauticalInformationPublication = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...getFilterCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    if (
      searchHeader.getFilters().searchValue &&
      searchHeader.getFilters().selectInputsValues.get('defaultOption') === AIP_FILTERS.ALL &&
      !Boolean(Array.from(gridState.columFilters).length)
    ) {
      const searchCollection = gridFilters.map((x, index) => {
        const operator = Boolean(index) ? { operator: 'or' } : null;
        return { propertyName: x.apiPropertyName, propertyValue: searchHeader.getFilters().searchValue, ...operator };
      });
      request.searchCollection = JSON.stringify(searchCollection);
    }
    UIStore.setPageLoader(true);
    _countryStore
      .getAeronauticalInformationPublication(0, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: AeronauticalInformationPublicationModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
      columns: [ 'aipLink', 'aipSourceType' ],
    });
    const sourceType = editorInstance[0]?.getValue();
    const link = editorInstance[1]?.getValue();

    const isDuplicateData = gridState.data.some(
      a =>
        a.aipLink.toLowerCase() === link.toLowerCase() && a.aipSourceType.name === sourceType.name && data?.id !== a.id
    );

    if (isDuplicateData) {
      agGrid.showAlert(`AIP already exists with Link:${link} and Type:${sourceType.name}`, 'AIPAlertMessage');
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const deleteAIP = (rowIndex: number): void => {
    const data: AeronauticalInformationPublicationModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    ModalStore.close();
    _countryStore
      ?.removeAeronauticalInformationPublication(data.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ data ]);
          gridState.data = agGrid._getAllTableRows();
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const upsertAeronauticalInformationPublication = (rowIndex): void => {
    const data: AeronauticalInformationPublicationModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _countryStore
      .upsertAeronauticalInformationPublication(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AeronauticalInformationPublicationModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
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
        upsertAeronauticalInformationPublication(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        _useConfirmDialog.confirmAction(() => deleteAIP(rowIndex), { isDelete: true, title: 'Delete AIP' });
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Type',
      field: 'aipSourceType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aipSourceType', 2),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'AIP Source Type',
        getAutoCompleteOptions: () => _settingsStore?.aipSourceTypes,
        valueGetter: (option: SettingsTypeModel) => option,
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Link',
      field: 'aipLink',
      cellRenderer: 'agGridLink',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aipLink', 2),
      cellEditorParams: {
        rules: 'required|string|between:1,200|url',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('description', 2),
      cellEditorParams: {
        rules: 'required|string|between:1,200',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'User Name',
      field: 'aipUsername',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('aipUsername', 2),
      cellEditorParams: {
        rules: 'required|string|between:1,50',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Password',
      field: 'aipPassword',
      cellEditorParams: {
        rules: 'required|string|between:1,50',
        ignoreNumber: true,
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            { title: 'Edit', isHidden: !countryModuleSecurity.isEditable, action: GRID_ACTIONS.EDIT },
            { title: 'Delete', isHidden: !countryModuleSecurity.isEditable, action: GRID_ACTIONS.DELETE },
          ],
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: countryModuleSecurity.isEditable,
      gridActionProps: {
        hideActionButtons: !countryModuleSecurity.isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      getRowStyle: () => rowStyle(gridState.isRowEditing, countryModuleSecurity.isEditable),
      pagination: false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadAeronauticalInformationPublication();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadAeronauticalInformationPublication({ pageNumber: 1 });
      },
    };
  };

  /* istanbul ignore next */
  const getFilterCollection = (): IAPIGridRequest => {
    if (!searchHeader.getFilters().searchValue) {
      return {};
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, searchHeader.getFilters().selectInputsValues.get('defaultOption'))
    );
    return {
      searchCollection: JSON.stringify([
        { propertyName: property?.apiPropertyName, propertyValue: searchHeader.getFilters().searchValue },
      ]),
    };
  };

  /* istanbul ignore next */
  const addAIP = () => {
    const aip = new AeronauticalInformationPublicationModel({ id: 0, countryId });
    agGrid.addNewItems([ aip ], { startEditing: false, colKey: 'aipSourceType' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
          onClick={addAIP}
        >
          Add AIP
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(AIP_FILTERS, AIP_FILTERS.ALL) ]}
        rightContent={rightContent}
        onFiltersChanged={loadAeronauticalInformationPublication}
        onSearch={sv => loadAeronauticalInformationPublication()}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadAeronauticalInformationPublication}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('countryStore', 'settingsStore', 'sidebarStore')(observer(AeronauticalInformationPublication));

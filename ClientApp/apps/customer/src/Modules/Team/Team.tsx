import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { VIEW_MODE } from '@wings/shared';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  ViewPermission,
  IAPIGridRequest,
  GridPagination,
  IAPIPageResponse,
} from '@wings-shared/core';
import { gridFilters } from './Fields';
import { ColDef, GridOptions, ICellRendererParams, ICellEditor, ValueFormatterParams } from 'ag-grid-community';
import { AlertStore } from '@uvgo-shared/alert';
import { AxiosError } from 'axios';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { customerSidebarOptions, TEAM_FILTER, TeamModel, TeamStore, useCustomerModuleSecurity } from '../Shared';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';

interface Props extends Partial<ICellRendererParams> {
  teamStore?: TeamStore;
  sidebarStore?: typeof SidebarStore;
}

const Team: FC<Props> = observer(({ teamStore, sidebarStore }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<TEAM_FILTER, TeamModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const _teamStore = teamStore as TeamStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  /* istanbul ignore next */
  // Load Data on Mount
  useEffect(() => {
    _sidebarStore.setNavLinks(customerSidebarOptions(true), 'customer');
    loadInitialData();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const _searchValue = searchHeader.getFilters().searchValue;
    const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    UIStore.setPageLoader(true);
    _teamStore
      .getTeams(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  /* istanbul ignore next */
  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const onDropDownChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: TeamModel): boolean => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'code' ] });
    const value = editorInstance[0].getValue();
    const isDuplicateData = gridState.data.some(a => Utilities.isEqual(a.code, value) && data?.id !== a.id);
    if (isDuplicateData) {
      AlertStore.critical(`Team already exists for Code - ${value}`);
    }
    return isDuplicateData;
  };

  /* istanbul ignore next */
  const upsertTeams = (rowIndex: number): void => {
    const rowData: TeamModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(rowData)) {
      return;
    }
    gridState.gridApi.stopEditing();

    UIStore.setPageLoader(true);
    _teamStore
      .upsertTeam(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: TeamModel) => {
          agGrid._updateTableItem(rowIndex, response);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.SAVE:
        upsertTeams(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('name', 1),
    },
    {
      headerName: 'Code',
      field: 'code',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('code', 1),
    },
    {
      headerName: 'Is Internal',
      field: 'isInternal',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
    },
    {
      headerName: 'Manager Name',
      field: 'managerName',
      valueFormatter: ({ value }: ValueFormatterParams) => value,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('managerName', 1),
    },
    {
      headerName: 'Manager Email',
      field: 'managerEmail',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('managerEmail', 1),
    },
    {
      headerName: 'Group Email',
      field: 'groupEmail',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('groupEmail', 1),
    },
    {
      headerName: 'Display Order',
      field: 'displayOrder',
    },
    {
      headerName: 'Associated Team Types',
      field: 'associatedTeamTypes',
      cellRenderer: 'agGridChipView',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('associatedTeamTypes', 1),
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: node => {
            return [
              {
                title: 'Edit',
                isHidden: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
                action: GRID_ACTIONS.EDIT,
                to: () => `${node.data?.id}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
              },
              {
                title: 'Details',
                action: GRID_ACTIONS.DETAILS,
                to: () => `${node.data?.id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
              },
            ];
          },
          onAction: gridActions,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: customerModuleSecurity.isSettingsEditable || customerModuleSecurity.isGlobalUser,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadInitialData();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isSettingsEditable || customerModuleSecurity.isGlobalUser}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to="new"
          title="Add Team"
          disabled={gridState.isRowEditing || UIStore.pageLoading}
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(TEAM_FILTER, TEAM_FILTER.CODE, 'defaultOption') ]}
        rightContent={rightContent}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        serverPagination={true}
      />
    </>
  );
});

export default inject('teamStore', 'sidebarStore')(Team);

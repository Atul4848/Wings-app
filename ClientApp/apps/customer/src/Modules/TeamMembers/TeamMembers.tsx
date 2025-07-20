import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import {
  customerSidebarOptions,
  TEAM_MEMBER_FILTER,
  TeamMemberModel,
  TeamStore,
  useCustomerModuleSecurity,
} from '../Shared';
import {
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  UIStore,
  Utilities,
  ViewPermission,
  regex,
} from '@wings-shared/core';
import { AxiosError } from 'axios';
import { gridFilters } from './field';
import { inject, observer } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { SidebarStore } from '@wings-shared/layout';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ColDef, GridOptions } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { BaseUserStore, UserRefModel } from '@wings/shared';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';

interface Props {
  teamStore?: TeamStore;
  sidebarStore?: typeof SidebarStore;
}

const TeamMembers: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const customerModuleSecurity = useCustomerModuleSecurity();
  const _teamStore = props.teamStore as TeamStore;
  const _baseUserStore = useMemo(() => new BaseUserStore(), []);
  const agGrid = useAgGrid<TEAM_MEMBER_FILTER, TeamMemberModel>(gridFilters, gridState);

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    props?.sidebarStore.setNavLinks(customerSidebarOptions(true), 'customer');
    loadTeamMembers();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadTeamMembers());
  }, []);

  // need to send filter for Code along with Name
  const searchFilters = (searchValue, selectedOption, request) => {
    const _searchFilters = agGrid.filtersApi.getSearchFilters(searchValue, selectedOption);
    const result = JSON.parse(_searchFilters.searchCollection as string)[0];
    if (selectedOption === TEAM_MEMBER_FILTER.PERSON) {
      request.searchCollection = JSON.stringify(
        [ result ].concat(Utilities.getFilter('Person.LastName', searchValue as string, 'or'))
      );
    }
  };

  /* istanbul ignore next */
  const loadTeamMembers = (pageRequest?: IAPIGridRequest) => {
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
    if (_searchValue) {
      searchFilters(_searchValue, _selectedOption, request);
    }
    UIStore.setPageLoader(true);
    _teamStore
      .getTeamMembers(request)
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
  const isAlreadyExists = (model: TeamMemberModel): boolean => {
    const _personGuid = agGrid.getCellEditorInstance('person').getValue()?.guid;
    const isExists = gridState.data
      .filter(x => x.id !== model.id)
      .some(x => {
        if (Utilities.isEqual(x.person?.guid, _personGuid)) {
          agGrid.showAlert('Team Member already exists.', 'upsertTeamMember');
          return true;
        }
        return false;
      });
    return isExists;
  };

  /* istanbul ignore next */
  const upsertTeamMember = (rowIndex): void => {
    const data: TeamMemberModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _teamStore
      .upsertTeamMember(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const addTeamMember = () => {
    const member = new TeamMemberModel({ id: 0 });
    agGrid.addNewItems([ member ], { startEditing: false, colKey: 'person' });
    gridState.setHasError(true);
  };

  const onInputChange = (params: any, value: string) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = ({ colDef }, value: any) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const searchUsers = (searchValue: string): void => {
    const request = {
      q: searchValue,
    };
    UIStore.setPageLoader(true);
    _baseUserStore
      .getUsers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const _users = response.results.filter(x => x.guid && x.email);
        _baseUserStore.users = _users.filter(x => {
          return [ x.firstName, x.lastName, x.email ]
            .filter(p => Boolean(p))
            .join(' ')
            .toLowerCase()
            .includes(searchValue?.toLowerCase());
        });
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
        upsertTeamMember(rowIndex);
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
      headerName: 'Team Member',
      field: 'person',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('person', 1),
      valueFormatter: ({ value }) => value?.label || '',
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        isRequired: true,
        showTooltip: true,
        placeHolder: 'Team Member',
        onSearch: value => searchUsers(value),
        isLoading: () => UIStore.pageLoading,
        getOptionTooltip: option => (option as UserRefModel)?.email,
        getAutoCompleteOptions: () => _baseUserStore.users,
      },
    },
    {
      headerName: 'Extension',
      field: 'extension',
      maxWidth: 130,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('extension', 1),
      cellEditorParams: {
        placeHolder: 'Extension',
        rules: 'string|max:4',
      },
    },
    {
      headerName: 'Company Cell',
      field: 'companyCell',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('companyCell', 1),
      cellEditorParams: {
        placeHolder: 'Company Cell',
        validators: ({ field }) => {
          return [
            Boolean(field.value) ? regex.phoneNumberWithHyphen.test(field.value) : true,
            'Please enter valid Cell Number',
          ];
        },
      },
    },
    {
      headerName: 'Team Association',
      field: 'teams',
      sortable: false,
      editable: false,
      cellRenderer: 'agGridChipView',
      valueFormatter: ({ value }) => value?.label || '',
    },
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        hide: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
              action: GRID_ACTIONS.EDIT,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
        onDropDownChange,
      },
      columnDefs,
      isEditable: customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser,
      gridActionProps: {
        hideActionButtons: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });
    return {
      ...baseOptions,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressClickEdit: true,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadTeamMembers();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadTeamMembers({ pageNumber: 1 });
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
          onClick={addTeamMember}
        >
          Add Team Member
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(TEAM_MEMBER_FILTER, TEAM_MEMBER_FILTER.PERSON) ]}
        onFiltersChanged={loadTeamMembers}
        onSearch={sv => loadTeamMembers()}
        rightContent={rightContent}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadTeamMembers}
      />
    </>
  );
};

export default inject('teamStore', 'sidebarStore')(observer(TeamMembers));

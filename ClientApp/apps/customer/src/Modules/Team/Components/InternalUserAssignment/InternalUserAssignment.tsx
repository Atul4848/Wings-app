import React, { FC, ReactNode, useEffect } from 'react';
import { AxiosError } from 'axios';
import { observer, inject } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertStore } from '@uvgo-shared/alert';
import { ModelStatusOptions, useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { useStyles } from './InternalUserAssignment.styles';
import { GridOptions, ColDef } from 'ag-grid-community';
import { UIStore, Utilities, GRID_ACTIONS, ViewPermission, baseEntitySearchFilters } from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { InternalUserAssignmentModel, TeamStore, useCustomerModuleSecurity } from '../../../Shared';

interface Props {
  teamStore?: TeamStore;
}

const InternalUserAssignment: FC<Props> = ({ teamStore }: Props) => {
  const params = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const _teamStore = teamStore as TeamStore;
  const customerModuleSecurity = useCustomerModuleSecurity();
  const agGrid = useAgGrid<'', InternalUserAssignmentModel>([], gridState);
  const useUpsert = useBaseUpsertComponent<InternalUserAssignmentModel>(params, {}, baseEntitySearchFilters);

  const _disabled =
    !customerModuleSecurity.isEditable || !useUpsert.isEditable || gridState.isRowEditing || UIStore.pageLoading;

  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _teamStore
      .getAssociatedTeamMembers(Number(params.teamId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response.results));
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'teamMember' ], id)) {
      agGrid.showAlert('Team Member should be unique', 'upsertInternalUserMessage');
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertInternalUser = (rowIndex): void => {
    const data: InternalUserAssignmentModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _teamStore
      .upsertAssociatedTeamMember(Number(params.teamId), data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
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
        upsertInternalUser(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const addInternalUser = (): void => {
    const teamEmailCommsModel = new InternalUserAssignmentModel({ id: 0 });
    agGrid.addNewItems([ teamEmailCommsModel ], { startEditing: false, colKey: 'teamMember' });
    gridState.setHasError(true);
  };

  const onDropDownChange = ({ colDef }, value: any) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const searchTeamMember = (searchValue: string): void => {
    if (!Boolean(searchValue)) {
      return;
    }
    const request = {
      searchCollection: JSON.stringify([
        Utilities.getFilter('Person.FirstName', searchValue),
        Utilities.getFilter('Person.LastName', searchValue, 'or'),
        Utilities.getFilter('Person.Email', searchValue, 'or'),
      ]),
    };
    UIStore.setPageLoader(true);
    _teamStore
      .getTeamMembers(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => (_teamStore.teamMembers = response.results));
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        if (Utilities.isEqual(params.viewMode || '', VIEW_MODE.DETAILS)) {
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate('/customer/team');
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Team Member',
      field: 'teamMember',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Team Member',
        onSearch: value => searchTeamMember(value),
        isLoading: () => UIStore.pageLoading,
        getAutoCompleteOptions: () => _teamStore.teamMembers,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: false,
          hide: !customerModuleSecurity.isEditable,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onDropDownChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        hideActionButtons: _disabled,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      pagination: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title=""
        backNavTitle="Team"
        onAction={onAction}
        isSaveVisible={false}
        backNavLink="/customer/team"
        isEditMode={useUpsert.isEditView}
        isRowEditing={gridState.isRowEditing}
        showEditControlls={useUpsert.isEditable}
        disableActions={useUpsert.isActionDisabled}
        hasEditPermission={customerModuleSecurity.isEditable}
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={useUpsert.isEditable}>
      <div className={classes.buttonContainer}>
        <ViewPermission hasPermission={customerModuleSecurity.isEditable}>
          <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={_disabled} onClick={addInternalUser}>
            Add Internal User
          </PrimaryButton>
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing}
          key={`internalUser-${useUpsert.isEditable}`}
        />
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('settingsStore', 'teamStore')(observer(InternalUserAssignment));

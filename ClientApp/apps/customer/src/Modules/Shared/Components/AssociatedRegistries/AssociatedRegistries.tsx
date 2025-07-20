import React, { FC, ReactNode, useEffect } from 'react';
import { CustomLinkButton, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
  ASSOCIATED_REGISTRY_FILTER,
  AssociatedRegistriesModel,
  CustomerStore,
  RegistryStore,
  SettingsStore,
  useCustomerModuleSecurity,
} from '../../index';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  ISelectOption,
  UIStore,
  Utilities,
  ViewPermission,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { useStyles } from '../../Styles';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useNavigate, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import AddIcon from '@material-ui/icons/AddCircleOutline';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  registryStore?: RegistryStore;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
}

const AssociatedRegistries: FC<Props> = ({
  title,
  backNavTitle,
  backNavLink,
  registryStore,
  settingsStore,
  customerStore,
}: Props) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<ASSOCIATED_REGISTRY_FILTER, AssociatedRegistriesModel>([], gridState);
  const classes = useStyles();
  const params = useParams();
  const navigate = useNavigate();
  const searchHeader = useSearchHeader();
  const useUpsert = useBaseUpsertComponent<AssociatedRegistriesModel>(params, {}, baseEntitySearchFilters);
  const _registryStore = registryStore as RegistryStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadAssociatedRegistries();
  }, []);

  /* istanbul ignore next */
  const loadAssociatedRegistries = (): void => {
    UIStore.setPageLoader(true);
    _registryStore
      .getAssociatedRegistries(_customerStore.selectedCustomer?.number)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  /* istanbul ignore next */
  const columnDefs = [
    {
      headerName: 'Registry',
      field: 'registry',
      cellEditor: 'customAutoComplete',
      headerTooltip: 'Registry',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'name'),
      filter: false,
      minWidth: 120,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      headerTooltip: 'Start Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      headerTooltip: 'End Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'Team',
      field: 'team',
      cellEditor: 'customAutoComplete',
      filter: false,
      headerTooltip: 'Team',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Service Type',
      field: 'associatedRegistryServiceTypes',
      cellRenderer: 'agGridChipView',
      sortable: false,
      filter: false,
      minWidth: 250,
      cellEditor: 'customAutoComplete',
    },
    {
      headerName: 'Site',
      field: 'associatedRegistrySites',
      cellRenderer: 'agGridChipView',
      sortable: false,
      filter: false,
      minWidth: 250,
      cellEditor: 'customAutoComplete',
    },
    ...agGrid.generalFields(_settingsStore, 'asc'),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !customerModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
              to: node => `${node.data.registry.registryId}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
              to: node => `${node.data.registry.registryId}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
            },
          ],
        },
      }),
    },
  ];

  const onInputChange = () => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = () => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
        onDropDownChange,
      },
      columnDefs,
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, registry, team } = node.data as AssociatedRegistriesModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [ASSOCIATED_REGISTRY_FILTER.REGISTRY]: registry.label,
              [ASSOCIATED_REGISTRY_FILTER.TEAM]: team.label,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: params => agGrid.onRowEditingStarted(params),
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
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
        navigate(backNavLink);
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavTitle={backNavTitle}
        backNavLink={backNavLink}
        disableActions={useUpsert.isActionDisabled}
        isEditMode={useUpsert.isEditable}
        isActive={params.viewMode === VIEW_MODE.DETAILS.toLowerCase()}
        hasEditPermission={customerModuleSecurity.isEditable}
        onAction={action => onAction(action)}
        showBreadcrumb={true}
      />
    );
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isEditable}>
        <CustomLinkButton
          disabled={!useUpsert.isEditable}
          variant="contained"
          startIcon={<AddIcon />}
          to="new"
          title="Add Association"
        />
      </ViewPermission>
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isBreadCrumb={true} isEditMode={!useUpsert.isDetailView}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(ASSOCIATED_REGISTRY_FILTER, ASSOCIATED_REGISTRY_FILTER.REGISTRY),
        ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        onExpandCollapse={agGrid.autoSizeColumns}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        key={useUpsert.viewMode} //NOTE: Do not remove this key.
        classes={{ customHeight: classes.customHeight }}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('registryStore', 'settingsStore', 'customerStore')(observer(AssociatedRegistries));

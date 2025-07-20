import React, { FC, ReactNode, useEffect } from 'react';
import {
  useCustomerModuleSecurity,
  SettingsStore,
  CustomerProfileModel,
  CustomerStore,
  CustomerModel,
  CUSTOMER_PROFILE,
  CUSTOMER_LEVEL,
} from '../../../Shared';
import { gridFilters } from './fields';
import { ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { ColDef, GridOptions, RowEditingStartedEvent, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { EDITOR_TYPES, SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { AlertStore } from '@uvgo-shared/alert';
import {
  ViewPermission,
  GRID_ACTIONS,
  IAPIGridRequest,
  Utilities,
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  UIStore,
  ISelectOption,
  GridPagination,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { takeUntil, finalize } from 'rxjs/operators';
import { observable } from 'mobx';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import { Chip } from '@material-ui/core';
import { forkJoin } from 'rxjs';
import { useParams } from 'react-router';

interface Props {
  backNavTitle?: string;
  backNavLink?: string;
  sidebarStore?: typeof SidebarStore;
  isDisabled?: boolean;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
  defaultCustomer?: CustomerModel;
  customerPartyId?: number;
}

const CustomerProfile: FC<Props> = ({
  isDisabled = false,
  backNavTitle,
  backNavLink,
  defaultCustomer,
  customerPartyId,
  ...props
}) => {
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<CUSTOMER_PROFILE, CustomerProfileModel>(gridFilters, gridState);
  const _settingsStore = props.settingsStore as SettingsStore;
  const _customerStore = props.customerStore as CustomerStore;
  const unsubscribe = useUnsubscribe();
  const customerModuleSecurity = useCustomerModuleSecurity();
  const _observable = observable({
    isEntityDisable: true,
    entityOptions: [],
    disabledColumns: [],
  });
  const startAndEndDate = observable({ startDate: '', endDate: '' });
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<CustomerProfileModel>(params, gridFilters, baseEntitySearchFilters);

  // Load Data on Mount
  useEffect(() => {
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadInitialData());
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadInitialData());
  }, []);

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
      filterCollection: JSON.stringify([ Utilities.getFilter('Customer.PartyId', customerPartyId) ]),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getCustomerProfile(request)
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

  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getProfileLevel(), _settingsStore.getProfileTopic() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const viewRendererEntity = (chips, getTagProps?: AutocompleteGetTagProps): ReactNode => {
    const numTags = chips?.length;
    const limitTags = 1;
    const chipsList = [ ...chips ].slice(0, limitTags);
    return (
      <div>
        {chipsList.map((chip, index) => (
          <Chip
            key={chip.id || chip.entityId}
            label={chip?.label || chip?.entityName || ''}
            {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
          />
        ))}
        {numTags > limitTags && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  const clear = () => {
    startAndEndDate.startDate = '';
    startAndEndDate.endDate = '';
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Level',
      field: 'customerProfileLevel',
      cellEditor: 'customAutoComplete',
      headerTooltip: 'Level',
      minWidth: 200,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('customerProfileLevel', 1),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Level',
        getAutoCompleteOptions: () => _settingsStore.profileLevel,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Entity',
      field: 'entities',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'agGridChipView',
      headerTooltip: 'Entity',
      minWidth: 200,
      valueFormatter: ({ value }) => value?.label || value?.entityName,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('entities', 1),
      cellEditorParams: {
        getDisableState: () => _observable.isEntityDisable,
        isRequired: true,
        placeHolder: 'Entity',
        multiSelect: true,
        getAutoCompleteOptions: () => _observable.entityOptions,
        renderTags: viewRendererEntity,
      },
    },
    {
      headerName: 'Topic',
      field: 'profileTopic',
      cellEditor: 'customAutoComplete',
      headerTooltip: 'Topic',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('profileTopic', 1),
      cellEditorParams: {
        placeHolder: 'Topic',
        isRequired: true,
        getAutoCompleteOptions: () => _settingsStore.profileTopic,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Text',
      field: 'text',
      cellRenderer: 'customTextAreaEditor',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('text', 2),
      cellRendererParams: {
        readOnly: true,
        editorType: EDITOR_TYPES.RICH_TEXT_EDITOR,
      },
      cellEditor: 'customTextAreaEditor',
      cellEditorParams: {
        rules: 'string|max:9000',
      },
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Start Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        maxDate: () => startAndEndDate.endDate,
      },
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
        placeHolder: 'End Date',
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        minDate: () => startAndEndDate.startDate,
      },
    },
    {
      headerName: 'UFN',
      field: 'isUFN',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      headerTooltip: 'UFN',
      cellEditorParams: {
        getDisableState: () => _observable.disabledColumns.includes('isUFN'),
      },
    },
    {
      headerName: 'Status',
      headerTooltip: 'Status',
      field: 'status',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'statusRenderer',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('status', 1),
      cellEditorParams: {
        isRequired: true,
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: false,
        },
      }),
    },
  ];

  const onInputChange = (params, value: string) => {
    if (Utilities.isEqual(params.colDef.field, 'startDate')) {
      startAndEndDate.startDate = value;
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
      return;
    }
    if (Utilities.isEqual(params.colDef.field, 'endDate')) {
      startAndEndDate.endDate = value;
      if (!value) {
        _observable.disabledColumns = [];
        agGrid.fetchCellInstance('isUFN').setValue(true);
        gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        return;
      }
      agGrid.fetchCellInstance('isUFN').setValue(false);
      _observable.disabledColumns = [ 'isUFN' ];
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (params, value) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    if (Utilities.isEqual(params.colDef.field, 'customerProfileLevel')) {
      if (Utilities.isEqual(value?.name, CUSTOMER_LEVEL.CUSTOMER)) {
        const _customer = [ defaultCustomer ].map(x => {
          return {
            entityId: x.partyId,
            entityName: x?.name,
            label: x?.name,
          };
        });
        // _observable.entityOptions = _customer;
        agGrid.fetchCellInstance('entities').setValue(_customer);
        _observable.isEntityDisable = true;
        gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        return;
      }
      agGrid.fetchCellInstance('entities').setValue([]);
      _observable.isEntityDisable = false;
      if (Utilities.isEqual(value?.name, CUSTOMER_LEVEL.CUSTOMER_REGISTRY)) {
        _observable.entityOptions = defaultCustomer.associatedRegistries.filter(reg => reg.status?.name === 'Active');
        gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        return;
      }
      if (Utilities.isEqual(value?.name, CUSTOMER_LEVEL.CUSTOMER_OFFICE)) {
        _observable.entityOptions = defaultCustomer.associatedOffices.filter(reg => reg.status?.name === 'Active');
        gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        return;
      }

      return;
    }
  };

  const hasMatchingEntityIds = (currentIds: any[], existingIds: any[]): boolean => {
    if (!Array.isArray(currentIds) || !Array.isArray(existingIds)) return false;

    // Convert to string IDs for reliable comparison
    const currentIdSet = new Set(currentIds.map(e => e?.value?.toString()));
    const existingIdSet = new Set(existingIds.map(e => e?.value?.toString()));

    if (currentIdSet.size !== existingIdSet.size) return false;

    for (const id of currentIdSet) {
      if (!existingIdSet.has(id)) return false;
    }

    return true; // all IDs matched
  };

  const isAlreadyExists = (rowIndex: number): boolean => {
    const editors = gridState.gridApi.getCellEditorInstances({
      columns: [ 'customerProfileLevel', 'entities', 'profileTopic', 'endDate', 'isUFN' ],
    });

    const [ level, entity, topic, endDate, isUFN ] = editors.map(e => e?.getValue());
    const isCombinationExist = gridState.data.some((row, i) => {
      if (row.id === rowIndex) return false;
      const sameLevel = Utilities.isEqual(row.customerProfileLevel?.value, level?.value);
      const sameTopic = Utilities.isEqual(row.profileTopic?.value, topic?.value);
      let sameEntity = false;
      if (level?.label === CUSTOMER_LEVEL.CUSTOMER_REGISTRY || level?.label === CUSTOMER_LEVEL.CUSTOMER_OFFICE) {
        sameEntity = hasMatchingEntityIds(entity, row.entities);
      } else {
        sameEntity = Utilities.isEqual(entity[0]?.entityId, row.entities[0]?.entityId);
      }

      if (!sameLevel || !sameTopic || !sameEntity) return false;

      const editorHasNoEndDate = !endDate;
      const rowHasNoEndDate = !row.endDate;

      // UFN check: both must be true and no endDate
      if (isUFN && row.isUFN && editorHasNoEndDate && rowHasNoEndDate) {
        return true;
      }

      // Non-UFN match: compare endDate
      const sameEndDate = Utilities.isSameDate(endDate, row.endDate, DATE_FORMAT.API_DATE_FORMAT);
      if (sameEndDate) {
        return true;
      }
      return false;
    });
    return isCombinationExist;
  };

  const upsertCustomerProfile = rowIndex => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return agGrid.showAlert(
        'Combination of Customer Profile Level, Profile Topic, Entities and End Date should be unique',
        'CustomerProfile'
      );
    }
    gridState.gridApi.stopEditing();
    const request = new CustomerProfileModel({
      ...model,
      customerName: defaultCustomer.name,
      customerNumber: defaultCustomer.number,
      partyId: defaultCustomer.partyId,
    });
    UIStore.setPageLoader(true);
    _customerStore
      .upsertCustomerProfile(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: CustomerProfileModel) => {
          agGrid._updateTableItem(rowIndex, response);
          clear();
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
          AlertStore.critical(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const deleteCustomerProfile = rowIndex => {
    const model = agGrid._getTableItem(rowIndex);
    agGrid._removeTableItems([ model ]);
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        const rowData = gridState.gridApi.getRowNode(String(rowIndex))?.data;
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        startAndEndDate.startDate = rowData?.startDate;
        startAndEndDate.endDate = rowData?.endDate;
        break;
      case GRID_ACTIONS.SAVE:
        upsertCustomerProfile(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        const model: CustomerProfileModel = agGrid._getTableItem(rowIndex);
        agGrid.cancelEditing(rowIndex);
        clear();
        if (model.id === 0) {
          deleteCustomerProfile(model);
          return;
        }
        break;
    }
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
        onDropDownChange,
      },
      columnDefs,
      isEditable: useUpsert.isEditView,
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
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        _observable.isEntityDisable = event?.data?.customerProfileLevel?.label === CUSTOMER_LEVEL.CUSTOMER;

        agGrid.onRowEditingStarted(event);
        loadSettingsData();
      },
    };
  };
  /* istanbul ignore next */
  const addCustomerProfile = () => {
    const profile = new CustomerProfileModel({
      id: 0,
      isUFN: true,
      entities: [],
    });
    agGrid.addNewItems([ profile ], { startEditing: false, colKey: 'customerProfileLevel' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing || UIStore.pageLoading || gridState.isProcessing || !useUpsert.isEditable}
          onClick={addCustomerProfile}
        >
          Add Customer Profile
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={defaultCustomer.name}
        backNavTitle={backNavTitle}
        backNavLink={backNavLink}
        isEditMode={false}
        showBreadcrumb={true}
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false} isBreadCrumb={true}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(CUSTOMER_PROFILE, CUSTOMER_PROFILE.LEVEL) ]}
        onResetFilterClick={() => agGrid.filtersApi.resetColumnFilters()}
        rightContent={rightContent}
        onFiltersChanged={loadInitialData}
        onSearch={() => loadInitialData()}
        disableControls={Boolean(Array.from(gridState.columFilters).length)}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        gridOptions={gridOptions()}
        key={`customerProfile-${isDisabled}`}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('settingsStore', 'sidebarStore', 'customerStore')(observer(CustomerProfile));

import React, { FC, ReactNode, useEffect } from 'react';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import {
  AssociatedOfficeModel,
  AssociatedRegistriesModel,
  CustomerStore,
  OFFICE_FILTER,
  RegistryStore,
  SettingsStore,
  useCustomerModuleSecurity,
} from '../../index';
import { gridFilters } from './fields';
import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  EntityMapModel,
  GRID_ACTIONS,
  ISelectOption,
  IdNameCodeModel,
  MODEL_STATUS,
  UIStore,
  Utilities,
  ViewPermission,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import { AirportModel, BaseAirportStore, useBaseUpsertComponent } from '@wings/shared';
import { AlertStore } from '@uvgo-shared/alert';
import { useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AxiosError } from 'axios';
import { observable } from 'mobx';
import { forkJoin } from 'rxjs';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { useStyles } from '../../Styles';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
  registryStore?: RegistryStore;
}

const AssociatedOffice: FC<Props> = ({
  title,
  backNavTitle,
  backNavLink,
  settingsStore,
  customerStore,
  registryStore,
}: Props) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<OFFICE_FILTER, AssociatedOfficeModel>(gridFilters, gridState);
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<AssociatedOfficeModel>(params, gridFilters, baseEntitySearchFilters);
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;
  const _registryStore = registryStore as RegistryStore;
  const baseAirportStore = new BaseAirportStore();
  const startAndEndDate = observable({ startDate: '', endDate: '' });
  const _observable = observable<any>({
    associatedRegistries: [],
    selectedAssociatedRegistryIds: [],
    isOfficeActive: true,
  });
  const searchHeader = useSearchHeader();
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadAssociatedOffice();
  }, []);

  /* istanbul ignore next */
  const loadAssociatedOffice = (): void => {
    const request = {
      filterCollection: JSON.stringify([{ number: _customerStore.selectedCustomer?.number }]),
    };
    UIStore.setPageLoader(true);
    _customerStore
      .getAssociatedOffice(_customerStore.selectedCustomer?.number, request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  /* istanbul ignore next */
  const loadSettingsAndResgistries = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      _registryStore.getAssociatedRegistries(_customerStore.selectedCustomer?.number),
      _settingsStore.getSourceTypes(),
      _settingsStore.getAccessLevels(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ associatedRegistries ]) => {
        _observable.associatedRegistries = associatedRegistries;
      });
  };

  const clear = () => {
    startAndEndDate.startDate = '';
    startAndEndDate.endDate = '';
    _observable.isOfficeActive = true;
  };

  /* istanbul ignore next */
  const searchAirports = (searchValue: string): void => {
    UIStore.setPageLoader(true);
    baseAirportStore
      .searchWingsAirports(searchValue, false)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const onInputChange = (params, value: string) => {
    switch (params.colDef.field) {
      case 'startDate':
        startAndEndDate.startDate = value;
        break;
      case 'endDate':
        startAndEndDate.endDate = value;
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (params, value) => {
    if (params.colDef.field === 'status') {
      if (value.id === MODEL_STATUS.IN_ACTIVE) {
        _observable.isOfficeActive = false;
        agGrid.fetchCellInstance('customerAssociatedRegistries').setValue([]);
      } else {
        _observable.isOfficeActive = true;
      }
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const upsertAssociatedOffice = (rowIndex): void => {
    gridState.gridApi.stopEditing();
    const data: AssociatedOfficeModel = new AssociatedOfficeModel({
      ...agGrid._getTableItem(rowIndex),
      customer: _customerStore.selectedCustomer,
    });
    const isAddNew: boolean = data.id === 0;
    UIStore.setPageLoader(true);
    _customerStore
      .upsertAssociatedOffice(data, _customerStore.selectedCustomer.partyId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AssociatedOfficeModel) => {
          const { associatedOffices } = _customerStore.selectedCustomer;
          _observable.selectedAssociatedRegistryIds = [];
          agGrid._updateTableItem(rowIndex, response);
          agGrid.expandGeneralDetails();
          _customerStore.selectedCustomer.associatedOffices = Utilities.updateArray<AssociatedOfficeModel>(
            associatedOffices,
            response,
            {
              replace: !isAddNew,
              predicate: t => t.id === response.id,
            }
          );
          clear();
        },
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
        const rowData = gridState.gridApi.getRowNode(String(rowIndex))?.data;
        const associatedRegistryIds = rowData.customerAssociatedRegistries?.map(x => x.id);
        _observable.selectedAssociatedRegistryIds = associatedRegistryIds;
        _observable.isOfficeActive = rowData.statusId === MODEL_STATUS.ACTIVE;
        agGrid.expandGeneralDetails(true);
        agGrid._startEditingCell(rowIndex, columnDefs[2].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAssociatedOffice(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        _observable.selectedAssociatedRegistryIds = [];
        agGrid.cancelEditing(rowIndex);
        agGrid.expandGeneralDetails();
        clear();
        break;
    }
  };

  /* istanbul ignore next */
  const mapAirports = (airports: AirportModel[]): IdNameCodeModel[] => {
    return airports.map(
      airport =>
        new IdNameCodeModel({
          id: airport.id,
          name: airport.name,
          code: airport.displayCode,
        })
    );
  };

  /* istanbul ignore next */
  const getAssociatedIds = (ids: number[]) => {
    return Boolean(_observable.selectedAssociatedRegistryIds?.length)
      ? ids?.filter(x => !_observable.selectedAssociatedRegistryIds?.includes(x))
      : ids;
  };

  /* istanbul ignore next */
  const getIds = () => {
    let ids: number[] = [];
    gridState.gridApi.forEachNode(x => {
      const data = x.data;
      if (data.statusId === MODEL_STATUS.ACTIVE && data.customerAssociatedRegistries[0]?.id) {
        const associatedRegistryIds = data.customerAssociatedRegistries.map(x => x.id);
        ids = ids.concat(associatedRegistryIds);
      }
    });
    return ids;
  };

  /* istanbul ignore next */
  const mapEntities = (associatedRegistries: AssociatedRegistriesModel[]) => {
    const ids = getIds();
    const filteredRegistries = associatedRegistries?.filter(x => !getAssociatedIds(ids)?.includes(x.id));
    return filteredRegistries?.map(
      associatedRegistry =>
        new EntityMapModel({
          id: associatedRegistry.id,
          entityId: associatedRegistry.registry.id,
          name: associatedRegistry.registry.name,
        })
    );
  };

  /* istanbul ignore next */
  const detailColumnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      filter: false,
      headerTooltip: 'Name',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Name',
        rules: 'required|string|between:1,200',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      filter: false,
      headerTooltip: 'Code',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Code',
        rules: 'required|string|between:1,3',
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      headerTooltip: 'Start Date',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
      cellEditorParams: {
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
      filter: false,
      headerTooltip: 'End Date',
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
      headerName: 'Airport',
      field: 'airport',
      cellEditor: 'customAutoComplete',
      headerTooltip: 'Airport',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      minWidth: 200,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Airport',
        getAutoCompleteOptions: () => mapAirports(baseAirportStore.wingsAirports),
        onSearch: value => searchAirports(value),
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Registry',
      field: 'customerAssociatedRegistries',
      cellRenderer: 'agGridChipView',
      sortable: false,
      filter: false,
      headerTooltip: 'Registry',
      minWidth: 250,
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        displayKey: 'name',
        placeHolder: 'Select Registry',
        multiSelect: true,
        disableCloseOnSelect: true,
        limitTags: () => 1,
        getAutoCompleteOptions: () => mapEntities(_observable.associatedRegistries),
        // as per tech call we are not allowing user to edit registries for office
        getDisableState: () => true,
      },
    },
    ...agGrid.generalFields(_settingsStore, 'asc'),
    ...agGrid.auditFields(gridState.isRowEditing),
  ];

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    ...detailColumnDefs,
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !customerModuleSecurity.isEditable,
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
      columnDefs: useUpsert.isEditable ? columnDefs : detailColumnDefs,
      isEditable: useUpsert.isEditView,
      gridActionProps: {
        hideActionButtons: !customerModuleSecurity.isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressClickEdit: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, code, airport } = node.data as AssociatedOfficeModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [OFFICE_FILTER.NAME]: name,
              [OFFICE_FILTER.CODE]: code,
              [OFFICE_FILTER.AIRPORT]: airport.label,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        loadSettingsAndResgistries();
      },
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
  };

  /* istanbul ignore next */
  const addAssociatedOffice = () => {
    const associatedOffice = new AssociatedOfficeModel({
      id: 0,
      customerAssociatedRegistries: [],
    });
    agGrid.expandGeneralDetails(true);
    agGrid.addNewItems([ associatedOffice ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!useUpsert.isEditable || gridState.isRowEditing || UIStore.pageLoading || gridState.isProcessing}
          onClick={addAssociatedOffice}
        >
          Add Association
        </PrimaryButton>
      </ViewPermission>
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
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
        selectInputs={[ agGridUtilities.createSelectOption(OFFICE_FILTER, OFFICE_FILTER.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onExpandCollapse={agGrid.autoSizeColumns}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        classes={{ customHeight: classes.customHeight }}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('settingsStore', 'customerStore', 'registryStore')(observer(AssociatedOffice));

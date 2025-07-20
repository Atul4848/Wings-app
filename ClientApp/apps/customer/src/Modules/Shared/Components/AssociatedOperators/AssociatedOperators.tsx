import React, { FC, ReactNode, useEffect } from 'react';
import { forkJoin } from 'rxjs';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import {
  AssociatedOperatorsModel,
  OperatorStore,
  OperatorModel,
  SettingsStore,
  CustomerStore,
  ASSOCIATED_OPERATOR_FILTER,
  useCustomerModuleSecurity,
} from '../../index';
import {
  AccessLevelModel,
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  GRID_ACTIONS,
  ISelectOption,
  SourceTypeModel,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  ViewPermission,
} from '@wings-shared/core';
import { useStyles } from '../../Styles';
import { ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AlertStore } from '@uvgo-shared/alert';
import { useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AxiosError } from 'axios';
import { observable } from 'mobx';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  operatorStore?: OperatorStore;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
}

const AssociatedOperators: FC<Props> = ({
  title,
  backNavTitle,
  backNavLink,
  operatorStore,
  settingsStore,
  customerStore,
}: Props) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<ASSOCIATED_OPERATOR_FILTER, AssociatedOperatorsModel>([], gridState);
  const classes = useStyles();
  const params = useParams();
  const searchHeader = useSearchHeader();
  const useUpsert = useBaseUpsertComponent<AssociatedOperatorsModel>(params, {}, baseEntitySearchFilters);
  const _operatorStore = operatorStore as OperatorStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;
  const startAndEndDate = observable({ startDate: '', endDate: '' });
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadAssociatedOperators();
  }, []);

  const clearDate = () => {
    startAndEndDate.startDate = '';
    startAndEndDate.endDate = '';
  };

  /* istanbul ignore next */
  const loadAssociatedOperators = () => {
    UIStore.setPageLoader(true);
    _operatorStore
      .getAssociatedOperators(_customerStore.selectedCustomer?.number)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  /* istanbul ignore next */
  const searchOperators = (searchValue: string): void => {
    const request = {
      searchCollection: JSON.stringify([{ propertyName: 'Name', propertyValue: searchValue }]),
    };
    UIStore.setPageLoader(true);
    _operatorStore
      .getOperatorsNoSql(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        _operatorStore.operatorList = response.results.filter(({ status }: OperatorModel) => status?.name === 'Active');
      });
  };

  /* istanbul ignore next */
  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getSourceTypes(), _settingsStore.getAccessLevels() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const onInputChange = (params: any, value: string) => {
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

  const onDropDownChange = (params: any, value: any) => {
    if (Utilities.isEqual(params.colDef.field, 'Operator')) {
      agGrid.fetchCellInstance('status').setValue(value?.status);
      agGrid.fetchCellInstance('accessLevel').setValue(value?.accessLevel);
      agGrid.fetchCellInstance('sourceType').setValue(value?.sourceType);
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const upsertAssociateOperator = (rowIndex): void => {
    gridState.gridApi.stopEditing();
    const data: AssociatedOperatorsModel = new AssociatedOperatorsModel({
      ...agGrid._getTableItem(rowIndex),
      customer: _customerStore.selectedCustomer,
    });
    UIStore.setPageLoader(true);
    _operatorStore
      .upsertAssociatedOperator(data, _customerStore.selectedCustomer.partyId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AssociatedOperatorsModel) => {
          agGrid._updateTableItem(rowIndex, response);
          clearDate();
        },
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
        agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAssociateOperator(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        clearDate();
        break;
    }
  };

  /* istanbul ignore next */
  const detailColumnDefs: ColDef[] = [
    {
      headerName: 'Operator',
      field: 'operator',
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Operator',
        getAutoCompleteOptions: () => _operatorStore.operatorList,
        onSearch: value => searchOperators(value),
        valueGetter: (option: ISelectOption) => option,
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customTimeEditor',
      filter: false,
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
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      sort: 'asc',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Source Type',
        getAutoCompleteOptions: () => _settingsStore.sourceTypes,
        valueGetter: (option: ISelectOption) => option,
      },
    },
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
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        return node.data.operator.name?.toLowerCase().includes(searchHeader.getFilters().searchValue?.toLowerCase());
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        loadSettingsData();
      },
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
  };

  /* istanbul ignore next */
  const addAssociatedOperator = () => {
    const associatedOperator = new AssociatedOperatorsModel({ id: 0 });
    agGrid.addNewItems([ associatedOperator ], { startEditing: false, colKey: 'operator' });
    gridState.setHasError(true);
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

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={customerModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!useUpsert.isEditable || gridState.isRowEditing || UIStore.pageLoading || gridState.isProcessing}
          onClick={addAssociatedOperator}
        >
          Add Association
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false} isBreadCrumb={true}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(ASSOCIATED_OPERATOR_FILTER, ASSOCIATED_OPERATOR_FILTER.OPERATOR),
        ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
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

export default inject('operatorStore', 'settingsStore', 'customerStore')(observer(AssociatedOperators));

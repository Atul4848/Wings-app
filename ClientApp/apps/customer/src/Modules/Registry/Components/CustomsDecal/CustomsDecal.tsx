import React, { FC, ReactNode, useEffect } from 'react';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ColDef, GridOptions, ValueFormatterParams, RowNode } from 'ag-grid-community';
import {
  DATE_TIME_PICKER_TYPE,
  GRID_ACTIONS,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  ViewPermission,
  DATE_FORMAT,
  StatusTypeModel,
  SettingsTypeModel,
} from '@wings-shared/core';
import {
  CUSTOMS_DECAL_FILTER,
  CustomsDecalModel,
  RegistryStore,
  SettingsStore,
  useCustomerModuleSecurity,
  useStyles,
} from '../../../Shared';
import { ModelStatusOptions, useBaseUpsertComponent } from '@wings/shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AlertStore } from '@uvgo-shared/alert';
import { useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { AxiosError } from 'axios';
import { observable } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  registryStore?: RegistryStore;
  settingsStore?: SettingsStore;
}

const CustomsDecal: FC<Props> = ({ title, backNavTitle, backNavLink, registryStore, settingsStore }: Props) => {
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<CUSTOMS_DECAL_FILTER, CustomsDecalModel>([], gridState);
  const classes = useStyles();
  const params = useParams();
  const searchHeader = useSearchHeader();
  const useUpsert = useBaseUpsertComponent<CustomsDecalModel>(params, {}, baseEntitySearchFilters);
  const _registryStore = registryStore as RegistryStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _observable = observable({ isStatusDisabled: false });
  const _useConfirmDialog = useConfirmDialog();
  const customerModuleSecurity = useCustomerModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadCustomsDecal();
  }, []);

  /* istanbul ignore next */
  const loadCustomsDecal = () => {
    const request = {
      filterCollection: JSON.stringify([{ registryId: Number(params?.registryId) }]),
    };
    UIStore.setPageLoader(true);
    _registryStore
      .getCustomsDecal(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  const setRequiredRule = (): void => {
    const note: SettingsTypeModel = agGrid.getInstanceValue('note');
    const _rule = 'numeric|min:10000000|max:99999999';
    agGrid.getComponentInstance('customsDecalNumber')?.setRules(Boolean(note) ? _rule : `required|${_rule}`);
  };

  const onInputChange = (params: any, value: string) => {
    if (Utilities.isEqual(params.colDef.field, 'year')) {
      _observable.isStatusDisabled = false;
      agGrid.fetchCellInstance('year').setValue(Utilities.getformattedDate(value, DATE_FORMAT.YEAR_PICKER_FORMAT));
      if (Utilities.isDateInThePast(value, true)) {
        agGrid.fetchCellInstance('status').setValue(new StatusTypeModel({ id: 2, name: 'InActive' }));
        _observable.isStatusDisabled = true;
      }
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (params: any, value: any) => {
    setRequiredRule();
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (id: number): boolean => {
    const decalNumber = Number(agGrid.getCellEditorInstance('customsDecalNumber').getValue());
    if (decalNumber) {
      if (agGrid._isAlreadyExists([ 'customsDecalNumber' ], id)) {
        agGrid.showAlert('Custom decal number should be unique', 'customsDecalAlert');
        return true;
      }
    }
    if (agGrid._isAlreadyExists([ 'year', 'status' ], id)) {
      if (Utilities.isEqual(agGrid.getCellEditorInstance('status').getValue()?.name, 'InActive')) {
        return false;
      }
      agGrid.showAlert('In the same year, only one custom decal number can be active', 'customsDecalAlert');
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertCustomsDecal = (rowIndex): void => {
    const data: CustomsDecalModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _registryStore
      .upsertCustomsDecal(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: CustomsDecalModel) => {
          agGrid._updateTableItem(rowIndex, response);
          _observable.isStatusDisabled = false;
        },
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
          AlertStore.critical(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  /* istanbul ignore next */
  const deleteCustomsDecal = (rowIndex: number) => {
    const data: CustomsDecalModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    ModalStore.close();
    _registryStore
      ?.removeCustomsDecal(data.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ data ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getNoteTypes()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
        const rowData = gridState.gridApi.getRowNode(String(rowIndex))?.data;
        _observable.isStatusDisabled =
          rowData.year < Number(Utilities.getformattedDate(Utilities.getCurrentDate, DATE_FORMAT.YEAR_PICKER_FORMAT));
        break;
      case GRID_ACTIONS.SAVE:
        upsertCustomsDecal(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        _useConfirmDialog.confirmAction(() => deleteCustomsDecal(rowIndex), { isDelete: true });
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        _observable.isStatusDisabled = false;
        break;
    }
  };

  /* istanbul ignore next */
  const detailColumnDefs: ColDef[] = [
    {
      headerName: 'Customs Decal Number',
      field: 'customsDecalNumber',
      filter: false,
      cellEditorParams: {
        getDisableState: ({ data }: RowNode) => Boolean(data?.customsDecalNumber),
        rules: 'required|numeric|min:10000000|max:99999999',
      },
    },
    {
      headerName: 'Year',
      field: 'year',
      cellEditor: 'customTimeEditor',
      filter: false,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Year',
        format: DATE_FORMAT.YEAR_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
        datePickerViews: [ 'year' ],
        allowKeyboardInput: false,
      },
    },
    {
      headerName: 'Note',
      field: 'note',
      cellEditor: 'customAutoComplete',
      filter: false,
      comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Note',
        getAutoCompleteOptions: () => _settingsStore.noteTypes,
        valueGetter: option => option,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: option => option,
        getDisableState: () => _observable.isStatusDisabled,
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
          isActionMenu: false,
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
        hideActionButtons: !(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser),
        showDeleteButton: !customerModuleSecurity.isGlobalUser,
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
        return node.data.customsDecalNumber?.toString().includes(searchHeader.getFilters().searchValue);
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        loadSettingsData();
      },
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
  };

  /* istanbul ignore next */
  const addCustomsDecal = () => {
    setRequiredRule();
    const customsDecal = new CustomsDecalModel({ id: 0, year: null, registry: _registryStore.selectedRegistry });
    agGrid.addNewItems([ customsDecal ], { startEditing: false, colKey: 'customsDecalNumber' });
    gridState.setHasError(true);
  };

  const headerActions = (): ReactNode => (
    <DetailsEditorHeaderSection
      title={title}
      backNavTitle={backNavTitle}
      backNavLink={backNavLink}
      isEditMode={false}
    />
  );

  const rightContent = (): ReactNode => (
    <ViewPermission
      hasPermission={(customerModuleSecurity.isEditable || customerModuleSecurity.isGlobalUser) && useUpsert.isEditable}
    >
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading || gridState.isProcessing}
        onClick={addCustomsDecal}
      >
        Add Customs Decal
      </PrimaryButton>
    </ViewPermission>
  );

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(CUSTOMS_DECAL_FILTER, CUSTOMS_DECAL_FILTER.CUSTOMS_DECAL_NUMBER),
        ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
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

export default inject('registryStore', 'settingsStore')(observer(CustomsDecal));

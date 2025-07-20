import React, { FC, ReactNode, useEffect } from 'react';
import {
  GridOptions,
  ColDef,
  ICellEditorParams,
  ValueFormatterParams,
  GridReadyEvent,
} from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import {
  UIStore,
  Utilities,
  GRID_ACTIONS,
  baseEntitySearchFilters,
  ISelectOption,
  regex,
  rowStyle,
} from '@wings-shared/core';
import { observer, inject } from 'mobx-react';
import { ModelStatusOptions, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { AlertStore } from '@uvgo-shared/alert';
import { ConfirmNavigate, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import {
  PERMIT_FILTERS,
  PermitLeadTimeModel,
  PermitModel,
  PermitSettingsStore,
  PermitStore,
  usePermitModuleSecurity,
} from '../../../Shared';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import PermitEditorActions from '../PermitEditorActions/PermitEditorActions';
import { observable } from 'mobx';

interface Props {
  sidebarStore?: typeof SidebarStore;
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
}

const PermitLeadTimesUpsert: FC<Props> = ({ permitStore, permitSettingsStore }: Props) => {
  const uniqueColumns: string[] = [ 'leadTimeType', 'flightOperationalCategory', 'farType' ];
  const gridState = useGridState();
  const navigate = useNavigate();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<PERMIT_FILTERS, PermitLeadTimeModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent<PermitLeadTimeModel>(params, [], baseEntitySearchFilters);
  const _permitStore = permitStore as PermitStore;
  const _permitSettingsStore = permitSettingsStore as PermitSettingsStore;
  const permitLeadTime = observable({
    flightOperationalCategorySelected: false,
    farTypeSelected: false,
  });
  const permitModuleSecurity = usePermitModuleSecurity();

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    gridState.setGridData([ ..._permitStore.permitDataModel.permitLeadTimes ]);
  }, []);

  const permitTitle = (): string => {
    return _permitStore?.permitDataModel?.permitTitle;
  };

  const isEditable = (): boolean => {
    return (
      Utilities.isEqual(useUpsert.viewMode || '', VIEW_MODE.EDIT) ||
      Utilities.isEqual(useUpsert?.viewMode || '', VIEW_MODE.NEW)
    );
  };

  /* istanbul ignore next */
  const loadPermitLeadTimeData = (): void => {
    UIStore.setPageLoader(true);
    forkJoin([
      _permitSettingsStore.getFlightOperationalCategories(),
      _permitSettingsStore.getTimeLevelsUOM(),
      _permitSettingsStore.getLeadTimeTypes(),
      _permitSettingsStore.getFARTypes(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const upsertPermit = (): void => {
    const updatedModel: PermitModel = new PermitModel({
      ..._permitStore.permitDataModel,
      permitLeadTimes: [ ...agGrid._getAllTableRows() ],
    });
    UIStore.setPageLoader(true);
    _permitStore
      .upsertPermit(updatedModel)
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$)
      )
      .subscribe({
        next: (updatedModel: PermitModel) => {
          _permitStore.setPermitDataModel(updatedModel);
          gridState.setGridData([ ...updatedModel.permitLeadTimes ]);
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
        },
        error: error => AlertStore.critical(error.message),
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
        const model: PermitLeadTimeModel = agGrid._getTableItem(rowIndex);
        const isExists: boolean = agGrid
          ._getAllTableRows()
          .some(
            (rowModel: PermitLeadTimeModel) =>
              agGrid.isRecordExists(uniqueColumns, rowModel, rowIndex) &&
              !Utilities.isEqual(rowModel.tempId, model.tempId)
          );
        if (isExists) {
          agGrid.showAlert(
            'Lead Time Type, Flight Operational Category and FAR Type should be unique.',
            'leadTimeTypeId'
          );
          return;
        }
        gridState.gridApi.stopEditing();
        break;
      case GRID_ACTIONS.DELETE:
        confirmDeletePermitLeadTime(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const confirmDeletePermitLeadTime = (rowIndex: number): void => {
    const model: PermitLeadTimeModel = agGrid._getTableItem(rowIndex);

    if (!Boolean(model.id)) {
      removePermitLeadTime(model);
      return;
    }

    _useConfirmDialog.confirmAction(
      () => {
        removePermitLeadTime(model), ModalStore.close();
      },
      {
        title: 'Confirm Delete',
        message: 'Are you sure you want to remove this Permit Lead Time?',
      }
    );
  };

  /* istanbul ignore next */
  const setInitialData = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    gridState.setIsRowEditing(false);
    agGrid.setColumnVisible('actionRenderer', false);
    gridState.setGridData([ ..._permitStore.permitDataModel.permitLeadTimes ]);
  };

  const onCancel = (): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (gridState.isRowEditing) {
        return _useConfirmDialog.confirmAction(() => {
          setInitialData(), ModalStore.close();
        }, {});
      }
      setInitialData();
      return;
    }
    navigateToPermits();
  };

  /* istanbul ignore next */
  const removePermitLeadTime = (model: PermitLeadTimeModel): void => {
    agGrid._removeTableItems([ model ]);
    const remainingData = gridState.data.filter(({ id }) => model.id !== id);
    gridState.setGridData(remainingData);
  };

  // Called from Ag Grid Component
  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    gridState.setCommonErrorMessage(Utilities.getErrorMessages(gridState.gridApi).toString());
  };

  // Called from Ag Grid Component
  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    switch (colDef.field) {
      case 'flightOperationalCategory':
        agGrid.getComponentInstance('farType').setValue(null);
        permitLeadTime.flightOperationalCategorySelected = !!value;
        if (value) permitLeadTime.farTypeSelected = false;
        break;
      case 'farType':
        agGrid.getComponentInstance('flightOperationalCategory').setValue(null);
        permitLeadTime.farTypeSelected = !!value;
        if (value) permitLeadTime.flightOperationalCategorySelected = false;
        break;
      default:
        break;
    }

    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    gridState.setCommonErrorMessage(Utilities.getErrorMessages(gridState.gridApi).toString());
  };

  const addPermitLeadTime = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    const model: PermitLeadTimeModel = new PermitLeadTimeModel();
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'leadTimeType' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const setDisabled = (data: PermitLeadTimeModel): void => {
    permitLeadTime.flightOperationalCategorySelected = !!data?.flightOperationalCategory?.value;
    permitLeadTime.farTypeSelected = !!data?.farType?.value;
  };

  /* istanbul ignore next */
  // 52762 set TimeLevelUOM rule based on the leadTime and maxLeadTime value
  const isTimeLevelUOMRequired = (): boolean => {
    const leadTimeValue: string = agGrid.getInstanceValue('leadTimeValue');
    const maxLeadTimeValue: string = agGrid.getInstanceValue('maxLeadTimeValue');
    return Boolean(leadTimeValue || maxLeadTimeValue);
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Lead Time Type',
      field: 'leadTimeType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Lead Time Type',
        getAutoCompleteOptions: () => _permitSettingsStore.leadTimeTypes,
      },
    },
    {
      headerName: 'Lead Time',
      field: 'leadTimeValue',
      cellEditor: 'customCellEditor',
      cellEditorParams: {
        rules: `regex:${regex.numeric}`,
      },
    },
    {
      headerName: 'Max Lead Time',
      field: 'maxLeadTimeValue',
      cellEditor: 'customCellEditor',
      cellEditorParams: {
        rules: `regex:${regex.numeric}`,
      },
    },
    {
      headerName: 'Time Level UOM',
      field: 'timeLevelUOM',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: () => isTimeLevelUOMRequired(),
        placeHolder: 'Select Time Level UOM',
        getAutoCompleteOptions: () => _permitSettingsStore.timeLevelsUOM,
      },
    },
    {
      headerName: 'Flight Operational Category',
      field: 'flightOperationalCategory',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: () => !permitLeadTime.farTypeSelected && !permitLeadTime.flightOperationalCategorySelected,
        placeHolder: 'Flight Operational Category',
        getAutoCompleteOptions: () => _permitSettingsStore.flightOperationalCategories,
        getDisableState: () => permitLeadTime.farTypeSelected,
      },
    },
    {
      headerName: 'FAR Type',
      field: 'farType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        getDisableState: () => permitLeadTime.flightOperationalCategorySelected,
        isRequired: () => !permitLeadTime.flightOperationalCategorySelected && !permitLeadTime.farTypeSelected,
        placeHolder: 'FAR Type',
        getAutoCompleteOptions: () => _permitSettingsStore.farTypes,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'statusRenderer',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
      },
    },
    {
      ...agGrid.actionColumn({
        maxWidth: 150,
        minWidth: 130,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs: columnDefs,
      isEditable: isEditable(),
      gridActionProps: {
        hideActionButtons: !isEditable(),
        showDeleteButton: true,
        getTooltip: () => gridState.commonErrorMessage,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      getRowStyle: () => rowStyle(gridState.isRowEditing, isEditable()),
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', Boolean(isEditable()));
      },
      onRowEditingStarted: event => {
        agGrid.onRowEditingStarted(event);
        loadPermitLeadTimeData();
        setDisabled(event?.data);
      },
    };
  };

  /* istanbul ignore next */
  const navigateToPermits = (): void => {
    navigate('/permits');
  };

  const isDetailView = (): boolean => {
    return Utilities.isEqual(useUpsert.viewMode || '', VIEW_MODE.DETAILS);
  };

  const headerActions = (): ReactNode => {
    return (
      <PermitEditorActions
        hasError={gridState.isRowEditing || UIStore.pageLoading}
        isDetailsView={isDetailView()}
        onCancelClick={() => onCancel()}
        onUpsert={() => upsertPermit()}
        onSetViewMode={(mode: VIEW_MODE) => useUpsert.setViewMode(mode)}
        title={permitTitle()}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={!isDetailView()}>
        <AgGridMasterDetails
          addButtonTitle="Add Permit Lead Time"
          onAddButtonClick={() => addPermitLeadTime()}
          hasAddPermission={permitModuleSecurity.isEditable}
          disabled={gridState.isRowEditing || UIStore.pageLoading || !isEditable()}
          key={`master-details-${isEditable()}`}
          resetHeight={true}
        >
          <CustomAgGridReact
            rowData={gridState.data}
            gridOptions={gridOptions()}
            isRowEditing={gridState.isRowEditing}
          />
        </AgGridMasterDetails>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('permitStore', 'permitSettingsStore', 'sidebarStore')(observer(PermitLeadTimesUpsert));

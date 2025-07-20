import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import {
  PERMIT_FILTERS,
  PermitSettingsStore,
  PermitStore,
  PermitValidityModel,
  usePermitModuleSecurity,
} from '../../../Shared';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ICellEditorParams, RowEditingStartedEvent, GridReadyEvent } from 'ag-grid-community';
import { useNavigate, useParams } from 'react-router';
import {
  GRID_ACTIONS,
  ISelectOption,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
  regex,
  rowStyle,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { Logger } from '@wings-shared/security';
import PermitEditorActions from '../PermitEditorActions/PermitEditorActions';
import { AlertStore } from '@uvgo-shared/alert';
import { useStyles } from '../PermitUpsert/PermitUpsert.styles';

interface Props {
  sidebarStore?: typeof SidebarStore;
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
}

const PermitValidity: FC<Props> = ({ permitSettingsStore, permitStore, sidebarStore }) => {
  const gridState = useGridState();
  const navigate = useNavigate();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<PERMIT_FILTERS, PermitValidityModel>([], gridState);
  const alertMessageId: string = 'PermitValidityAlertMessage';
  const _permitStore = permitStore as PermitStore;
  const _permitSettingsStore = permitSettingsStore as PermitSettingsStore;
  const _useConfirmDialog = useConfirmDialog();
  const useUpsert = useBaseUpsertComponent<PermitValidityModel>(params, [], baseEntitySearchFilters);
  const classes = useStyles();
  const permitModuleSecurity = usePermitModuleSecurity();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    const permitId = params?.permitId;
    UIStore.setPageLoader(true);
    _permitSettingsStore
      ?.getPermitValidity(Number(permitId), true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(permitValidity => gridState.setGridData(permitValidity));
  };

  /* istanbul ignore next */
  const loadFlightOperationalCategories = (): void => {
    UIStore.setPageLoader(true);
    _permitSettingsStore
      .getFlightOperationalCategories()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadPresetValidities = (): void => {
    UIStore.setPageLoader(true);
    _permitSettingsStore
      .getPresetValidities()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const isEditable = (): boolean => {
    return (
      Utilities.isEqual(useUpsert?.viewMode as any, VIEW_MODE.EDIT) ||
      Utilities.isEqual(useUpsert.viewMode as any, VIEW_MODE.NEW)
    );
  };

  const permitTitle = (): string => {
    return _permitStore?.permitDataModel?.permitTitle || '';
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
        upsertPermitValidity(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const confirmRemoveRecord = (rowIndex: number): void => {
    const model: PermitValidityModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deletePermitValidity(model);
      return;
    }

    _useConfirmDialog.confirmAction(() => deletePermitValidity(model), {
      isDelete: true,
    });
  };

  /* istanbul ignore next */
  const deletePermitValidity = (model: PermitValidityModel): void => {
    ModalStore.close();
    UIStore.setPageLoader(true);
    _permitSettingsStore
      .removePermitValidity(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: string) => {
          agGrid._removeTableItems([ model ]);
          gridState.setGridData(agGrid._getAllTableRows());
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const onCancel = (): void => {
    const viewMode = params?.viewMode?.toUpperCase();
    if (viewMode === VIEW_MODE.DETAILS) {
      if (gridState.isRowEditing) {
        return ModalStore.open(
          <ConfirmDialog
            title="Confirm Cancellation"
            message="Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?"
            yesButton="Yes"
            onNoClick={() => ModalStore.close()}
            onYesClick={() => {
              ModalStore.close();
              onCancelClick();
            }}
          />
        );
      }
      onCancelClick();
      return;
    }
    navigate('/permits');
  };

  const onCancelClick = (): void => {
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    gridState.setIsRowEditing(false);
    agGrid.setColumnVisible('actionRenderer', false);
  };

  const isDetailView = (): boolean => {
    return Utilities.isEqual(useUpsert?.viewMode as any, VIEW_MODE.DETAILS);
  };

  // Called from Ag Grid Component
  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    const { field } = colDef;
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    gridState.setCommonErrorMessage(Utilities.getErrorMessages(gridState.gridApi).toString());
    _checkToleranceValidity(field || '', value);
  };

  // Called from Ag Grid Component
  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    gridState.setCommonErrorMessage(Utilities.getErrorMessages(gridState.gridApi).toString());
  };

  const addPermitValidity = (): void => {
    const permitId = Number(params?.permitId);
    agGrid.setColumnVisible('actionRenderer', true);
    const model: PermitValidityModel = new PermitValidityModel({ id: 0, permitId });
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'toleranceMinus' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const upsertPermitValidity = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _permitSettingsStore
      .upsertPermitValidity(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: PermitValidityModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  const isAlreadyExists = (id: number): boolean => {
    const isAlreadyExist = agGrid._isAlreadyExists([ 'flightOperationalCategory' ], id);
    if (isAlreadyExist) {
      agGrid.showAlert('Permit Validity is already available for selected Flight Operational Category', alertMessageId);
    }
    return isAlreadyExist;
  };

  /* istanbul ignore next */
  const _checkToleranceValidity = (field: string, value: string) => {
    if (
      (Utilities.isEqual(field, 'toleranceMinus') || Utilities.isEqual(field, 'tolerancePlus')) &&
      !regex.daysHoursMins.test(value)
    ) {
      agGrid.getComponentInstance(field).setCustomError('Please enter valid input (DD:HHH:MM)');
      gridState.setHasError(true);
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Flight Operational Category',
      field: 'flightOperationalCategory',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Flight Operational Category',
        getAutoCompleteOptions: () => _permitSettingsStore.flightOperationalCategories,
      },
    },
    {
      headerName: 'Preset Validity',
      field: 'presetValidity',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        placeHolder: 'Preset Validity',
        getAutoCompleteOptions: () => _permitSettingsStore.presetValidities,
      },
    },
    {
      headerName: 'Tolerance Minus',
      field: 'toleranceMinus',
      cellEditorParams: {
        placeHolder: 'DD:HHH:MM',
        isRequired: true,
        inputRegex: regex.daysHoursMinsInputMask,
      },
    },
    {
      headerName: 'Tolerance Plus',
      field: 'tolerancePlus',
      cellEditorParams: {
        placeHolder: 'DD:HHH:MM',
        isRequired: true,
        inputRegex: regex.daysHoursMinsInputMask,
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
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(event);
        loadFlightOperationalCategories();
        loadPresetValidities();
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <PermitEditorActions
        hasError={UIStore.pageLoading}
        isDetailsView={isDetailView()}
        hideSaveButton={true}
        onCancelClick={() => onCancel()}
        onUpsert={() => null}
        onSetViewMode={(mode: VIEW_MODE) => useUpsert.setViewMode(mode)}
        title={permitTitle()}
        isRowEditing={gridState.isRowEditing}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={isEditable()}
        classes={{ container: classes.editorWrapperContainer, headerActionsEditMode: classes.headerActionsEditMode }}
      >
        <AgGridMasterDetails
          addButtonTitle="Add Validity"
          onAddButtonClick={() => addPermitValidity()}
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

export default inject('permitSettingsStore', 'permitStore', 'sidebarStore')(observer(PermitValidity));

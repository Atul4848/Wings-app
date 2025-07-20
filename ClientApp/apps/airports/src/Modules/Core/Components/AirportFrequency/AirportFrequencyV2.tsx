import React, { FC, ReactNode, useEffect } from 'react';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  ICellEditorParams,
  RowEditingStartedEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import {
  AirportFrequencyModel,
  AirportStore,
  AirportSettingsStore,
  AirportModel,
  useAirportModuleSecurity,
  updateAirportSidebarOptions,
  airportBasePath,
} from '../../../Shared';
import { AxiosError } from 'axios';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useParams } from 'react-router';
import { useStylesV2 } from './AirportFrequency.styles';
import { forkJoin } from 'rxjs';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Logger } from '@wings-shared/security';
import { Utilities, regex, UIStore, ISelectOption, ViewPermission, GRID_ACTIONS, cellStyle } from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import AssociatedRunways from './AssociatedRunways';
import { useUnsubscribe, useConfirmDialog } from '@wings-shared/hooks';
import { observable } from 'mobx';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportFrequency: FC<Props> = ({ airportStore, airportSettingsStore, sidebarStore }: Props) => {
  const alertMessageId: string = 'FrequencyAlertMessage';
  const localStates = observable({ hasFrequencyValue: false, hasPhoneValue: false, isChildRowEditing: false });
  const params = useParams();
  const classes = useStylesV2();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent(params, {}, {});
  const gridState = useGridState();
  const agGrid = useAgGrid<[], AirportFrequencyModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const _selectedAirport = airportStore?.selectedAirport as AirportModel;
  const airportModuleSecurity = useAirportModuleSecurity();
  
  const _disabled =
    localStates.isChildRowEditing ||
    gridState.isRowEditing ||
    UIStore.pageLoading ||
    !airportModuleSecurity.isEditable ||
    !_selectedAirport?.isActive;

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, viewMode } = params;
    useUpsert.setViewMode((viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    sidebarStore?.setNavLinks(
      updateAirportSidebarOptions('Airport Frequencies', !Boolean(airportId)),
      airportBasePath(airportId, icao, viewMode)
    );
    gridState.setGridData(_selectedAirport.airportFrequencies);
    gridState.isRowEditingStarted$.pipe(debounceTime(300), takeUntil(unsubscribe.destroy$)).subscribe(() => {
      setRequiredRules();
      gridState.setHasError(true);
    });
  }, []);

  /* istanbul ignore next */
  const loadSettingsData = (): void => {
    UIStore.setPageLoader(true);
    forkJoin([ _airportSettingsStore.loadFrequencyTypes(), _airportSettingsStore.loadSectors() ])
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
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertAirportFrequency(rowIndex);
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
    const model: AirportFrequencyModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteAirportFrequency(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteAirportFrequency(model), { isDelete: true });
  };

  /* istanbul ignore next */
  const deleteAirportFrequency = (model: AirportFrequencyModel): void => {
    ModalStore.close();
    UIStore.setPageLoader(true);
    airportStore
      ?.removeAirportFrequency(model)
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

  // Called from Ag Grid Component
  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    setRequiredRules();
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    gridState.setCommonErrorMessage(Utilities.getErrorMessages(gridState.gridApi).toString());
  };

  // Called from Ag Grid Component
  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    gridState.setCommonErrorMessage(Utilities.getErrorMessages(gridState.gridApi).toString());
  };

  const addAirportFrequency = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    const model: AirportFrequencyModel = new AirportFrequencyModel({ id: 0, airportId: Number(params.airportId) });
    agGrid.addNewItems([ model ], { startEditing: false, colKey: 'frequencyType' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const upsertAirportFrequency = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    airportStore
      ?.upsertAirportFrequency(model, _selectedAirport.runways)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AirportFrequencyModel) => {
          agGrid._updateTableItem(rowIndex, response);
          setSelectedAirport(response, !Boolean(model.id));
        },
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  const setSelectedAirport = (updatedFrequency: AirportFrequencyModel, isNew: boolean): void => {
    const { airportFrequencies, ...rest } = _selectedAirport;
    const frequencies: AirportFrequencyModel[] = isNew
      ? [ ...airportFrequencies, updatedFrequency ]
      : airportFrequencies.map(a => (a.id === updatedFrequency.id ? updatedFrequency : a));
    airportStore?.setSelectedAirport(new AirportModel({ ...rest, airportFrequencies: frequencies }));
  };

  const setRequiredRules = (): void => {
    localStates.hasFrequencyValue = Boolean(agGrid.getInstanceValue('frequency'));
    localStates.hasPhoneValue = Boolean(agGrid.getInstanceValue('phone'));
    agGrid
      .getComponentInstance('frequency')
      ?.setRules(!localStates.hasPhoneValue ? 'required|string|max:25' : 'string|max:25');
    agGrid
      .getComponentInstance('phone')
      ?.setRules(!localStates.hasFrequencyValue ? 'required|string|max:20' : 'string|max:20');
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: AirportFrequencyModel): boolean => {
    const frequencyTypeId = agGrid.getCellEditorInstance('frequencyType').getValue()?.id;
    const sectorId = agGrid.getCellEditorInstance('sector').getValue()?.id;
    const frequency = agGrid.getCellEditorInstance('frequency').getValue();

    const isExists = gridState.data
      .filter(x => x.id !== data.id)
      .some(x => {
        if (Utilities.isEqual(x.frequencyType?.id, frequencyTypeId)) {
          const isSectorMatch = sectorId ? Utilities.isEqual(x.sector?.id, sectorId) : !Boolean(x.sector?.id);
          if (isSectorMatch) {
            agGrid.showAlert('Frequency Type and Sector should be unique.', alertMessageId);
            return true;
          }
          // implemented as per 94280
          const isFrequencyMatch = frequency ? Utilities.isEqual(x.frequency, frequency) : !Boolean(x.frequency);
          if (isFrequencyMatch) {
            agGrid.showAlert('Frequency Type and Frequency should be unique.', alertMessageId);
            return true;
          }
        }

        return false;
      });
    return isExists;
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Frequency Type',
      field: 'frequencyType',
      cellRenderer: 'agGroupCellRenderer',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Frequency Type',
        getAutoCompleteOptions: () => _airportSettingsStore.frequencyTypes,
      },
    },
    {
      headerName: 'Sector',
      field: 'sector',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        placeHolder: 'Sector',
        getAutoCompleteOptions: () => _airportSettingsStore.sectors,
      },
    },
    {
      headerName: 'Frequency',
      field: 'frequency',
      valueFormatter: ({ value }: ValueFormatterParams) => (!gridState.isRowEditing && value ? `${value} MHz` : value),
      cellEditorParams: {
        placeHolder: 'Frequency',
      },
    },
    {
      headerName: 'Phone',
      field: 'phone',
      cellEditorParams: {
        placeHolder: 'Phone',
        validators: ({ field }) => {
          return [
            Boolean(field.value) ? regex.phoneNumberWithHyphen.test(field.value) : true,
            'Please enter valid Phone Number',
          ];
        },
      },
    },
    {
      headerName: 'Comments',
      field: 'comments',
      cellEditorParams: {
        placeHolder: 'Comments',
        rules: 'string|max:100',
      },
    },
    {
      headerName: 'FAA Comments',
      field: 'faaComments',
      cellEditorParams: {
        placeHolder: 'FAA Comments',
        rules: 'string|max:100',
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      editable: false,
      cellRenderer: 'statusRenderer',
      comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || value?.name || '',
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 150,
      minWidth: 130,
      suppressSizeToFit: true,
      suppressNavigable: true,
      suppressMenu: true,
      cellStyle: { ...cellStyle() },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: airportModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: false,
        hideActionButtons: !airportModuleSecurity.isEditable,
        getTooltip: () => gridState.commonErrorMessage,
        getDisabledState: () => gridState.hasError,
        getVisibleState: () => !localStates.isChildRowEditing,
        onAction: gridActions,
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      detailCellRenderer: 'customDetailCellRenderer',
      suppressScrollOnNewData: true,
      detailCellRendererParams: {
        isMasterDetails: true,
        isEditable: airportModuleSecurity.isEditable,
        isParentRowEditing: () => gridState.isRowEditing,
        airportStore,
        onChildRowEditing: (isChildRowEditing: boolean) => {
          localStates.isChildRowEditing = isChildRowEditing;
        },
        onRunwayUpdate: (rowIndex, updatedData) => {
          agGrid._updateTableItem(rowIndex, updatedData);
          setSelectedAirport(updatedData, !Boolean(updatedData.id));
          gridState.gridApi.redrawRows();
        },
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customDetailCellRenderer: AssociatedRunways,
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', airportModuleSecurity.isEditable && _selectedAirport?.isActive);
      },
      onRowEditingStarted: (event: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(event);
        loadSettingsData();
      },
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport?.title}
        isEditMode={false}
        backNavLink="/airports"
        backNavTitle="Airports"
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <div className={classes.buttonContainer}>
        <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
          <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={_disabled} onClick={addAirportFrequency}>
            Add Airport Frequency
          </PrimaryButton>
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} isRowEditing={gridState.isRowEditing} />
      </div>
    </DetailsEditorWrapper>
  );
};

export default inject('airportStore', 'airportSettingsStore', 'sidebarStore')(observer(AirportFrequency));

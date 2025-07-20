import AddIcon from '@material-ui/icons/AddCircleOutline';
import { GRID_ACTIONS, ISelectOption, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams, ICellEditorParams, GridReadyEvent } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect, useMemo } from 'react';
import {
  AirportModel,
  AirportSettingsStore,
  AirportStore,
  CustomsLeadTimeModel,
  useAirportModuleSecurity,
} from '../../../../../Shared';
import { useStyles } from './LeadTimesGrid.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useConfirmDialog } from '@wings-shared/hooks';
import { BasePermitStore, ModelStatusOptions } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  isEditable: boolean;
  leadTimes: CustomsLeadTimeModel[];
  onDataUpdate: (gridName: string, gridData: CustomsLeadTimeModel[]) => void;
  isRowEditing: (isEditing: boolean) => void;
}

const LeadTimesGrid: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const classes = useStyles();
  const _useConfirmDialog = useConfirmDialog();
  const agGrid = useAgGrid<'', CustomsLeadTimeModel>([], gridState);
  const _airportStore = props.airportStore as AirportStore;
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const _permitStore = useMemo(() => new BasePermitStore(), []);
  const _disabled = gridState.isRowEditing || UIStore.pageLoading || !_selectedAirport?.isActive || !props.isEditable;
  const { isGRSUser, isEditable } = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
    gridState.setGridData(props.leadTimes);
  }, [ props.leadTimes, props.isEditable ]);

  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const addLeadTime = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new CustomsLeadTimeModel({ id: 0 }) ], { startEditing: false, colKey: 'customsLeadTimeType' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const isAlreadyExists = (rowIndex: number) => {
    const tableItem = agGrid._getTableItem(rowIndex);
    const editorInstance = gridState.gridApi.getCellEditorInstances({
      columns: [ 'customsLeadTimeType', 'flightOperationalCategory', 'leadTime' ],
    });
    const customsLeadTimeType = editorInstance[0]?.getValue()?.label;
    const leadTime = editorInstance[1]?.getValue();
    const flightOPerationalCategory = editorInstance[2]?.getValue()?.label;
    const isDuplicateData = gridState.data?.some(
      (lead: CustomsLeadTimeModel) =>
        Utilities.isEqual(lead.customsLeadTimeType.label, customsLeadTimeType) &&
        Utilities.isEqual(lead.flightOperationalCategory.label, flightOPerationalCategory) &&
        Utilities.isEqual(lead.leadTime, Number(leadTime)) &&
        lead.id !== tableItem.id
    );
    if (isDuplicateData) {
      agGrid.showAlert(
        'Combination of Lead Time Type, Lead Time and Flight Operational Category should be unique',
        'customsleadTime'
      );
      return true;
    }
    return false;
  };

  const updateTableData = (rowindex?: number): void => {
    if (isAlreadyExists(rowindex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    props.onDataUpdate('customsLeadTimes', gridState.data);
    props.isRowEditing(false);
  };

  const deleteLeadTime = (model: CustomsLeadTimeModel): void => {
    agGrid._removeTableItems([ model ]);
    updateTableData();
    ModalStore.close();
  };

  const confirmRemoveLeadTime = (rowIndex: number): void => {
    const model: CustomsLeadTimeModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteLeadTime(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteLeadTime(model), { isDelete: true });
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
        updateTableData(rowIndex);
        props.isRowEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveLeadTime(rowIndex);
        props.isRowEditing(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        props.isRowEditing(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Lead Time Type',
      field: 'customsLeadTimeType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Lead Time Type',
        getAutoCompleteOptions: () => _airportSettingStore.leadTimeType,
      },
    },
    {
      headerName: 'Lead Time',
      field: 'leadTime',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|digits_between:1,3',
      },
    },
    {
      headerName: 'Pre-Clearance',
      field: 'preClearance',
      cellEditor: 'checkBoxRenderer',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
    },
    {
      headerName: 'Flight Operational Category',
      field: 'flightOperationalCategory',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Flight Operational Category',
        getAutoCompleteOptions: () => _permitStore.flightOperationalCategories,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
      },
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
            },
            { title: 'Delete', action: GRID_ACTIONS.DELETE },
          ],
          onAction: gridActions,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: isEditable || isGRSUser,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        props.isRowEditing(true);
        _permitStore?.getFlightOperationalCategories().subscribe();
        _airportSettingStore?.loadLeadTimeType().subscribe();
      },
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
    };
  };

  return (
    <>
      <div className={classes.addButtonContainer}>
        <ViewPermission hasPermission={props.isEditable}>
          <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={_disabled} onClick={addLeadTime}>
            Add Lead Time
          </PrimaryButton>
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing}
          hidePagination={true}
        />
      </div>
    </>
  );
};

export default inject('airportStore', 'airportSettingsStore')(observer(LeadTimesGrid));

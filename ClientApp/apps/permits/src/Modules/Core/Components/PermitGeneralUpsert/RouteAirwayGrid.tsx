import React, { FC, useEffect } from 'react';
import { ICellRendererParams, GridOptions, ColDef, ICellEditor, RowEditingStartedEvent } from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { PermitStore, ROUTE_AIRWAY_FILTERS, RouteExtensionModel, usePermitModuleSecurity } from '../../../Shared';
import { UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { observer, inject } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';
import { useStyles } from '../PermitUpsert/PermitUpsert.styles';
interface Props extends Partial<ICellRendererParams> {
  permitStore?: PermitStore;
  isEditable?: boolean;
  onRowEditingChange: (isRowEditing: boolean) => void;
  permitRouteAirwayExtensions: RouteExtensionModel[];
  onDataSave: (response: RouteExtensionModel[]) => void;
}

const RouteAirwayGrid: FC<Props> = ({
  isEditable,
  permitStore,
  permitRouteAirwayExtensions,
  onDataSave,
  onRowEditingChange,
}) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<ROUTE_AIRWAY_FILTERS, RouteExtensionModel>([], gridState);
  const _permitStore = permitStore as PermitStore;
  const permitModuleSecurity = usePermitModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    loadInitialData();
  }, [ _permitStore.permitDataModel, permitRouteAirwayExtensions ]);

  const loadInitialData = () => {
    gridState.setGridData(permitRouteAirwayExtensions);
  };

  const addRoute = (): void => {
    const routeModel = new RouteExtensionModel({ id: 0 });
    const colKey: string = 'originWaypoint';
    agGrid.addNewItems([ routeModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  const onInputChange = (): void => {
    setRequiredRules();
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const fetchCellValues = () => {
    const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
      columns: [ 'originWaypoint', 'airway', 'destinationWaypoint' ],
    });

    const originPointValue = editorInstance[0].getValue();
    const airwayValue = editorInstance[1].getValue();
    const destinationPointValue = editorInstance[2].getValue();

    return { originPointValue, airwayValue, destinationPointValue };
  };

  const setRequiredRules = (): void => {
    const { originPointValue, airwayValue, destinationPointValue } = fetchCellValues();

    const hasOriginPointValue = Boolean(originPointValue);
    const hasAirwayValue = Boolean(airwayValue);
    const hasDestinationPointValue = Boolean(destinationPointValue);

    agGrid
      .fetchCellInstance('originWaypoint')
      ?.setRules(!hasAirwayValue && !hasDestinationPointValue ? 'required|string|between:3,12' : 'string|between:3,12');

    agGrid
      .fetchCellInstance('airway')
      ?.setRules(
        !hasOriginPointValue && !hasDestinationPointValue ? 'required|string|between:3,12' : 'string|between:3,12'
      );

    agGrid
      .fetchCellInstance('destinationWaypoint')
      ?.setRules(!hasOriginPointValue && !hasAirwayValue ? 'required|string|between:3,12' : 'string|between:3,12');
  };

  /* istanbul ignore next */
  const isAlreadyExists = (data: RouteExtensionModel): boolean => {
    const { originPointValue, airwayValue, destinationPointValue } = fetchCellValues();

    const isDuplicateData = gridState.data.some(
      a =>
        a.originWaypoint?.toLowerCase() === originPointValue?.toLowerCase() &&
        a.airway?.toLowerCase() === airwayValue?.toLowerCase() &&
        a.destinationWaypoint?.toLowerCase() === destinationPointValue?.toLowerCase() &&
        data?.id !== a.id
    );

    if (isDuplicateData) {
      AlertStore.critical('Route Portion should be unique');
      return true;
    }

    return false;
  };

  /* istanbul ignore next */
  const updateTableData = (): void => {
    const data = agGrid._getAllTableRows().map(
      extension =>
        new RouteExtensionModel({
          ...extension,
          id: extension.id || Utilities.getTempId(true),
          permitId: _permitStore.permitDataModel.id,
        })
    );
    gridState.setGridData(data);
    onDataSave(gridState.data);
  };

  /* istanbul ignore next */
  const deleteRoute = (model: RouteExtensionModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  /* istanbul ignore next */
  const upsertRoute = (rowIndex): void => {
    const data: RouteExtensionModel = agGrid._getTableItem(rowIndex);
    setRequiredRules();
    if (isAlreadyExists(data)) {
      return;
    }

    gridState.gridApi.stopEditing();
    updateTableData();
  };

  const confirmRemoveRoute = (rowIndex: number): void => {
    const model: RouteExtensionModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteRoute(model);
      return;
    }

    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Route?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => deleteRoute(model)}
      />
    );
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
        upsertRoute(rowIndex);
        onRowEditingChange(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRoute(rowIndex);
        onRowEditingChange(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        onRowEditingChange(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Waypoint',
      field: 'originWaypoint',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'between:3,12',
      },
    },
    {
      headerName: 'Airway',
      field: 'airway',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'between:3,12',
      },
    },
    {
      headerName: 'Waypoint',
      field: 'destinationWaypoint',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'between:3,12',
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            { title: 'Edit', isHidden: !isEditable, action: GRID_ACTIONS.EDIT },
            { title: 'Delete', isHidden: !isEditable, action: GRID_ACTIONS.DELETE },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        hideActionButtons: !isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      pagination: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(params);
        onRowEditingChange(true);
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
    };
  };
  const classes = useStyles();
  return (
    <div className={classes.gridRoot}>
      <AgGridMasterDetails
        addButtonTitle="Add Route Portion"
        onAddButtonClick={() => addRoute()}
        hasAddPermission={permitModuleSecurity.isEditable}
        disabled={!isEditable || gridState.hasError || gridState.isRowEditing || UIStore.pageLoading}
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} isRowEditing={gridState.isRowEditing} />
      </AgGridMasterDetails>
    </div>
  );
};

export default inject('permitStore')(observer(RouteAirwayGrid));

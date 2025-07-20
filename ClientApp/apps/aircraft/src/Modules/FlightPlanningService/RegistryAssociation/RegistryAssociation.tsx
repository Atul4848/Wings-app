import React, { FC, RefObject, useEffect } from 'react';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import classNames from 'classnames';
import { VIEW_MODE } from '@wings/shared';
import { AgGridMasterDetails, useAgGrid, CustomAgGridReact, useGridState } from '@wings-shared/custom-ag-grid';
import { AlertStore } from '@uvgo-shared/alert';
import { FlightPlanningServiceStore, SettingsStore } from '../../Shared/Stores';
import { Theme } from '@material-ui/core';
import {
  REGISTRY_ASSOCIATION_FILTERS,
  RegistryAssociationModel,
  RegistryAssociationDetailModel,
  useAircraftModuleSecurity,
} from '../../Shared';
import { observer } from 'mobx-react';
import { useStyles } from './RegistryAssociation.styles';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { GridPagination, IAPIGridRequest, UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import RegistryAssociationDetails from './RegistryAssociationDetails';

interface Props extends ICellRendererParams {
  settingsStore?: SettingsStore;
  flightPlanningServiceStore: FlightPlanningServiceStore;
  theme?: Theme;
  isMasterDetails?: boolean; // Showing in grid as child entity for regions screen
  isEditable?: boolean;
  isParentRowEditing?: () => boolean;
  onRowEditingChange?: (isRowEditing: boolean) => void;
  ref?: RefObject<any>;
}

const RegistryAssociation: FC<Props> = ({
  flightPlanningServiceStore,
  settingsStore,
  isMasterDetails,
  isEditable,
  isParentRowEditing,
  data,
}) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<REGISTRY_ASSOCIATION_FILTERS, RegistryAssociationModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    gridState.setPagination(new GridPagination());
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([{ customersWithNonStandardRunwayAnalysisId: data.id }]),
    };
    UIStore.setPageLoader(true);
    flightPlanningServiceStore
      .getRegistryAssociation(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        agGrid.reloadColumnState();
      });
  };

  const upsertGrid = (
    index: number,
    model: RegistryAssociationDetailModel,
    registryAssociationModel: RegistryAssociationModel
  ) => {
    const modelNew = new RegistryAssociationModel({
      ...registryAssociationModel,
      customersWithNonStandardRunwayAnalysisRegistryOption: new RegistryAssociationDetailModel({
        ...model,
      }),
    });
    agGrid._updateTableItem(index, modelNew);
  };

  const showRegistryDetailScenarioDialog = (
    viewMode: VIEW_MODE,
    rowIndex: number,
    registryAssociationModel: RegistryAssociationModel
  ): void => {
    ModalStore.open(
      <RegistryAssociationDetails
        flightPlanningServiceModel={data}
        viewMode={viewMode}
        registryAssociationModel={registryAssociationModel}
        onUpsertDetail={(model: RegistryAssociationDetailModel) =>
          upsertGrid(rowIndex, model, registryAssociationModel)
        }
      />
    );
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        showRegistryDetailScenarioDialog(VIEW_MODE.EDIT, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.DETAILS:
        showRegistryDetailScenarioDialog(VIEW_MODE.DETAILS, rowIndex, agGrid._getTableItem(rowIndex));
        break;
      case GRID_ACTIONS.SAVE:
        upsertRegistryAssociation(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        deleteRecord(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const deleteRecord = (rowIndex: number): void => {
    const data: RegistryAssociationModel = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    flightPlanningServiceStore
      .removeRegistryAssociation(data.id)
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
  const upsertRegistryAssociation = (rowIndex: number): void => {
    const rowData: RegistryAssociationModel = agGrid._getTableItem(rowIndex);
    rowData.customersWithNonStandardRunwayAnalysisId = data.customersWithNonStandardRunwayAnalysisId || data.id;
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    flightPlanningServiceStore
      .upsertRegistryAssociation(rowData.serialize())
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: (response: RegistryAssociationModel) => {
          agGrid._updateTableItem(rowIndex, response);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  /* istanbul ignore next */
  const addRegistryAssociation = (): void => {
    const associatedRegionModel = new RegistryAssociationModel({ id: 0 });
    const colKey: string = 'registry';
    agGrid.addNewItems([ associatedRegionModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Registry',
      field: 'registry',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|between:1,50',
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            { title: 'Edit', isHidden: !isEditable, action: GRID_ACTIONS.EDIT },
            { title: 'Details', action: GRID_ACTIONS.DETAILS },
            { title: 'Delete', isHidden: !isEditable, action: GRID_ACTIONS.DELETE },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)) },
      columnDefs,
      isEditable: true,
      gridActionProps: {
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
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
    };
  };

  return (
    <div className={classNames({ [classes.root]: true, [classes.masterDetails]: !isMasterDetails })}>
      <AgGridMasterDetails
        addButtonTitle="Add Registry"
        onAddButtonClick={() => addRegistryAssociation()}
        hasAddPermission={aircraftModuleSecurity.isEditable}
        disabled={!isEditable || UIStore.pageLoading || gridState.hasError || gridState.isRowEditing}
        key={`master-details-${isEditable}-${isParentRowEditing}`}
      >
        <CustomAgGridReact
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing}
          paginationData={gridState.pagination}
          onPaginationChange={loadInitialData}
          classes={{ customHeight: classes.customHeight }}
        />
      </AgGridMasterDetails>
    </div>
  );
};

export default observer(RegistryAssociation);

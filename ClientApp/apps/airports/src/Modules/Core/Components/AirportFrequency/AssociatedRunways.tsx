import React, { FC, useEffect } from 'react';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { useAgGrid, CustomAgGridReact, useGridState, AgGridMasterDetails } from '@wings-shared/custom-ag-grid';
import { observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { UIStore, GRID_ACTIONS, Utilities } from '@wings-shared/core';
import {
  AssociatedRunwayModel,
  AirportStore,
  AirportRunwayModel,
  RunwayDetailModel,
  AirportFrequencyModel,
  useAirportModuleSecurity,
} from '../../../Shared';
import { useStyles } from './AirportFrequency.styles';
import classNames from 'classnames';
import { AxiosError } from 'axios';
import { AlertStore, ALERT_TYPES } from '@uvgo-shared/alert';
import { observable } from 'mobx';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ConfirmDialog } from '@wings-shared/layout';

interface Props extends Partial<ICellRendererParams> {
  airportStore?: AirportStore;
  isMasterDetails?: boolean; // Showing in grid as child entity for regions screen
  isEditable?: boolean;
  isParentRowEditing: () => boolean;
  onChildRowEditing: (isRowEditing: boolean) => boolean;
  onRunwayUpdate: (frequencyRowIndex: number, frequency: AirportFrequencyModel) => void;
}

const AssociatedRunways: FC<Props> = ({ airportStore, isMasterDetails, isEditable, ...props }) => {
  const defaultEditKey: string = 'runway';
  const gridState = useGridState();
  const agGrid = useAgGrid<[], AssociatedRunwayModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const selectedRunway = observable({ runwayTypes: [] as RunwayDetailModel[] });
  const selectedAirport = airportStore?.selectedAirport;
  const airportModuleSecurity = useAirportModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    gridState.setGridData(props.data?.airportFrequencyRunways);
  }, []);

  const addAssociatedRunway = (): void => {
    const dataModel = new AssociatedRunwayModel({ id: 0, airportFrequencyId: props.data.id });
    agGrid.addNewItems([ dataModel ], { startEditing: false, colKey: defaultEditKey });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const upsertAssociatedRunway = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const rowData = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    airportStore
      ?.upsertAssociatedRunway(rowData)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          // Update frequency data on Parent grid
          // props.rowIndex is frequencyRowIndex from parent component
          const frequencyModel = props.data;
          frequencyModel.airportFrequencyRunways = AirportFrequencyModel.deserialize(
            response,
            selectedAirport?.runways
          ).airportFrequencyRunways;
          props.onRunwayUpdate(props.rowIndex, frequencyModel);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const deleteRecord = (rowIndex: number): void => {
    const data: AssociatedRunwayModel = agGrid._getTableItem(rowIndex);
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Delete"
        message="Are you sure you want to remove this Runway?"
        yesButton="Delete"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          UIStore.setPageLoader(true);
          airportStore
            ?.removeAssociatedRunway(data.serialize())
            .pipe(
              takeUntil(unsubscribe.destroy$),
              finalize(() => UIStore.setPageLoader(false))
            )
            .subscribe({
              next: () => {
                agGrid._removeTableItems([ data ]);
                gridState.setGridData(agGrid._getAllTableRows());
                const frequencyModel = props.data;
                frequencyModel.airportFrequencyRunways = frequencyModel.airportFrequencyRunways.filter(
                  x => x.id !== data.id
                );
                // Update frequency data on Parent grid
                props.onRunwayUpdate(props.rowIndex, frequencyModel);
              },
              error: (error: AxiosError) => AlertStore.critical(error.message),
            });
        }}
      />
    );
  };

  const onDropDownChange = ({ colDef, data }, model: AirportRunwayModel): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    if (colDef.field === 'runway') {
      selectedRunway.runwayTypes = model?.getRunwayDetails || [];
      agGrid.getComponentInstance('runwayDetail').setValue(null);
    }

    if (colDef.field === 'runwayDetail') {
      const runwayId = agGrid.getInstanceValue<AirportRunwayModel>('runway')?.id;
      if (!model || !runwayId) {
        return;
      }
      const isExist = props.data.airportFrequencyRunways.some(item => {
        // data.id is unchanged value of current row
        if (item.id === data.id) {
          return false;
        }
        return item.runway?.id === runwayId && item?.runwayDetail?.id === model.id;
      });
      if (isExist) {
        // this.commonErrorMessage = Utilities.getErrorMessages(gridState.gridApi).toString();
        gridState.setHasError(true);
        AlertStore.showAlert({
          id: 'duplicate-runway',
          type: ALERT_TYPES.IMPORTANT,
          message: 'Runway and Runway Number combination should be unique',
          hideAfter: 2000,
        });
      }
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, defaultEditKey);
        break;
      case GRID_ACTIONS.SAVE:
        upsertAssociatedRunway(rowIndex);
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

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Runway',
      field: 'runway',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Select Runway',
        getAutoCompleteOptions: () => selectedAirport?.runways,
      },
    },
    {
      headerName: 'Runway Number',
      field: 'runwayDetail',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Details*',
        getAutoCompleteOptions: () => selectedRunway.runwayTypes,
      },
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            { title: 'Edit', isHidden: !isEditable, action: GRID_ACTIONS.EDIT },
            { title: 'Delete', isHidden: !isMasterDetails, action: GRID_ACTIONS.DELETE },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onDropDownChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        hideActionButtons: !isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: p => {
        const rowItem = agGrid._getTableItem(Number(p.rowIndex));
        // Setup runway details Options based on the row Item
        if (rowItem.id) {
          selectedRunway.runwayTypes = rowItem?.runway?.getRunwayDetails || [];
        }
        agGrid.onRowEditingStarted(p);
        props.onChildRowEditing(true);
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        props.onChildRowEditing(false);
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
    };
  };

  return (
    <div className={classNames({ [classes.root]: true, [classes.masterDetails]: !isMasterDetails })}>
      <AgGridMasterDetails
        addButtonTitle="Add Associated Runway"
        onAddButtonClick={addAssociatedRunway}
        hasAddPermission={airportModuleSecurity.isEditable}
        disabled={
          !isEditable ||
          UIStore.pageLoading ||
          gridState.hasError ||
          gridState.isRowEditing ||
          props.isParentRowEditing()
        }
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact
          hidePagination={true}
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing}
          classes={{ customHeight: classes.customHeight }}
        />
      </AgGridMasterDetails>
    </div>
  );
};

export default observer(AssociatedRunways);

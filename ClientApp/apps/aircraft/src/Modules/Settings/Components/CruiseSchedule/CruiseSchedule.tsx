import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import {
  CRUISE_SCHEDULE_FILTERS,
  CruiseScheduleModel,
  PerformanceStore,
  SpeedScheduleSettingsStore,
  CustomResponseDialog,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, IAPIGridRequest } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { of } from 'rxjs';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  performanceStore?: PerformanceStore;
  speedScheduleSettingsStore?: SpeedScheduleSettingsStore;
}

const CruiseSchedule: FC<Props> = ({ ...props }: Props) => {
  const alertMessageId: string = 'CruiseScheduleAlertMessage';
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<CRUISE_SCHEDULE_FILTERS, CruiseScheduleModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const _speedScheduleSettingsStore = props.speedScheduleSettingsStore as SpeedScheduleSettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _speedScheduleSettingsStore
      .getCruiseSchedules()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  const showAlertInformation = (): void => {
    ModalStore.open(
      <CustomResponseDialog
        heading="Alert!"
        message="Record cannot be deleted as it is associated with a Performance record."
      />
    );
  };

  const addCruiseSchedule = () => {
    agGrid.addNewItems(
      [
        new CruiseScheduleModel({
          id: 0,
        }),
      ],
      {
        startEditing: false,
        colKey: 'profile',
      }
    );
    gridState.setHasError(true);
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'profile' ], id)) {
      agGrid.showAlert('Profile should be unique.', alertMessageId);
      return true;
    }
    return false;
  };

  /* istanbul ignore next */
  const getPerformanceByScheduleId = (model: CruiseScheduleModel): void => {
    const { performanceStore, speedScheduleSettingsStore } = props;
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('CruiseSchedules.CruiseScheduleId', model.id) ]),
    };
    performanceStore
      ?.getPerformanceById(request)
      .pipe(
        switchMap(response => {
          if (response?.id) {
            showAlertInformation();
            return of('');
          }
          return speedScheduleSettingsStore?.deleteSchedule(model.id, 'cruiseSchedule', 'Cruise Schedule') || of('');
        }),
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response) {
            agGrid._removeTableItems([ model ]);
            gridState.setGridData(gridState.data.filter(({ id }) => model.id !== id));
          }
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const confirmDeleteAction = (rowIndex: number): void => {
    const model: CruiseScheduleModel = agGrid._getTableItem(rowIndex);
    _useConfirmDialog.confirmAction(
      () => {
        ModalStore.close();
        getPerformanceByScheduleId(model);
      },
      {
        isDelete: true,
      }
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
        upsertSettingsProfile(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmDeleteAction(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const upsertSettingsProfile = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _speedScheduleSettingsStore
      .upsertCruiseSchedule(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: CruiseScheduleModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Schedule',
      field: 'profile',
      cellEditorParams: {
        rules: 'required|string|between:1,15',
      },
    },
    {
      headerName: 'Description',
      field: 'description',
      cellEditorParams: {
        rules: 'string|between:1,300',
      },
    },
    {
      headerName: 'NavBlue Schedule',
      field: 'navBlueSchedule',
      cellEditorParams: {
        rules: 'string|between:1,12',
      },
    },
    {
      headerName: 'uvGO Schedule',
      field: 'uvGoSchedule',
      cellEditorParams: {
        rules: 'string|between:1,12',
      },
    },
    {
      headerName: 'ForeFlight Schedule',
      field: 'foreFlightSchedule',
      cellEditorParams: {
        rules: 'string|between:1,12',
      },
    },
    {
      headerName: 'Collins Schedule',
      field: 'collinsSchedule',
      cellEditorParams: {
        rules: 'string|between:1,12',
      },
    },
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !aircraftModuleSecurity.isSettingsEditable,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: aircraftModuleSecurity.isSettingsEditable,
      gridActionProps: {
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const {
          id,
          profile,
          description,
          navBlueSchedule,
          uvGoSchedule,
          foreFlightSchedule,
          collinsSchedule,
        } = node.data as CruiseScheduleModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [CRUISE_SCHEDULE_FILTERS.PROFILE]: profile,
              [CRUISE_SCHEDULE_FILTERS.DESCRIPTION]: description,
              [CRUISE_SCHEDULE_FILTERS.NAVBLUE_SCHEDULE]: navBlueSchedule,
              [CRUISE_SCHEDULE_FILTERS.UVGO_SCHEDULE]: uvGoSchedule,
              [CRUISE_SCHEDULE_FILTERS.FOREFLIGHT_SCHEDULE]: foreFlightSchedule,
              [CRUISE_SCHEDULE_FILTERS.COLLINS_SCHEDULE]: collinsSchedule,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!aircraftModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addCruiseSchedule}
      >
        Add Cruise Schedule
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[
          agGridUtilities.createSelectOption(CRUISE_SCHEDULE_FILTERS, CRUISE_SCHEDULE_FILTERS.DESCRIPTION),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('performanceStore', 'speedScheduleSettingsStore')(observer(CruiseSchedule));

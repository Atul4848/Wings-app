import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { ColDef, GridOptions, ValueFormatterParams, GridReadyEvent } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  HealthAuthModel,
  HealthAuthorizationChangeRecordModel,
  HealthAuthStore,
  useRestrictionModuleSecurity,
} from '../../../Shared';
import { useStyles } from './ChangeRecord.styles';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  ENTITY_STATE,
  IClasses,
  UIStore,
  Utilities,
  ViewPermission,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  classes?: IClasses;
  healthAuthStore?: HealthAuthStore;
  params?: { viewMode: VIEW_MODE; id: number };
  navigate?: NavigateFunction;
}

const ChangeRecord: FC<Props> = ({ ...props }) => {
  const navigate = useNavigate();
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', HealthAuthorizationChangeRecordModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const _useConfirmDialog = useConfirmDialog();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const [ viewMode, setViewMode ] = useState<VIEW_MODE>(
    (params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS
  );

  /* istanbul ignore next */
  useEffect(() => {
    gridState.setGridData(_healthAuthStore?.selectedHealthAuth.healthAuthorizationChangeRecords);
  }, []);

  const isEditable = () =>
    Utilities.isEqual(viewMode as VIEW_MODE, VIEW_MODE.EDIT) || Utilities.isEqual(viewMode as VIEW_MODE, VIEW_MODE.NEW);

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        updateTableData();
        break;
      case GRID_ACTIONS.CANCEL:
        canceEditing(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveRecord(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        break;
    }
  };

  /* istanbul ignore next */
  const addNewRecord = () => {
    const record = new HealthAuthorizationChangeRecordModel();
    agGrid.addNewItems([ record ], { startEditing: false, colKey: 'changedBy' });
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const confirmRemoveRecord = (rowIndex: number) => {
    const model: HealthAuthorizationChangeRecordModel = agGrid._getTableItem(rowIndex);
    if (model?.id === 0) {
      deleteChangeRecord(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteChangeRecord(model), {
      title: 'Confirm Delete',
      message: 'Are you sure you want to remove this Record?',
    });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Changed By',
      field: 'changedBy',
      cellEditorParams: {
        rules: 'required|string|between:1,100',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Notes',
      field: 'notes',
      cellEditorParams: {
        rules: 'string|between:1,500',
        ignoreNumber: true,
      },
    },
    {
      headerName: 'Changed Date',
      field: 'changedDate',
      sort: 'desc',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      cellEditorParams: {
        isRequired: () => true,
        format: DATE_FORMAT.DATE_PICKER_FORMAT,
        pickerType: DATE_TIME_PICKER_TYPE.DATE,
      },
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
    },
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
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        showDeleteButton: true,
        // hideActionButtons: !isEditable,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => isEditable(),
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', isEditable());
      },
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (!isEditable()) {
          return;
        }
        agGrid._startEditingCell(rowIndex as number, colDef.field || '');
      },
    };
  };

  /* istanbul ignore next */
  const canceEditing = (rowIndex: number): void => {
    const data: HealthAuthorizationChangeRecordModel = agGrid._getTableItem(rowIndex);
    const isNewEntry = Utilities.isEqual((data?.entityState as ENTITY_STATE) || '', ENTITY_STATE.UNCHNAGED);
    agGrid.cancelEditing(rowIndex, isNewEntry);
  };

  /* istanbul ignore next */
  const deleteChangeRecord = (model: HealthAuthorizationChangeRecordModel): void => {
    ModalStore.close();
    agGrid._removeTableItems([ model ]);
    updateTableData();
  };

  const updateTableData = (): void => {
    gridState.gridApi?.stopEditing();
    gridState.setGridData(
      agGrid._getAllTableRows().map(
        requirement =>
          new HealthAuthorizationChangeRecordModel({
            ...requirement,
            id: requirement.id || Utilities.getTempId(true),
            entityState: ENTITY_STATE.NEW,
          })
      )
    );
  };

  const upsertChangeRecords = (): void => {
    UIStore.setPageLoader(true);
    const updatedHealthAuthorization = new HealthAuthModel({
      ..._healthAuthStore?.selectedHealthAuth,
      healthAuthorizationChangeRecords: gridState.data,
    });
    _healthAuthStore
      .upsertChangeRecords(updatedHealthAuthorization)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(healthAuthorizationChangeRecords => {
        setViewMode(VIEW_MODE.DETAILS);
        gridState.setGridData(healthAuthorizationChangeRecords as any);
        agGrid.setColumnVisible('actionRenderer', false);
      });
  };

  const onAction = (action: GRID_ACTIONS) => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        setViewMode(VIEW_MODE.EDIT);
        agGrid.setColumnVisible('actionRenderer', true);
        break;
      case GRID_ACTIONS.SAVE:
        upsertChangeRecords();
        break;
      case GRID_ACTIONS.CANCEL:
        const _viewMode = params.viewMode?.toUpperCase() || VIEW_MODE.DETAILS;
        if (_viewMode === VIEW_MODE.DETAILS) {
          setViewMode(VIEW_MODE.DETAILS);
          agGrid.setColumnVisible('actionRenderer', false);
          gridState.setGridData(_healthAuthStore?.selectedHealthAuth.healthAuthorizationChangeRecords);
          return;
        }
        navigate('/restrictions');
        break;
    }
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <DetailsEditorHeaderSection
          title={_healthAuthStore.selectedHealthAuth.title}
          backNavLink="/restrictions"
          backNavTitle="Health Authorizations"
          disableActions={gridState.isRowEditing || UIStore.pageLoading}
          isEditMode={isEditable()}
          hasEditPermission={restrictionModuleSecurity.isEditable}
          onAction={action => onAction(action)}
          isRowEditing={gridState.isRowEditing}
        />
      </>
    );
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper headerActions={headerActions()} isEditMode={isEditable()}>
        <>
          <div className={classes.buttonWrapper}>
            <ViewPermission hasPermission={restrictionModuleSecurity.isEditable && isEditable()}>
              <PrimaryButton variant="contained" disabled={gridState.isRowEditing} onClick={addNewRecord}>
                Add Record
              </PrimaryButton>
            </ViewPermission>
          </div>
          <div className={classes.gridWrapper}>
            <CustomAgGridReact
              isRowEditing={gridState.isRowEditing}
              rowData={gridState.data}
              gridOptions={gridOptions()}
              disablePagination={gridState.isRowEditing}
              key={`changeRecord-${isEditable()}`}
            />
          </div>
        </>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};
export default inject('healthAuthStore')(observer(ChangeRecord));

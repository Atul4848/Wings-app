import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { IAPIGridRequest, IClasses, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { Grid, Tooltip } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, SidebarStore } from '@wings-shared/layout';
import { StagingFieldsRenderer, UplinkRejectionNotes, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../AirportReview.styles';
import { RemoveRedEyeOutlined } from '@material-ui/icons';
import { fields, isDataMerged, isDataRejected, mergeStatus } from '../fields';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { EDITOR_TYPES, IViewInputControl } from '@wings-shared/form-controls';
import {
  AirportHourUplinkStagingReviewModel,
  AirportSettingsStore,
  AirportStore,
  reviewInformation,
  useAirportModuleSecurity,
} from '../../Shared';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const AirportHoursReviewDetails: FC<Props> = ({ sidebarStore, airportStore, airportSettingsStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const navigate = useNavigate();
  const params = useParams();
  const agGrid = useAgGrid<'', AirportHourUplinkStagingReviewModel>([], gridState);
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const permitModuleSecurity = useAirportModuleSecurity();
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const _airportStore = airportStore as AirportStore;
  const _useConfirmDialog = useConfirmDialog();
  const basePath = useMemo(() => {
    const pathList = location.pathname.split('/');
    const indexOfOR = pathList.indexOf('/airport-review');
    return pathList.slice(0, indexOfOR).join('/');
  }, [ location.pathname ]);

  useEffect(() => {
    sidebarStore?.setNavLinks(reviewInformation(), `${basePath}/review-details`);
    _airportSettingsStore.loadRejectionReason().subscribe();
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    _airportStore
      ?.getAirportHoursReviewList(Number(params?.id))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: response => {
          gridState.setGridData(response.results || []);
        },
        error: error => {
          AlertStore.critical(error.message);
        },
      });
  };

  const formatCellValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value
        .map((item: any) => item?.name || item?.element?.name || JSON.stringify(item))
        .filter(Boolean)
        .join(', ');
    }

    if (typeof value === 'object' && value !== null) {
      return value.name || JSON.stringify(value);
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  };

  const dialogContent = (data: AirportHourUplinkStagingReviewModel) => {
    if (!data?.propertyName) return null;

    const airportInfoReviwDetail = [
      {
        title: 'Conditions Values',
        match: /Conditions\[\d+\]\.ConditionValues/,
        formatFn: (item: any) =>
          item?.entityValue && item?.entityValueCode
            ? `${item.entityValue} (${item.entityValueCode})`
            : item?.entityValue || '',
      },
    ];

    const matchedField = airportInfoReviwDetail.find(({ match }) => match.test(data.propertyName));
    if (!matchedField) return null;

    const { title, formatFn } = matchedField;
    const oldValue = Array.isArray(data.oldValue) ? data.oldValue : [];
    const newValue = Array.isArray(data.newValue) ? data.newValue : [];

    const hasData = oldValue.length > 0 || newValue.length > 0;
    if (!hasData) return null;

    return (
      <Grid container>
        <Grid item xs={12}>
          <StagingFieldsRenderer title={title} oldValue={oldValue} newValue={newValue} formatFn={formatFn} />
        </Grid>
      </Grid>
    );
  };

  const getApprovalsData = (data: AirportHourUplinkStagingReviewModel) => {
    ModalStore.open(
      <Dialog
        title={'Approval Details'}
        open={true}
        onClose={() => ModalStore.close()}
        dialogContent={() => dialogContent(data)}
        disableBackdropClick={true}
      />
    );
  };

  const reviewActions = (rowIndex: number, { data }: RowNode) => {
    return (
      <div className={classes.actionButton}>
        <ViewPermission hasPermission={permitModuleSecurity.isEditable && data.isList}>
          <PrimaryButton
            variant="outlined"
            color="primary"
            disabled={UIStore.pageLoading}
            onClick={() => getApprovalsData(data)}
          >
            <Tooltip title="Details">
              <RemoveRedEyeOutlined className={classes.icons} />
            </Tooltip>
          </PrimaryButton>
        </ViewPermission>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Property Name',
      field: 'propertyName',
      minWidth: 150,
      headerTooltip: 'Property Name',
    },
    {
      headerName: 'Old Value',
      field: 'oldValue',
      minWidth: 150,
      headerTooltip: 'Old Value',
      valueFormatter: ({ data }) => formatCellValue(data?.oldValue),
    },
    {
      headerName: 'New Value',
      field: 'newValue',
      minWidth: 150,
      headerTooltip: 'New Value',
      valueFormatter: ({ data }) => formatCellValue(data?.newValue),
    },

    {
      headerName: 'Status',
      field: 'mergeStatus',
      minWidth: 120,
      editable: false,
      cellRenderer: 'statusRenderer',
      cellRendererParams: ({ data }) => {
        return {
          value: mergeStatus[data?.mergeStatus],
        };
      },
      headerTooltip: 'Status',
    },
    {
      ...agGrid.actionColumn({
        cellRenderer: 'viewRenderer',
        maxWidth: 150,
        minWidth: 150,
        cellRendererParams: {
          getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => reviewActions(rowIndex, node),
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: permitModuleSecurity.isEditable,
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      pagination: false,
      suppressScrollOnNewData: true,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
      },
    };
  };

  const confirmApprove = (id: Number): void => {
    _useConfirmDialog.confirmAction(
      () => {
        approveRecord(id), ModalStore.close();
      },
      {
        title: 'Confirm Action',
        message: 'Are you sure you want to approve the changes?',
      }
    );
  };

  const upsertRejectionReason = (rejection, id) => {
    const request = {
      uplinkStagingId: id,
      rejectionReasonId: rejection.rejectionReason?.id,
      rejectionNotes: rejection.rejectionNotes,
    };
    UIStore.setPageLoader(true);
    _airportStore
      ?.rejectAirportHourStaging(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response.hasErrors) {
            return;
          }
          ModalStore.close();
          gridState.gridApi.deselectAll();
          loadInitialData();
        },
        error: error => {
          ModalStore.close();
          AlertStore.critical(error.message);
        },
      });
  };

  const openRejectionNotesDialog = (viewMode: VIEW_MODE, id: Number): void => {
    const inputControls: IViewInputControl[] = [
      {
        fieldKey: 'rejectionReason',
        type: EDITOR_TYPES.DROPDOWN,
        isFullFlex: true,
        options: _airportSettingsStore.rejectionReason || [],
      },
      {
        fieldKey: 'rejectionNotes',
        type: EDITOR_TYPES.TEXT_FIELD,
        multiline: true,
        rows: 5,
        isFullFlex: true,
      },
    ];

    ModalStore.open(
      <UplinkRejectionNotes
        viewMode={VIEW_MODE.EDIT}
        fields={fields}
        inputControls={inputControls}
        onDataSave={onSave => upsertRejectionReason(onSave, id)}
      />
    );
  };

  const approveRecord = (id): void => {
    UIStore.setPageLoader(true);
    const request = {
      uplinkStagingId: id,
    };
    _airportStore
      ?.approveAirportHourStaging(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response.hasErrors) {
            return;
          }
          gridState.gridApi.deselectAll();
          loadInitialData();
        },
        error: error => {
          AlertStore.critical(error.message);
        },
      });
  };

  const isDataDisabled = (data: AirportHourUplinkStagingReviewModel[]): boolean => {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }
    const status = data[0]?.mergeStatus;
    return isDataMerged(status) || isDataRejected(status);
  };

  const topHeaderActions = (): ReactNode => {
    const isDisabled = React.useMemo(() => isDataDisabled(gridState.data), [ gridState.data ]);
    return (
      <DetailsEditorHeaderSection
        title={''}
        isEditMode={false}
        showBreadcrumb={true}
        backNavLink=""
        useHistoryBackNav={true}
        onBackClick={() => {
          navigate(-1);
        }}
        backNavTitle="Back"
        classes={{
          titleContainer: classes?.titleContainer,
          contentContainer: classes?.contentContainer,
        }}
        customActionButtons={() => (
          <>
            <ViewPermission hasPermission={permitModuleSecurity.isEditable}>
              <PrimaryButton
                disabled={UIStore.pageLoading || isDisabled}
                variant="contained"
                color="primary"
                onClick={() => confirmApprove(Number(params.airportHourId))}
              >
                Merge All
              </PrimaryButton>
            </ViewPermission>
            <ViewPermission hasPermission={permitModuleSecurity.isEditable}>
              <PrimaryButton
                disabled={UIStore.pageLoading || isDisabled}
                variant="contained"
                color="primary"
                onClick={() => openRejectionNotesDialog(VIEW_MODE.EDIT, Number(params.airportHourId))}
              >
                Reject All
              </PrimaryButton>
            </ViewPermission>
          </>
        )}
      />
    );
  };

  return (
    <>
      <DetailsEditorWrapper
        headerActions={topHeaderActions()}
        isEditMode={false}
        isBreadCrumb={true}
        hasChanges={gridState.hasSelectedRows}
      >
        <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
      </DetailsEditorWrapper>
    </>
  );
};

export default inject('sidebarStore', 'airportStore', 'airportSettingsStore')(observer(AirportHoursReviewDetails));

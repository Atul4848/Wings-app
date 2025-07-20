import React, { FC, useEffect, useState } from 'react';
import {
  AirportCustomDetailStore,
  AirportHoursStore,
  airportSidebarOptions,
  CUSTOM_GENERAL_INFO_FILTERS,
  CustomGeneralInfoReviewModel,
  useAirportModuleSecurity,
} from '../../Shared';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { GRID_ACTIONS, GridPagination, IAPIGridRequest, IClasses, UIStore, Utilities } from '@wings-shared/core';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { Grid } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SidebarStore } from '@wings-shared/layout';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../AirportReview.styles';
import { STAGING_REVIEW_COMPARISION_TYPE, StagingFieldsRenderer, UplinkReviewActions } from '@wings/shared';
import {
  getCustomGeneralInfoData,
  comparisonType,
  isDataMerged,
  isDataRejected,
  mergeStatus,
  mergeStatusOptions,
} from '../fields';

interface Props {
  airportCustomDetailStore?: AirportCustomDetailStore;
  sidebarStore?: typeof SidebarStore;
  airportHoursStore?: AirportHoursStore;
}

const CustomGeneralInfoReview: FC<Props> = ({ airportCustomDetailStore, airportHoursStore, sidebarStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<CUSTOM_GENERAL_INFO_FILTERS, CustomGeneralInfoReviewModel>([], gridState);
  const [ entityOptions, setEntityOptions ] = useState([]);
  const _airportCustomDetailStore = airportCustomDetailStore as AirportCustomDetailStore;
  const _airportHoursStore = airportHoursStore as AirportHoursStore;
  const _useConfirmDialog = useConfirmDialog();
  const searchHeader = useSearchHeader();
  const airportModuleSecurity = useAirportModuleSecurity();
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  useEffect(() => {
    _sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEntityOptions();
  }, [ searchHeader.searchValue ]);

  /* istanbul ignore next */
  const getFilterPropertyName = (selectedOption): any => {
    switch (selectedOption) {
      case CUSTOM_GENERAL_INFO_FILTERS.AIRPORT:
        return 'airportId';
      case CUSTOM_GENERAL_INFO_FILTERS.APPROVAL_STATUS:
        return 'mergeStatusId';
    }
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const { searchType, chipValue } = searchHeader;
    const _searchValue = chipValue.map(x => {
      return Utilities.isEqual(searchType, CUSTOM_GENERAL_INFO_FILTERS.APPROVAL_STATUS) ? x.value : x.id;
    });
    if (!_searchValue || _searchValue.length === 0) {
      return {};
    }
    return {
      filterCollection: JSON.stringify([{ [getFilterPropertyName(searchType)]: _searchValue[0] }]),
    };
  };

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...filterCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
    };
    UIStore.setPageLoader(true);
    _airportCustomDetailStore
      .getCustomGeneralInfoReview(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(tableData => {
        const transformedData = getCustomGeneralInfoData(tableData.results, [ 1 ], false);
        gridState.setGridData(transformedData);
        gridState.setPagination(new GridPagination({ ...tableData }));
      });
  };

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    let observableOf;
    switch (searchHeader.searchType) {
      case CUSTOM_GENERAL_INFO_FILTERS.APPROVAL_STATUS:
        setEntityOptions(mergeStatusOptions);
        break;
      case CUSTOM_GENERAL_INFO_FILTERS.AIRPORT:
        const _searchValue = searchHeader.searchValue;
        if (!_searchValue) {
          setEntityOptions([]);
          return;
        }
        observableOf = _airportHoursStore.searchWingsAirports(_searchValue, false);
        break;
      default:
        break;
    }
    if (observableOf) {
      UIStore.setPageLoader(true);
      observableOf
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(response => setEntityOptions(response));
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    if (gridAction === GRID_ACTIONS.EDIT) {
      agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
      return;
    }
    agGrid.cancelEditing(rowIndex);
  };

  const dialogContent = data => {
    return (
      <Grid container>
        {/* Customs Location Information */}
        {data?.appliedCustomsLocationInformations &&
          (data.appliedCustomsLocationInformations.oldValue?.length > 0 ||
            data.appliedCustomsLocationInformations.newValue?.length > 0) && (
            <Grid item xs={12}>
              <StagingFieldsRenderer
                oldValue={data.appliedCustomsLocationInformations.oldValue}
                newValue={data.appliedCustomsLocationInformations.newValue}
                title={'Customs Location Information'}
                formatFn={item => item?.customsLocationInformation?.name || ''}
              />
            </Grid>
          )}

        {/* Customs Clearance FBOs */}
        {data?.customsClearanceFBOs &&
          (data.customsClearanceFBOs.oldValue?.length > 0 || data.customsClearanceFBOs.newValue?.length > 0) && (
            <Grid item xs={12}>
              <StagingFieldsRenderer
                oldValue={data.customsClearanceFBOs.oldValue}
                newValue={data.customsClearanceFBOs.newValue}
                title={'Customs Clearance FBOs'}
                formatFn={item => `${item?.clearanceFBOName || ''}(${item?.clearanceFBOCode || ''})`}
              />
            </Grid>
          )}

        {/* Max POB Alternate Clearance Options */}
        {data?.appliedMaxPOBAltClearanceOptions &&
          (data.appliedMaxPOBAltClearanceOptions.oldValue?.length > 0 ||
            data.appliedMaxPOBAltClearanceOptions.newValue?.length > 0) && (
            <Grid item xs={12}>
              <StagingFieldsRenderer
                oldValue={data.appliedMaxPOBAltClearanceOptions.oldValue}
                newValue={data.appliedMaxPOBAltClearanceOptions.newValue}
                title={'Max POB Alternate Clearance Options'}
                formatFn={item => item?.maxPOBOption?.name || ''}
              />
            </Grid>
          )}
      </Grid>
    );
  };

  const customErrorMessage = (error, id) => {
    if (error.message.toLowerCase().includes(`UplinkProperty ${id} Id not found`.toLowerCase())) {
      AlertStore.critical('Updates have been made to this record. Please refresh the page.');
      return;
    }
    AlertStore.critical(error.message);
  };

  const getApprovalsData = data => {
    UIStore.setPageLoader(true);
    _airportCustomDetailStore
      ?.getCustomGeneralInfoReviewList(data.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: response => {
          ModalStore.open(
            <Dialog
              title={'Approval Details'}
              open={true}
              onClose={() => ModalStore.close()}
              dialogContent={() => dialogContent(response)}
              disableBackdropClick={true}
            />
          );
        },
        error: error => {
          customErrorMessage(error, data.id);
        },
      });
  };

  const ConfirmationModel = (data: CustomGeneralInfoReviewModel, isApprove: boolean): void => {
    _useConfirmDialog.confirmAction(
      () => {
        approveRejectRecord(data, isApprove), ModalStore.close();
      },
      {
        title: 'Confirm Action',
        message: isApprove
          ? 'Are you sure you want to approve the changes?'
          : 'Are you sure you want to reject the changes?',
      }
    );
  };

  const approveRejectRecord = (data, isApprove: boolean): void => {
    UIStore.setPageLoader(true);
    const request = {
      uplinkStagingId: data?.id,
    };
    const operationObservable = isApprove
      ? _airportCustomDetailStore?.approveCustomGeneralInfoStaging(request)
      : _airportCustomDetailStore?.rejectCustomGeneralInfoStaging(request);

    operationObservable
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
          customErrorMessage(error, data.id);
        },
      });
  };

  const isDataDisabled = data => {
    if (isDataMerged(data.mergeStatus) || isDataRejected(data.mergeStatus)) {
      return true;
    }
    if (
      (Utilities.isEqual(data.comparisionType, STAGING_REVIEW_COMPARISION_TYPE.ADDED) &&
        data.vendorCustomGeneralInfoId) ||
      Utilities.isEqual(data.comparisionType, STAGING_REVIEW_COMPARISION_TYPE.MODIFIED)
    ) {
      return false;
    }
    return true;
  };

  const reviewActions = (rowIndex: number, { data }: RowNode) => {
    const isDisabled = isDataDisabled(data);
    return (
      <UplinkReviewActions
        approveRejectPermission={airportModuleSecurity.isEditable && data.vendorCustomGeneralInfoId}
        viewDetailsPermission={airportModuleSecurity.isEditable && data.isList}
        disabledApproveReject={isDisabled}
        onApprove={() => ConfirmationModel(data, true)}
        onReject={() => ConfirmationModel(data, false)}
        onViewDetails={() => getApprovalsData(data)}
      />
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
    },
    {
      headerName: 'New Value',
      field: 'newValue',
      minWidth: 150,
      headerTooltip: 'New Value',
    },
    {
      headerName: 'Comparison Type',
      field: 'comparisionType',
      minWidth: 120,
      headerTooltip: 'Comparison Type',
      valueFormatter: ({ data }) => comparisonType[data?.comparisionType] || '',
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
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRenderer: 'viewRenderer',
        maxWidth: 150,
        minWidth: 150,
        cellRendererParams: {
          getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => reviewActions(rowIndex, node),
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            gridActions(action, rowIndex);
          },
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
      isEditable: airportModuleSecurity.isEditable,
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

      groupDefaultExpanded: 0, // Expand all groups by default
      getDataPath: data => data.path,
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Airport',
        field: 'airport',
        minWidth: 180,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
        valueFormatter: ({ data }) => data?.airport.label || '',
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(CUSTOM_GENERAL_INFO_FILTERS, CUSTOM_GENERAL_INFO_FILTERS.AIRPORT),
        ]}
        isChipInputControl={true}
        chipInputProps={{
          options: entityOptions,
          allowOnlySingleSelect: true,
          onFocus: loadEntityOptions,
        }}
        onSearch={sv => loadInitialData()}
        onFiltersChanged={loadInitialData}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={request => loadInitialData(request)}
        classes={{ customHeight: classes.customHeight }}
      />
    </>
  );
};

export default inject(
  'airportCustomDetailStore',
  'airportHoursStore',
  'sidebarStore'
)(observer(CustomGeneralInfoReview));

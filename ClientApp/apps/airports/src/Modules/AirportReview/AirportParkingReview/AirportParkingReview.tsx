import React, { FC, useEffect, useState } from 'react';
import {
  AIRPORT_PARKING_FILTERS,
  AirportHoursStore,
  airportSidebarOptions,
  AirportStore,
  AirportParkingReviewModel,
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
  comparisonType,
  isDataMerged,
  isDataRejected,
  mergeStatus,
  mergeStatusOptions,
  getAirportParkingData,
} from '../fields';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
  airportHoursStore?: AirportHoursStore;
}

const AirportParkingReview: FC<Props> = ({ airportStore, airportHoursStore, sidebarStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<AIRPORT_PARKING_FILTERS, AirportParkingReviewModel>([], gridState);
  const [ entityOptions, setEntityOptions ] = useState([]);
  const _airportStore = airportStore as AirportStore;
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
      case AIRPORT_PARKING_FILTERS.AIRPORT:
        return 'airportId';
      case AIRPORT_PARKING_FILTERS.APPROVAL_STATUS:
        return 'mergeStatusId';
    }
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const { searchType, chipValue } = searchHeader;
    const _searchValue = chipValue.map(x => {
      return Utilities.isEqual(searchType, AIRPORT_PARKING_FILTERS.APPROVAL_STATUS) ? x.value : x.id;
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
    _airportStore
      .getAirportParkingReview(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(tableData => {
        const transformedData = getAirportParkingData(tableData.results, [ 1 ], false);
        gridState.setGridData(transformedData);
        gridState.setPagination(new GridPagination({ ...tableData }));
      });
  };

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    let observableOf;
    switch (searchHeader.searchType) {
      case AIRPORT_PARKING_FILTERS.APPROVAL_STATUS:
        setEntityOptions(mergeStatusOptions);
        break;
      case AIRPORT_PARKING_FILTERS.AIRPORT:
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

  const dialogContent = (data) => {
    const fields = [
      {
        key: 'airportSeasonalParkings',
        title: 'Airport Seasonal Parkings',
        formatFn: (item) => `${item?.monthName}` || '',
      },
      {
        key: 'appliedParkingAlternateAirports',
        title: 'Parking Alternate Airport',
        formatFn: (item) => `${item?.airport?.name}(${item?.airport?.displayCode})` || '',
      },
    ];
  
    const firstValidField = fields.find(({ key }) => {
      const field = data?.[key];
      return field?.oldValue?.length > 0 || field?.newValue?.length > 0;
    });
  
    return (
      <Grid container>
        {firstValidField && (
          <Grid item xs={12}>
            <StagingFieldsRenderer
              oldValue={data[firstValidField.key].oldValue}
              newValue={data[firstValidField.key].newValue}
              title={firstValidField.title}
              formatFn={firstValidField.formatFn}
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
    _airportStore
      ?.getAirportParkingReviewList(data.airportParkingStagingPropertyId)
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

  const ConfirmationModel = (data: AirportParkingReviewModel, isApprove: boolean): void => {
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
      ? _airportStore?.approveAirportParkingStaging(request)
      : _airportStore?.rejectAirportParkingStaging(request);

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
        data.vendorAirportParkingId) ||
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
        approveRejectPermission={airportModuleSecurity.isEditable && data.vendorAirportParkingId}
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
        selectInputs={[ agGridUtilities.createSelectOption(AIRPORT_PARKING_FILTERS, AIRPORT_PARKING_FILTERS.AIRPORT) ]}
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

export default inject('airportStore', 'airportHoursStore', 'sidebarStore')(observer(AirportParkingReview));

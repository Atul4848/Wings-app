import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  airportSidebarOptions,
  AirportStore,
  MILITARY_REVIEW_FILTERS,
  MilitaryFieldsReviewModel,
  useAirportModuleSecurity,
} from '../../Shared';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { GridPagination, IAPIGridRequest, IClasses, UIStore, Utilities } from '@wings-shared/core';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { Grid } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SidebarStore } from '@wings-shared/layout';
import { inject, observer } from 'mobx-react';
import {
  comparisonType,
  getMilitaryReviewGridData,
  isDataMerged,
  isDataRejected,
  mergeStatus,
  mergeStatusOptions,
} from '../fields';
import { useStyles } from '../AirportReview.styles';
import {
  BaseAirportStore,
  STAGING_REVIEW_COMPARISION_TYPE,
  StagingFieldsRenderer,
  UplinkReviewActions,
} from '@wings/shared';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
}

const MilitaryFieldsReview: FC<Props> = ({ airportStore, sidebarStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<MILITARY_REVIEW_FILTERS, MilitaryFieldsReviewModel>([], gridState);
  const [ entityOptions, setEntityOptions ] = useState([]);
  const _airportStore = airportStore as AirportStore;
  const baseAirportStore = useMemo(() => new BaseAirportStore(), []);
  const _useConfirmDialog = useConfirmDialog();
  const searchHeader = useSearchHeader();
  const { isEditable } = useAirportModuleSecurity();
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  useEffect(() => {
    _sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEntityOptions();
  }, [ searchHeader.searchValue ]);

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const { searchType, chipValue } = searchHeader;
    const isAirportFilter = Utilities.isEqual(searchType, MILITARY_REVIEW_FILTERS.AIRPORT);
    const _searchValue = chipValue.map(x => (isAirportFilter ? x.id : x.value));
    const propertyName = isAirportFilter ? 'airportId' : 'mergeStatusId';
    if (!Boolean(_searchValue.length)) {
      return {};
    }
    return {
      filterCollection: JSON.stringify([{ [propertyName]: _searchValue[0] }]),
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
      .getMilitaryUplinkStagings(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(tableData => {
        const transformedData = getMilitaryReviewGridData(tableData.results, [ 1 ], false);
        gridState.setGridData(transformedData);
        gridState.setPagination(new GridPagination({ ...tableData }));
      });
  };

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    const { searchValue, searchType } = searchHeader;
    if (Utilities.isEqual(searchType, MILITARY_REVIEW_FILTERS.STATUS)) {
      setEntityOptions(mergeStatusOptions);
      return;
    }
    if (!searchValue) {
      setEntityOptions([]);
      return;
    }
    UIStore.setPageLoader(true);
    baseAirportStore
      .searchWingsAirports(searchValue, false)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => setEntityOptions(response));
  };

  const dialogContent = data => {
    const { newValue, oldValue } = data.appliedAirportType;
    return (
      <Grid container>
        {/* Applied Airport Type */}
        {data?.appliedAirportType && (oldValue?.length > 0 || newValue?.length > 0) && (
          <Grid item xs={12}>
            <StagingFieldsRenderer
              oldValue={oldValue}
              newValue={newValue}
              title={'Airport Type'}
              formatFn={item => {
                if (!item.airportType) {
                  return '';
                }
                return item.airportType.name || '';
              }}
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

  /* istanbul ignore next */
  const getMilitaryReviewDetail = (propertyId: number) => {
    UIStore.setPageLoader(true);
    _airportStore
      ?.getMilitaryStagingDetail(propertyId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
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
        error: error => customErrorMessage(error, propertyId),
      });
  };

  /* istanbul ignore next */
  const ConfirmAction = (uplinkStagingId: number, isApprove: boolean): void => {
    _useConfirmDialog.confirmAction(
      () => {
        approveRejectRecord(uplinkStagingId, isApprove);
        ModalStore.close();
      },
      {
        title: 'Confirm Action',
        message: `Are you sure you want to ${isApprove ? 'approve' : 'reject'} the changes?`,
      }
    );
  };

  /* istanbul ignore next */
  const approveRejectRecord = (uplinkStagingId, isApprove: boolean): void => {
    UIStore.setPageLoader(true);
    _airportStore
      .approveRejectMilitaryStaging(uplinkStagingId, isApprove)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          if (response.hasErrors) {
            return;
          }
          loadInitialData();
        },
        error: error => customErrorMessage(error, uplinkStagingId),
      });
  };

  /* istanbul ignore next */
  const isDataDisabled = data => {
    const { mergeStatus, comparisionType, id } = data;
    if (isDataMerged(mergeStatus) || isDataRejected(mergeStatus)) {
      return true;
    }
    if (
      (Utilities.isEqual(comparisionType, STAGING_REVIEW_COMPARISION_TYPE.ADDED) && id) ||
      Utilities.isEqual(comparisionType, STAGING_REVIEW_COMPARISION_TYPE.MODIFIED)
    ) {
      return false;
    }
    return true;
  };

  const reviewActions = (rowIndex: number, { data }: RowNode) => {
    const { id, isList, airportMilitaryStagingPropertyId } = data;
    return (
      <UplinkReviewActions
        approveRejectPermission={isEditable && id}
        viewDetailsPermission={isEditable && isList}
        disabledApproveReject={isDataDisabled(data)}
        onApprove={() => ConfirmAction(id, true)}
        onReject={() => ConfirmAction(id, false)}
        onViewDetails={() => getMilitaryReviewDetail(airportMilitaryStagingPropertyId)}
      />
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Property Name',
      field: 'propertyName',
      headerTooltip: 'Property Name',
    },
    {
      headerName: 'Old Value',
      field: 'oldValue',
      headerTooltip: 'Old Value',
    },
    {
      headerName: 'New Value',
      field: 'newValue',
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
      headerTooltip: 'Status',
      cellRenderer: 'statusRenderer',
      cellRendererParams: ({ data }) => {
        return {
          value: mergeStatus[data?.mergeStatus],
        };
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRenderer: 'viewRenderer',
        maxWidth: 150,
        cellRendererParams: {
          getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => reviewActions(rowIndex, node),
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable,
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        minWidth: 150,
      },
      isExternalFilterPresent: () => false,
      suppressRowHoverHighlight: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
      },
      getDataPath: data => data.path,
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Airport',
        field: 'airport',
        minWidth: 180,
        valueFormatter: ({ data }) => data?.airport.label || '',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(MILITARY_REVIEW_FILTERS, MILITARY_REVIEW_FILTERS.AIRPORT) ]}
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

export default inject('airportStore', 'sidebarStore')(observer(MilitaryFieldsReview));

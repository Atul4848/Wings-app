import React, { FC, useEffect, ReactNode } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  AirportStore,
  FAAImportComparisonModel,
  FAA_IMPORT_COMPARISON_FILTERS,
  FAA_IMPORT_DATA_FILTERS,
  FAA_IMPORT_STAGING_ENTITY_TYPE,
  FAA_MERGE_STATUS,
  faaImportFileDetailsSidebarOptions,
  faaImportReviewSidebarOptions,
  useAirportModuleSecurity,
} from '../../Shared';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AlertStore } from '@uvgo-shared/alert';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import FaaMergedStatus from '../Components/FaaMergedStatus/FaaMergedStatus';
import { comparisonType, gridFilters, mergeStatus, mergeStatusOptions } from '../fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { useStyles } from './FaaFileDetails.styles';
import { Params } from 'react-router';
import { frequencyAirportOptions, getFaaFilterCollection } from './FilterOptions';
import { FAAActionButtons } from '../Components';
import {
  DATE_FORMAT,
  GridPagination,
  UIStore,
  Utilities,
  IAPIGridRequest,
  IAPIPageResponse,
  ViewPermission,
  SearchStore,
} from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmDialog, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
  entityType: FAA_IMPORT_STAGING_ENTITY_TYPE;
  filters?: FAA_IMPORT_COMPARISON_FILTERS;
  isRunwayBySourceLocation?: boolean; // True if we are loading runways specific to source location Id
}

interface RouteParams extends Params {
  id: string;
  viewMode: VIEW_MODE;
  processId: string;
}

const FAAFileDetails: FC<Props> = ({ airportStore, sidebarStore, entityType, ...props }) => {
  const otherOptionKey: string = 'faaImportOption';
  const gridState = useGridState();
  const agGrid = useAgGrid<FAA_IMPORT_COMPARISON_FILTERS, FAAImportComparisonModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const params = useParams() as RouteParams;
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const searchHeader = useSearchHeader();
  const airportModuleSecurity = useAirportModuleSecurity();

  const isFrequency = entityType === FAA_IMPORT_STAGING_ENTITY_TYPE.FREQUENCY;
  const isRunway = entityType === FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS;
  const isAirport = entityType === FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT;
  const faaBasePath = `airports/import-faa/${params.id}/${params.processId}${isFrequency ? '/frequencies' : ''}`;

  /* istanbul ignore next */
  // Load Data on Mount
  useEffect(() => {
    // If user coming from specific source location runway details screen
    if (props.isRunwayBySourceLocation) {
      const path = location.pathname.replace('/runways', '').slice(1);
      const options = faaImportReviewSidebarOptions(true);
      sidebarStore?.setNavLinks(options, path);
      airportStore?.setIsRunwayBackNav(false);
    } else {
      const sidebarNavLinks = faaImportFileDetailsSidebarOptions(entityType);
      sidebarStore?.setNavLinks(sidebarNavLinks, faaBasePath);
    }
    searchHeader.restoreSearchFilters(gridState, () => {
      gridState.setPagination(new GridPagination());
      loadInitialData();
    })
  }, []);

  // If Filter Type is Status then we needs to display status options in chip
  const isStatusFilter = Utilities.isEqual(
    searchHeader.searchType,
    FAA_IMPORT_COMPARISON_FILTERS.FAA_MERGE_STATUS
  );

  const hasSearchOrChipValue = (): boolean => {
    return searchHeader.hasSearchValue || Boolean(searchHeader.getFilters().chipValue.length);
  };

  const disableMergeAllButton = (): boolean => {
    if (isAirport) {
      return true;
    }
    return gridState.hasSelectedRows || hasSearchOrChipValue() || !gridState.allowSelectAll || !gridState.data.length;
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...getFaaFilterCollection(entityType, params, props.isRunwayBySourceLocation, searchHeader),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    airportStore
      ?.getFAAImportComparison(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse<FAAImportComparisonModel>) => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        // If records are in single page then check if can allow select all functionality
        const allowSelectAll = response.results.some(
          x => !Utilities.isEqual(x.faaMergeStatus, FAA_MERGE_STATUS.MERGED)
        );

        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const confirmMergeChanges = (isMergeAll: boolean, faaImportStagings?: FAAImportComparisonModel[]) => {
    if (!faaImportStagings?.length && !isMergeAll) {
      return;
    }
    const selectedFilter = searchHeader.selectInputsValues.get(otherOptionKey);
    const message = !Utilities.isEqual(selectedFilter, FAA_IMPORT_DATA_FILTERS.ALL) ? `all ${selectedFilter}` : 'All';
    const isMany = isMergeAll || (Array.isArray(faaImportStagings) && faaImportStagings.length > 1);
    ModalStore.open(
      <ConfirmDialog
        title={`Confirm merge ${isMergeAll ? message : ''} Record${isMany ? 's' : ''}`}
        message={`Are you sure you want to merge the  ${isMergeAll ? message : 'selected FAA'} record${
          isMany ? 's' : ''
        }?`}
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          mergeRecords(isMergeAll, faaImportStagings);
          ModalStore.close();
        }}
      />
    );
  };

  // Return Merge APi endpoint for different cases
  const getMergeAPi = (isMergeAll: boolean, fAAImportStagingIds: number[]) => {
    return isMergeAll
      ? airportStore?.mergeAllFAARecords(params.processId, entityType)
      : airportStore?.mergeSelectedFaaRecord(fAAImportStagingIds, params.processId, entityType);
  };

  /* istanbul ignore next */
  const mergeRecords = (isMergeAll: boolean, faaImportStagings?: FAAImportComparisonModel[]) => {
    const fAAImportStagingIds: number[] = faaImportStagings
      ?.filter(x => !Utilities.isEqual(x.faaMergeStatus, FAA_MERGE_STATUS.MERGED))
      .map(faaImport => faaImport.id) as number[];

    UIStore.setPageLoader(true);
    getMergeAPi(isMergeAll, fAAImportStagingIds)
      ?.pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          loadInitialData();
          gridState.gridApi.deselectAll();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  const title = (): string => {
    const { selectedFaaImportProcess } = airportStore as AirportStore;
    const date = Utilities.getformattedDate(selectedFaaImportProcess.processDate, DATE_FORMAT.API_DATE_FORMAT);
    return [ selectedFaaImportProcess.blobName, date, selectedFaaImportProcess.modifiedBy ].join(' - ');
  };

  const columnDefs: ColDef[] = [
    {
      headerCheckboxSelection: () => gridState.allowSelectAll,
      checkboxSelection: ({ data }) => !Utilities.isEqual(data?.faaMergeStatus, FAA_MERGE_STATUS.MERGED),
      maxWidth: 60,
      headerName: '',
      hide: !airportModuleSecurity.isEditable,
      field: 'checkbox',
      sortable: false,
      suppressMenu: true,
    },
    {
      headerName: 'Source Location Id',
      field: 'sourceLocationId',
      hide: props.isRunwayBySourceLocation,
    },
    {
      headerName: 'ICAO',
      field: 'icao',
      hide: props.isRunwayBySourceLocation,
    },
    {
      headerName: 'Airport Name',
      field: 'airportName',
      hide: props.isRunwayBySourceLocation,
    },
    {
      headerName: 'Runway Id',
      field: 'runwayId',
      hide: !isRunway,
    },
    {
      headerName: 'City Name',
      field: 'cityName',
      hide: isRunway,
    },
    {
      headerName: 'State Name',
      field: 'stateName',
      hide: isRunway,
    },
    {
      headerName: 'FAA Merge Status',
      field: 'faaMergeStatus',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (_, rowNode) => {
          return <FaaMergedStatus data={rowNode?.data} fieldKey="faaMergeStatus" />;
        },
      },
    },
    {
      headerName: 'Comparison Type',
      field: 'faaComparisonType',
      valueFormatter: ({ value }) => comparisonType[value],
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: 'Action',
      minWidth: 170,
      cellRenderer: 'viewRenderer',
      filter: false,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) => (
          <FAAActionButtons
            data={data}
            isFrequency={isFrequency}
            hasSelectedRows={gridState.hasSelectedRows}
            onMergeRecords={() => confirmMergeChanges(false, [ data ])}
            onViewDetails={() => {
              searchHeader.saveSearchFilters(gridState)
              // If Runway is Location Specific then
              if (props.isRunwayBySourceLocation) {
                // i.e airports/import-faa/392/638161902829535196/runways/3614579/50296.01*A/review-details
                navigate(
                  `/${faaBasePath}/airports/${data.id}/${data.sourceLocationId}/review-details/runways/source-location/review-details`
                );
                return;
              }
              navigate(`${data.id}/${data.sourceLocationId}/review-details`);
            }}
          />
        ),
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({ context: this, columnDefs });
    return {
      ...baseOptions,
      rowSelection: 'multiple',
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
      },
      onGridReady: e => {
        agGrid.onGridReady(e);
        SearchStore.applyDefaultSortFilter(location.pathname, gridState.gridApi);
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!airportModuleSecurity.isEditable) {
      return null;
    }

    return (
      <>
        <PrimaryButton
          disabled={!gridState.hasSelectedRows}
          variant="contained"
          color="primary"
          onClick={() => confirmMergeChanges(false, gridState.gridApi.getSelectedRows())}
        >
          Merge Selected
        </PrimaryButton>
        <ViewPermission hasPermission={!Boolean(props.isRunwayBySourceLocation)}>
          <PrimaryButton
            disabled={disableMergeAllButton()}
            variant="contained"
            color="primary"
            onClick={() => confirmMergeChanges(true)}
          >
            Merge All
          </PrimaryButton>
        </ViewPermission>
      </>
    );
  };

  return (
    <DetailsEditorWrapper
      headerActions={
        <DetailsEditorHeaderSection
          title={title()}
          isEditMode={false}
          useHistoryBackNav={true}
          backNavTitle="Back"
          classes={{ title: classes.title, titleContainer: classes.titleContainer }}
          showBreadcrumb={true}
        />
      }
      isEditMode={false}
      isBreadCrumb={true}
    >
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={frequencyAirportOptions(isRunway, props.isRunwayBySourceLocation)}
        isChipInputControl={isStatusFilter}
        chipInputProps={{
          options: isStatusFilter ? mergeStatusOptions : [],
          allowOnlySingleSelect: true,
        }}
        onSearch={(sv) => loadInitialData()}
        onSelectionChange={(fieldKey, updatedValue) => searchHeader.onSelectionChange(fieldKey, updatedValue, true)}
        onFiltersChanged={() => loadInitialData({ pageNumber: gridState.pagination.pageNumber })}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        classes={{ customHeight: classes.customHeight }}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('airportStore', 'sidebarStore')(observer(FAAFileDetails));

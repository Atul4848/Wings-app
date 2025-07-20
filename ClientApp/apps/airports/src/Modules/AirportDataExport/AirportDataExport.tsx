import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { DownloadIcon } from '@uvgo-shared/icons';
import { useUnsubscribe } from '@wings-shared/hooks';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './AirportDataExport.styles';
import {
  AIRPORT_DATA_EXPORT,
  AIRPORT_DATA_EXPORT_STATUS,
  AirportDataExportModel,
  AirportSettingsStore,
  airportSidebarOptions,
  AirportStore,
  RequestedReportTypeModel,
  useAirportModuleSecurity,
} from '../Shared';
import {
  UIStore,
  IAPIPageResponse,
  Utilities,
  DATE_FORMAT,
  ViewPermission,
  IAPIGridRequest,
  GridPagination,
} from '@wings-shared/core';
import { AxiosError } from 'axios';
import { gridFilters } from './field';
import { AlertStore } from '@uvgo-shared/alert';
import { SidebarStore } from '@wings-shared/layout';
import { ColDef, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import UpsertAirportDataDialog from './UpsertAirportDataDialog/UpsertAirportDataDialog';
import { CustomAgGridReact, useGridState, useAgGrid, agGridUtilities } from '@wings-shared/custom-ag-grid';

type Props = {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
};

const AirportDataExport: FC<Props> = ({ ...props }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRPORT_DATA_EXPORT, AirportDataExportModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const searchHeader = useSearchHeader();
  const airportModuleSecurity = useAirportModuleSecurity();
  const _airportStore = props.airportStore as AirportStore;
  const _airportSettingsStore = props.airportSettingsStore as AirportSettingsStore;

  useEffect(() => {
    props.sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    loadInitialData();
  }, []);

  const filterCollection = (): IAPIGridRequest => {
    const filterValue = searchHeader.chipValue?.map(x => x.id)[0];
    if (!Boolean(filterValue)) {
      return {};
    }
    return {
      filterCollection: JSON.stringify([{ airportDataExportRequestStatusId: filterValue }]),
    };
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...filterCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
    };
    UIStore.setPageLoader(true);
    _airportStore
      .getAirportDataExports(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
      });
  };

  /* istanbul ignore next */
  const downloadAirportDataFile = (data: RequestedReportTypeModel): void => {
    UIStore.setPageLoader(true);
    _airportStore
      .downloadAirportDataExportFile(data?.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (file: File) => {
          const url = window.URL.createObjectURL(new Blob([ file ]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', data?.fileUrl);
          // Append to html link element page
          document.body.appendChild(link);
          // Start download
          link.click();
          // Clean up and remove the link
          link.parentNode?.removeChild(link);
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const openUpsertDialog = (): void => {
    ModalStore.open(
      <UpsertAirportDataDialog
        airportStore={_airportStore}
        airportSettingsStore={_airportSettingsStore}
        onSaveAction={response => {
          gridState.gridApi.applyTransaction({ add: [ response ], addIndex: 0 });
          gridState.gridApi.redrawRows();
        }}
      />
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Report Id',
      field: 'id',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      hide: true,
      sortable: false,
      valueFormatter: ({ value }) => Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      hide: true,
      sortable: false,
      valueFormatter: ({ value }) => Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
    },
    {
      headerName: 'Status',
      field: 'airportDataExportRequestStatus',
      cellRenderer: 'statusRenderer',
    },
    ...agGrid.auditFields(false),
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });
    return {
      ...baseOptions,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        gridState.columnApi.setColumnGroupOpened('auditDetails', true);
      },
      onFilterChanged: () => loadInitialData(),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadInitialData({ pageNumber: 1 });
      },
      isExternalFilterPresent: () => false,
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            {
              headerName: 'Report Type',
              field: 'airportDataExportReportType',
              valueFormatter: ({ value }) => value?.name,
            },
            {
              headerName: 'Link',
              field: 'fileUrl',
              cellRenderer: 'viewRenderer',
              cellRendererParams: {
                getViewRenderer: (rowIndex: number, { data }: RowNode) => {
                  const { airportDataExportRequestStatusId } = data.airportDataExportRequestStatus;
                  if (Utilities.isEqual(airportDataExportRequestStatusId, AIRPORT_DATA_EXPORT_STATUS.FAILED)) {
                    return null;
                  }
                  return (
                    data?.fileUrl && (
                      <PrimaryButton
                        className={classes.link}
                        disabled={UIStore.pageLoading}
                        endIcon={<DownloadIcon />}
                        onClick={() => downloadAirportDataFile(data)}
                      >
                        {data?.fileUrl}
                      </PrimaryButton>
                    )
                  );
                },
              },
            },
            {
              headerName: 'Status',
              field: 'airportDataExportRequestStatus',
              cellRenderer: 'statusRenderer',
              cellRendererParams: {
                getTooltip: node => node.data?.errorMessage,
              },
            },
          ],
          defaultColDef: { flex: 1, resizable: true },
          frameworkComponents: {
            ...baseOptions.frameworkComponents,
          },
        },
        getDetailRowData: function(params) {
          params.successCallback(params.data?.airportDataExportRequestedReportTypes);
        },
      },
    };
  };

  /* istanbul ignore next */
  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          disabled={UIStore.pageLoading}
          startIcon={<DownloadIcon />}
          onClick={openUpsertDialog}
        >
          Export Data
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        selectInputs={[ agGridUtilities.createSelectOption(AIRPORT_DATA_EXPORT, AIRPORT_DATA_EXPORT.STATUS) ]}
        disableControls={gridState.isRowEditing}
        isChipInputControl={true}
        chipInputProps={{
          options: _airportSettingsStore.requestStatus,
          allowOnlySingleSelect: true,
          onFocus: () => _airportSettingsStore.loadRequestStatus().subscribe(),
        }}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
        onResetFilterClick={loadInitialData}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={request => loadInitialData(request)}
      />
    </>
  );
};

export default inject('airportStore', 'airportSettingsStore', 'sidebarStore')(observer(AirportDataExport));

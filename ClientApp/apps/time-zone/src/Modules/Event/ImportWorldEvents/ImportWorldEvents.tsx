import React, { FC, ReactNode, useEffect } from 'react';
import { ButtonBase } from '@material-ui/core';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  RowNode,
  FilterChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import {
  CustomAgGridReact,
  STATUS_BADGE_TYPE,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import {
  DATE_FORMAT,
  Utilities,
  UIStore,
  IAPIGridRequest,
  IAPIPageResponse,
  GridPagination,
  ViewPermission,
} from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { EventStore, IMPORT_STATUS_FILTER, ImportWorldEventModel, updateTimezoneSidebarOptions } from '../../Shared';
import { ImportDialog, SidebarStore } from '@wings-shared/layout';
import ImportErrorsDialog from './ImportErrorsDialog/ImportErrorsDialog';
import { AlertStore } from '@uvgo-shared/alert';
import { useStyles } from './ImportWorldEvents.styles';
import { RefreshIcon } from '@uvgo-shared/icons';
import { CloudDownload, CloudUpload } from '@material-ui/icons';
import { importEventsGridFilters, statusOptions, status } from './fields';
import { StatusBadge } from '@uvgo-shared/status-badges';
import { useGeographicModuleSecurity } from '../../Shared/Tools';

interface Props {
  eventStore?: EventStore;
  sidebarStore?: typeof SidebarStore;
}

const ImportWorldEvents: FC<Props> = ({ eventStore, sidebarStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<IMPORT_STATUS_FILTER, ImportWorldEventModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _eventStore = eventStore as EventStore;
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('Import World Events'), 'geographic');
    loadImportedEvents();
  }, []);

  // If Filter Type is Status then we needs to display status options in chip
  const isStatusFilter = Utilities.isEqual(
    searchHeader.getFilters().selectInputsValues.get('defaultOption'),
    IMPORT_STATUS_FILTER.STATUS
  );

  const getBadgeType = (value: number): STATUS_BADGE_TYPE => {
    return value === 1
      ? STATUS_BADGE_TYPE.PROGRESS
      : value === 2
        ? STATUS_BADGE_TYPE.ACCEPTED
        : STATUS_BADGE_TYPE.REJECTED;
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'File Name',
      field: 'blobName',
    },
    {
      headerName: 'Process Date',
      field: 'processDate',
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_TIME_FORMAT_WITH_MERIDIAN) || '',
    },
    {
      headerName: 'Status',
      field: 'worldEventImportStatus',
      cellRenderer: 'viewRenderer',
      valueFormatter: ({ value }: ValueFormatterParams) => status[value],
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, { data }: RowNode) => (
          <StatusBadge
            type={getBadgeType(data.worldEventImportStatus)}
            label={status[data.worldEventImportStatus]}
            isAutoWidth={true}
          />
        ),
      },
    },
    {
      headerName: 'Total Count',
      field: 'totalCount',
    },
    {
      headerName: 'Error Count',
      field: 'errorCount',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => (
          <ButtonBase
            className={classes?.button}
            onClick={() => ModalStore.open(<ImportErrorsDialog runId={node.data.runId} eventStore={_eventStore} />)}
          >
            {node.data.errorCount}
          </ButtonBase>
        ),
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing, false),
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs: columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        sortable: false,
      },
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: (events: FilterChangedEvent) => {
        loadImportedEvents();
      },
    };
  };

  /* istanbul ignore next */
  const uploadEventData = (file: File): void => {
    UIStore.setPageLoader(true);
    _eventStore
      ?.uploadEventData(file)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          ModalStore.close();
        })
      )
      .subscribe({
        next: response => {
          if (response) {
            AlertStore.info('Events Imported Successfully');
            loadImportedEvents();
          }
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const downloadEventsTemplate = (): void => {
    UIStore.setPageLoader(true);
    _eventStore
      ?.downloadWorldEventTemplate()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((file: File) => {
        const url = window.URL.createObjectURL(new Blob([ file ]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'WorldEvent.xlsx');

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });
  };

  /* istanbul ignore next */
  const openImportEventDialog = (): void => {
    ModalStore.open(
      <ImportDialog
        classes={{ paperSize: classes.paperSize }}
        title="Import Events"
        fileType="csv"
        isLoading={() => gridState.isRowEditing}
        onUploadFile={file => uploadEventData(file)}
      />
    );
  };

  /* istanbul ignore next */
  const _searchFilters = (): IAPIGridRequest => {
    if (!searchHeader) {
      return {};
    }
    const chip = searchHeader.getFilters().chipValue?.valueOf();

    // Match Selected Option From Header
    const property = importEventsGridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType as string, searchHeader.getFilters().selectInputsValues.get('defaultOption'))
    );

    const searchFilterKey = property?.columnId || '';

    const worldEventImportStatus = searchHeader.getFilters().searchValue
      ? { [searchFilterKey]: searchHeader.getFilters().searchValue }
      : Boolean(chip)
        ? { worldEventImportStatus: chip[0]?.value }
        : null;

    return {
      filterCollection: JSON.stringify([
        { blobName: searchHeader.getFilters().searchValue, ...worldEventImportStatus },
      ]),
    };
  };

  /* istanbul ignore next */
  const loadImportedEvents = (pageRequest?: IAPIGridRequest): void => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ..._searchFilters(),
    };
    UIStore.setPageLoader(true);
    _eventStore
      ?.getExportedEvents(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setGridData(response.results);
        gridState.setPagination(new GridPagination({ ...response }));
      });
  };

  // right content for search header
  const rightContent = (): ReactNode => {
    return (
      <>
        <ViewPermission hasPermission={geographicModuleSecurity.isEventEditable}>
          <PrimaryButton
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => loadImportedEvents()}
          >
            Refresh
          </PrimaryButton>
        </ViewPermission>
        <PrimaryButton variant="contained" startIcon={<CloudDownload />} onClick={downloadEventsTemplate}>
          Download Template
        </PrimaryButton>
        <ViewPermission hasPermission={geographicModuleSecurity.isEventEditable}>
          <PrimaryButton
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            onClick={openImportEventDialog}
            disabled={gridState.isProcessing}
          >
            Import Event
          </PrimaryButton>
        </ViewPermission>
      </>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(IMPORT_STATUS_FILTER, IMPORT_STATUS_FILTER.NAME, 'defaultOption'),
        ]}
        isChipInputControl={isStatusFilter}
        chipInputProps={{
          options: isStatusFilter ? statusOptions : [],
          allowOnlySingleSelect: true,
        }}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={loadImportedEvents}
        onSearch={sv => loadImportedEvents()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadImportedEvents}
        gridOptions={gridOptions()}
      />
    </>
  );
};

export default inject('eventStore', 'sidebarStore')(observer(ImportWorldEvents));

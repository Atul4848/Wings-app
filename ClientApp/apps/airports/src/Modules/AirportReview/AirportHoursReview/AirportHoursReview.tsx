import React, { FC, useEffect, useState } from 'react';
import {
  AirportHourReviewModel,
  AirportHoursStore,
  AirportSettingsStore,
  airportSidebarOptions,
  AirportStore,
  REVIEW_COMPARISON_FILTERS,
  useAirportModuleSecurity,
} from '../../Shared';
import { EDITOR_TYPES, IViewInputControl, SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IClasses,
  UIStore,
  Utilities,
} from '@wings-shared/core';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { Grid } from '@material-ui/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { SidebarStore } from '@wings-shared/layout';
import { inject, observer } from 'mobx-react';
import { useStyles } from '../AirportReview.styles';
import {
  STAGING_REVIEW_COMPARISION_TYPE,
  STAGING_REVIEW_STATUS,
  StagingFieldsRenderer,
  UplinkRejectionNotes,
  UplinkReviewActions,
  VIEW_MODE,
} from '@wings/shared';
import {
  getAirportHourReviewGridData,
  comparisonType,
  fields,
  isDataMerged,
  isDataRejected,
  mergeStatus,
  mergeStatusOptions,
} from '../fields';
import { useNavigate } from 'react-router-dom';
import ConditionsReview from './ConditionsReview';

interface Props {
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
  airportHoursStore?: AirportHoursStore;
}

const AirportHoursReview: FC<Props> = ({ airportStore, airportHoursStore, airportSettingsStore, sidebarStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<REVIEW_COMPARISON_FILTERS, AirportHourReviewModel>([], gridState);
  const [ entityOptions, setEntityOptions ] = useState([]);
  const _airportStore = airportStore as AirportStore;
  const _airportHoursStore = airportHoursStore as AirportHoursStore;
  const _airportSettingsStore = airportSettingsStore as AirportSettingsStore;
  const _useConfirmDialog = useConfirmDialog();
  const navigate = useNavigate();
  const searchHeader = useSearchHeader();
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  useEffect(() => {
    _sidebarStore?.setNavLinks(airportSidebarOptions(true), '/airports');
    _airportSettingsStore.loadRejectionReason().subscribe();
    searchHeader.restoreSearchFilters(gridState, () => loadInitialData());

    loadInitialData();
  }, []);

  useEffect(() => {
    loadEntityOptions();
  }, [ searchHeader.searchType, searchHeader.searchValue ]);

  /* istanbul ignore next */
  const getFilterPropertyName = (selectedOption): any => {
    switch (selectedOption) {
      case REVIEW_COMPARISON_FILTERS.AIRPORT:
        return 'airportId';
      case REVIEW_COMPARISON_FILTERS.AIRPORT_HOURS_TYPE:
        return 'airportHourTypeId';
      case REVIEW_COMPARISON_FILTERS.APPROVAL_STATUS:
        return 'mergeStatusId';
    }
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const { searchType, chipValue } = searchHeader;
    const _searchValue = chipValue.map(x => {
      return Utilities.isEqual(searchType, REVIEW_COMPARISON_FILTERS.APPROVAL_STATUS) ? x.value : x.id;
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
    const _searchValue = searchHeader.getFilters().searchValue;
    const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');

    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...filterCollection(),
      ...agGrid.filtersApi.getSearchFilters(_searchValue, _selectedOption),
      ...agGrid.filtersApi.gridSortFilters(),
    };
    UIStore.setPageLoader(true);
    _airportStore
      .getAirportHoursReview(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(tableData => {
        const transformedData = getAirportHourReviewGridData(tableData.results, [ 1 ], false);
        gridState.setGridData(transformedData);
        gridState.setPagination(new GridPagination({ ...tableData }));
        const selectAll = gridState.data.some(x => !Utilities.isEqual(x.faaMergeStatus, STAGING_REVIEW_STATUS.MERGED));
        gridState.setAllowSelectAll(selectAll);
      });
  };

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    let observableOf;

    switch (searchHeader.searchType) {
      case REVIEW_COMPARISON_FILTERS.APPROVAL_STATUS:
        setEntityOptions(mergeStatusOptions as any);
        break;

      case REVIEW_COMPARISON_FILTERS.AIRPORT_HOURS_TYPE:
        if (_airportSettingsStore.airportHourSubTypes) {
          observableOf = _airportSettingsStore.loadAirportHourTypes();
        }
        break;

      case REVIEW_COMPARISON_FILTERS.AIRPORT:
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

  const isValidValue = (value) =>
    Array.isArray(value)
      ? value.length > 0
      : value && typeof value === 'object'
        ? Object.keys(value).length > 0
        : Boolean(value);
  
  const toArray = (value) =>
    Array.isArray(value) ? value : value != null ? [ value ] : [];  
  
  const renderAirportHourTimes = (oldValue, newValue) => (
    <Grid container>
      <Grid item xs={12}>
        <StagingFieldsRenderer
          title="Start Time"
          oldValue={toArray(oldValue)}
          newValue={toArray(newValue)}
          formatFn={(item) =>
            item?.startTime?.time
              ? Utilities.getformattedDate(item.startTime.time, DATE_FORMAT.API_TIME_FORMAT)
              : '-'
          }
        />
      </Grid>
      <Grid item xs={12}>
        <StagingFieldsRenderer
          title="End Time"
          oldValue={toArray(oldValue)}
          newValue={toArray(newValue)}
          showHeaders={false}
          formatFn={(item) =>
            item?.endTime?.time
              ? Utilities.getformattedDate(item.endTime.time, DATE_FORMAT.API_TIME_FORMAT)
              : '-'
          }
        />
      </Grid>
    </Grid>
  );

  const dialogContent = (data, hasConditions) => {
    const items = Array.isArray(data.results) ? data.results : [];
    if (hasConditions) {
      return <ConditionsReview data={items} />;
    }

    const fieldConfig = {
      'Schedule.AirportHourTimes': {
        title: 'Airport Operating Hours',
      },
      'Schedule.PatternedRecurrence.RecurrencePattern.DaysOfWeeks': {
        title: 'Recurring Days of Week',
        formatFn: (item) => item?.dayOfWeek?.name ?? '',
      },
    };
  
    const firstValidItem = items.find(({ oldValue, newValue }) =>
      isValidValue(oldValue) || isValidValue(newValue)
    );
  
    if (!firstValidItem) return null;
  
    const { oldValue = {}, newValue = {}, propertyName } = firstValidItem;
    const config = fieldConfig[propertyName];
  
    if (!config) return null;
  
    if (propertyName === 'Schedule.AirportHourTimes') {
      return renderAirportHourTimes(oldValue, newValue);
    }
  
    return (
      <Grid container>
        <Grid item xs={12}>
          <StagingFieldsRenderer
            title={config.title}
            oldValue={toArray(oldValue)}
            newValue={toArray(newValue)}
            formatFn={config.formatFn}
          />
        </Grid>
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
    const hasConditions = Utilities.isEqual(data.propertyName, 'Conditions');
    UIStore.setPageLoader(true);
    _airportStore
      ?.getAirportHoursReviewList(data.uplinkStagingPropertyId)
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
              dialogContent={() => dialogContent(response, hasConditions)}
              disableBackdropClick={true}
            />
          );
        },
        error: error => {
          customErrorMessage(error, data.uplinkStagingPropertyId);
        },
      });
  };

  const confirmApprove = (data: AirportHourReviewModel): void => {
    _useConfirmDialog.confirmAction(
      () => {
        approveRecord(data), ModalStore.close();
      },
      {
        title: 'Confirm Action',
        message: 'Are you sure you want to approve the changes?',
      }
    );
  };

  const upsertRejectionReason = (rejection, data) => {
    UIStore.setPageLoader(true);
    const request = {
      uplinkStagingId: data?.airportHourStagingId,
      rejectionReasonId: rejection.rejectionReason?.id,
      rejectionNotes: rejection.rejectionNotes,
    };

    airportStore
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
          customErrorMessage(error, data.id);
        },
      });
  };

  const openRejectionNotesDialog = (viewMode: VIEW_MODE, data): void => {
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
        onDataSave={onSave => upsertRejectionReason(onSave, data)}
      />
    );
  };

  const approveRecord = (data): void => {
    UIStore.setPageLoader(true);
    const request = {
      uplinkStagingId: data?.airportHourStagingId,
    };

    airportStore
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
          customErrorMessage(error, data.id);
        },
      });
  };

  const isDataDisabled = data => {
    if (isDataMerged(data.mergeStatus) || isDataRejected(data.mergeStatus)) {
      return true;
    }
    if (
      (Utilities.isEqual(data.comparisionType, STAGING_REVIEW_COMPARISION_TYPE.ADDED) && data.airportHourStagingId) ||
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
        approveRejectPermission={airportModuleSecurity.isEditable && data.airportHourStagingId}
        viewDetailsPermission={airportModuleSecurity.isEditable && data.isList}
        disabledApproveReject={isDisabled}
        onApprove={() => confirmApprove(data)}
        onReject={() => openRejectionNotesDialog(VIEW_MODE.EDIT, data)}
        onViewDetails={() => getApprovalsData(data)}
      />
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Airport Hour Type',
      field: 'airportHoursType',
      minWidth: 100,
      valueFormatter: ({ value }) => value?.name || '',
      headerTooltip: 'Airport Hour Type',
    },
    {
      headerName: 'Sequence ID',
      field: 'cappsSequenceId',
      headerTooltip: 'Sequence ID',
      minWidth: 80,
    },
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
      valueFormatter: ({ data }) => {
        return data?.airportHourStagingId ? comparisonType[data?.comparisionType] : '';
      },
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
      getDataPath: data => {
        return data.path;
      },
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Airport',
        field: 'airport',
        minWidth: 180,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
        valueFormatter: ({ data }) => {
          return data?.airport.label || '';
        },
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(
            REVIEW_COMPARISON_FILTERS,
            REVIEW_COMPARISON_FILTERS.AIRPORT,
            'defaultOption'
          ),
        ]}
        isChipInputControl={true}
        chipInputProps={{
          options: entityOptions,
          allowOnlySingleSelect: true,
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
  'airportStore',
  'airportSettingsStore',
  'airportHoursStore',
  'sidebarStore'
)(observer(AirportHoursReview));

import React, { FC, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { UIStore, Utilities, IAPIGridRequest, GridPagination, GRID_ACTIONS, IdNameCodeModel } from '@wings-shared/core';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { useSearchHeader, SearchHeaderV3 } from '@wings-shared/form-controls';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import {
  EventStore,
  REVIEW_COMPARISON_FILTERS,
  TimeZoneSettingsStore,
  updateTimezoneSidebarOptions,
  WorldEventsReviewModel,
} from '../Shared';
import { useGeographicModuleSecurity } from '../Shared/Tools';
import { SidebarStore } from '@wings-shared/layout';
import { useStyles } from './WorldEventsReview.styles';
import { Grid, Typography } from '@material-ui/core';
import { comparisonType, getGridData, isDataMerged, isDataRejected, mergeStatus, mergeStatusOptions } from './fields';
import { observable } from 'mobx';
import {
  STAGING_REVIEW_COMPARISION_TYPE,
  STAGING_REVIEW_STATUS,
  StagingFieldsRenderer,
  UplinkReviewActions,
} from '@wings/shared';

interface Props {
  eventStore?: EventStore;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const WorldEventsReview: FC<Props> = ({ eventStore, timeZoneSettingsStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<REVIEW_COMPARISON_FILTERS, WorldEventsReviewModel>([], gridState);
  const [ entityOptions, setEntityOptions ] = useState([]);
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _eventStore = eventStore as EventStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const _useConfirmDialog = useConfirmDialog();
  const worldEventName = observable({
    isStatusFilter: Utilities.isEqual(
      searchHeader.getFilters().selectInputsValues.get('defaultOption'),
      REVIEW_COMPARISON_FILTERS.NAME
    ),
  });
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateTimezoneSidebarOptions('World Events Review'), 'geographic');
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEntityOptions();
  }, [ searchHeader.getFilters().selectInputsValues.get('defaultOption'), searchHeader.getFilters().searchValue ]);

  /* istanbul ignore next */
  const getFilterPropertyName = (selectedOption): any => {
    switch (selectedOption) {
      case REVIEW_COMPARISON_FILTERS.WORLD_EVENT_TYPE:
        return 'worldEventTypeId';
      case REVIEW_COMPARISON_FILTERS.WORLD_EVENT_CATEGORY_TYPE:
        return 'worldEventCategoryId';
      case REVIEW_COMPARISON_FILTERS.APPROVAL_STATUS:
        return 'mergeStatusId';
    }
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest => {
    const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');
    if (Utilities.isEqual(_selectedOption, REVIEW_COMPARISON_FILTERS.NAME)) {
      if (!searchHeader.getFilters().searchValue) {
        return {};
      }
      return {
        filterCollection: JSON.stringify([{ ['name']: searchHeader.getFilters().searchValue }]),
      };
    }
    const searchChips: any = searchHeader.getFilters().chipValue?.valueOf();
    const _searchValue = searchChips.map(x => {
      return Utilities.isEqual(
        searchHeader.getFilters().selectInputsValues.get('defaultOption'),
        REVIEW_COMPARISON_FILTERS.APPROVAL_STATUS
      )
        ? x.value
        : x.id;
    });
    if (!_searchValue || _searchValue.length === 0) {
      return {};
    }
    return {
      filterCollection: JSON.stringify([{ [getFilterPropertyName(_selectedOption)]: _searchValue[0] }]),
    };
  };

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...filterCollection(),
    };
    UIStore.setPageLoader(true);
    _eventStore
      .getWorldEventReview(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(tableData => {
        const transformedData = getGridData(tableData.results, [ 1 ], false);
        gridState.setGridData(transformedData);
        gridState.setPagination(new GridPagination({ ...tableData }));
        const selectAll = gridState.data.some(x => !Utilities.isEqual(x.faaMergeStatus, STAGING_REVIEW_STATUS.MERGED));
        gridState.setAllowSelectAll(selectAll);
      });
  };

  const loadSettingsData = () => {
    const request: IAPIGridRequest = {
      pageSize: 0,
    };
    UIStore.setPageLoader(true);
    _eventStore
      .getRegions(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    let observableOf;
    switch (searchHeader.getFilters().selectInputsValues.get('defaultOption')) {
      case REVIEW_COMPARISON_FILTERS.APPROVAL_STATUS:
        setEntityOptions(mergeStatusOptions as any);
        break;

      case REVIEW_COMPARISON_FILTERS.WORLD_EVENT_TYPE:
        if (_timeZoneSettingsStore.worldEventTypes) {
          observableOf = _timeZoneSettingsStore.getWorldEventTypes();
        }
        break;

      case REVIEW_COMPARISON_FILTERS.WORLD_EVENT_CATEGORY_TYPE:
        if (_timeZoneSettingsStore.worldEventCategories) {
          observableOf = _timeZoneSettingsStore.getWorldEventCategory();
        }
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
        .subscribe(response => {
          setEntityOptions(response);
        });
    }
  };

  const ValueDisplay = ({ title, oldValue, newValue, formatFn, showHeaders = true }) => {
    return (
      <Grid container>
        {/* Title Column */}
        <Grid item xs={4}>
          {showHeaders && (
            <Typography variant="subtitle1" className={classes.boldSubtitle}>
              Name
            </Typography>
          )}
          <Typography variant="subtitle2">{title}</Typography>
        </Grid>
        {/* Old Value Column */}
        <Grid item xs={4}>
          {showHeaders && (
            <Typography variant="subtitle1" className={classes.boldSubtitle}>
              Old Value
            </Typography>
          )}
          {oldValue?.length > 0 ? (
            <Typography variant="subtitle2">{oldValue.map(formatFn).join(', ')}</Typography>
          ) : (
            <Typography>-</Typography>
          )}
        </Grid>
        {/* New Value Column */}
        <Grid item xs={4}>
          {showHeaders && (
            <Typography variant="subtitle1" className={classes.boldSubtitle}>
              New Value
            </Typography>
          )}
          {newValue?.length > 0 ? (
            <Typography variant="subtitle2">{newValue.map(formatFn).join(', ')}</Typography>
          ) : (
            <Typography>-</Typography>
          )}
        </Grid>
      </Grid>
    );
  };

  const renderValueDisplay = (title, dataSection, formatFn) => {
    const { oldValue, newValue } = dataSection || {};
    if (oldValue?.length > 0 || newValue?.length > 0) {
      return (
        <Grid item xs={12}>
          <StagingFieldsRenderer title={title} oldValue={oldValue} newValue={newValue} formatFn={formatFn} />
        </Grid>
      );
    }
    return null;
  };

  const dialogContent = data => {
    return (
      <Grid container>
        {renderValueDisplay('City', data?.worldEventCityLocations, item => item?.name || '')}
        {renderValueDisplay('Country', data?.worldEventCountryLocations, item => item?.name || '')}
        {renderValueDisplay('State', data?.worldEventStateLocations, item => item?.name || '')}
        {renderValueDisplay('Region', data?.worldEventRegionLocations, item => item?.name || '')}
        {renderValueDisplay(
          'Airport',
          data?.worldEventAirports,
          item => (item?.icaoCode ? `${item.airportName}(${item?.icaoCode})` : item.airportName) || ''
        )}
        {renderValueDisplay(
          'Special Considerations',
          data?.appliedWorldEventSpecialConsiderations,
          item => item?.worldEventSpecialConsideration?.name || ''
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
    _eventStore
      ?.getWorldEventReviewList(data.id)
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
          customErrorMessage(error, data.uplinkStagingPropertyId);
        },
      });
  };

  const ConfirmationModel = (data: WorldEventsReviewModel, isApprove: boolean): void => {
    _useConfirmDialog.confirmAction(
      () => {
        approveRejectRecord(data, isApprove), ModalStore.close();
      },
      {
        title: 'Confirm Action',
        message: `Are you sure you want to ${isApprove ? 'approve' : 'reject'} the changes?`,
      }
    );
  };

  const approveRejectRecord = (data, isApprove: boolean): void => {
    UIStore.setPageLoader(true);
    const request = {
      uplinkStagingId: data?.id,
    };
    const operationObservable = isApprove
      ? _eventStore?.approveWorldEventStaging(request)
      : _eventStore?.rejectWorldEventStaging(request);

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
          customErrorMessage(error, id);
        },
      });
  };

  const isDataDisabled = data => {
    if (isDataMerged(data.mergeStatus) || isDataRejected(data.mergeStatus)) {
      return true;
    }
    if (
      (Utilities.isEqual(data.comparisionType, STAGING_REVIEW_COMPARISION_TYPE.ADDED) && data.id) ||
      Utilities.isEqual(data.comparisionType, STAGING_REVIEW_COMPARISION_TYPE.MODIFIED)
    ) {
      return false;
    }
    return true;
  };

  const showEditIcon = data => {
    return (
      Utilities.isEqual('WorldEventRegionLocations', data.propertyName) &&
      (Utilities.isEqual(data?.mergeStatus, STAGING_REVIEW_STATUS.NOT_MERGED) ||
        Utilities.isEqual(data?.mergeStatus, STAGING_REVIEW_STATUS.FAILED))
    );
  };

  const reviewActions = (rowIndex: number, { data }: RowNode) => {
    const isDisabled = isDataDisabled(data);
    return (
      <UplinkReviewActions
        showEditIcon={geographicModuleSecurity.isEditable && showEditIcon(data)}
        onEdit={() => agGrid._startEditingCell(rowIndex, 'newValue')}
        approveRejectPermission={geographicModuleSecurity.isEditable && !data.worldEventStagingId}
        viewDetailsPermission={geographicModuleSecurity.isEditable && data.isList}
        disabledApproveReject={isDisabled}
        onApprove={() => ConfirmationModel(data, true)}
        onReject={() => ConfirmationModel(data, false)}
        onViewDetails={() => getApprovalsData(data)}
      />
    );
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'World Event Type',
      field: 'worldEventType',
      minWidth: 100,
      valueFormatter: ({ value }) => value?.name || '',
      headerTooltip: 'World Event Type',
      editable: false,
    },
    {
      headerName: 'World Event Category',
      field: 'worldEventCategory',
      headerTooltip: 'World Event Category',
      valueFormatter: ({ value }) => value?.name || '',
      minWidth: 80,
      editable: false,
    },
    {
      headerName: 'Property Name',
      field: 'propertyName',
      minWidth: 150,
      headerTooltip: 'Property Name',
      editable: false,
    },
    {
      headerName: 'Old Value',
      field: 'oldValue',
      minWidth: 150,
      headerTooltip: 'Old Value',
      editable: false,
    },
    {
      headerName: 'New Value',
      field: 'newValue',
      minWidth: 150,
      headerTooltip: 'New Value',
      valueFormatter: ({ value }) =>
        value === null ? [] : typeof value === 'object' ? JSON.stringify([ value ]) : value,
      cellEditor: 'customAutoComplete',
      cellEditorParams: {
        isRequired: true,
        getAutoCompleteOptions: () => _eventStore.regions,
        isLoading: () => UIStore.pageLoading,
        autoCompleteFormatValue: (value, { data }) => {
          if (!data) {
            return '';
          }
          if (data.propertyName === 'WorldEventRegionLocations') {
            const parsedValue = JSON.parse(data?.newValue);
            const newValue = parsedValue ? parsedValue[0] : null;

            return new IdNameCodeModel({
              id: newValue?.RegionId,
              name: newValue?.Name,
              code: newValue?.Code,
            });
          }
          return new IdNameCodeModel({
            id: data.newValueId,
            name: data.newValue,
            code: data.newValueCode,
          });
        },
      },
    },
    {
      headerName: 'Comparison Type',
      field: 'comparisionType',
      minWidth: 120,
      headerTooltip: 'Comparison Type',
      valueFormatter: ({ data }) => {
        return !data?.worldEventStagingId ? comparisonType[data?.comparisionType] : '';
      },
      editable: false,
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
    ...agGrid.auditFields(gridState.isRowEditing, false),
    {
      ...agGrid.actionColumn({
        cellRenderer: 'viewRenderer',
        maxWidth: 150,
        minWidth: 150,
        hide: !geographicModuleSecurity.isEditable,
        cellRendererParams: {
          getViewRenderer: reviewActions,
        },
      }),
    },
  ];

  const updateRegion = rowIndex => {
    gridState.gridApi.stopEditing();
    const rowData = agGrid._getTableItem(rowIndex) as any;
    const request = {
      uplinkStagingPropertyId: rowData.id,
      regionId: rowData.newValue.id,
      name: rowData.newValue.name,
      code: rowData.newValue.code,
    };
    UIStore.setPageLoader(true);
    _eventStore
      .updateWorldEventStaging(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => loadInitialData(),
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: geographicModuleSecurity.isEditable,
      gridActionProps: {
        getViewRenderer: reviewActions,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (rowIndex === null) {
            return;
          }
          if (action === GRID_ACTIONS.SAVE) {
            updateRegion(rowIndex);
            return;
          }
          gridState.gridApi.stopEditing(true);
        },
      },
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        sortable: false,
      },
      pagination: false,
      suppressScrollOnNewData: true,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressClickEdit: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      groupDefaultExpanded: 0, // Expand all groups by default
      getDataPath: data => {
        return data.path;
      },
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Name',
        field: 'name',
        minWidth: 180,
        editable: false,
        sortable: false,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
        valueFormatter: ({ data }) => {
          return data?.name || '';
        },
      },
      onRowEditingStarted: event => {
        agGrid.onRowEditingStarted(event);
        loadSettingsData();
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        placeHolder="Start typing to search"
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(REVIEW_COMPARISON_FILTERS, REVIEW_COMPARISON_FILTERS.NAME) ]}
        isChipInputControl={!worldEventName.isStatusFilter}
        chipInputProps={{
          options: !worldEventName.isStatusFilter ? entityOptions : [],
          allowOnlySingleSelect: true,
        }}
        onFiltersChanged={loadInitialData}
        onSearch={sv => loadInitialData()}
      />
      <CustomAgGridReact
        serverPagination={true}
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        gridOptions={gridOptions()}
        classes={{ customHeight: classes.customHeight }}
      />
    </>
  );
};

export default inject('eventStore', 'timeZoneSettingsStore', 'sidebarStore')(observer(WorldEventsReview));

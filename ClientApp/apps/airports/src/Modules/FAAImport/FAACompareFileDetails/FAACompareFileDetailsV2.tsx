import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useUnsubscribe } from '@wings-shared/hooks';
import { VIEW_MODE } from '@wings/shared';
import { ColDef, GridOptions, ICellEditorParams, RowEditingStartedEvent, RowNode } from 'ag-grid-community';
import { inject, observer, useLocalStore } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { of } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
import {
  AirportSettingsStore,
  AirportStore,
  FAAImportComparisonModel,
  faaImportReviewSidebarOptions,
  FaaPropertyTableViewModel,
  FAA_COMPARISON_TYPE,
  FAA_IMPORT_COMPARISON_FILTERS,
  FAA_IMPORT_EDITABLE_PROPERTIES,
  FAA_IMPORT_STAGING_ENTITY_TYPE,
  FAA_MERGE_STATUS,
  IAPIFaaImportStagingProperty,
  IAPIFAAMergeByAirport,
  FaaImportStagingTableModel,
  useAirportModuleSecurity,
} from '../../Shared';
import { FAAGridActions, FaaMergedStatus } from '../Components';
import { gridFilters } from '../fields';
import { useStyles } from './FAACompareFileDetails.styles';
import { apiSettingsData, getTitle, requiredDropdownFields, nonEditableFields, getCountryOrStateIds } from './FaaData';
import {
  getAssociatedProperty,
  getFieldRules,
  getGridData,
  getIsAutoComplete,
  getIsSelectInput,
  getSearchProperty,
  isDataMerged,
  getIsMultiSelect,
  mapModel,
  mapModelList,
} from './fields';
import {
  UIStore,
  Utilities,
  getBooleanToString,
  getStringToYesNoNull,
  getYesNoNullToBoolean,
  tapWithAction,
  ViewPermission,
  IdNameCodeModel,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmDialog, SidebarStore } from '@wings-shared/layout';
import {
  AgGridCellEditor,
  AgGridViewRenderer,
  AgGridActions,
  AgGridAutoComplete,
  AgGridGroupHeader,
  AgGridSelectControl,
  CustomAgGridReact,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';

type RouteParams = {
  id: string;
  viewMode: VIEW_MODE;
  processId: string;
  stagingTableId: string;
  sourceLocationId: string;
};

interface Props {
  state?: any; // Local state
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  sidebarStore?: typeof SidebarStore;
  entityType: FAA_IMPORT_STAGING_ENTITY_TYPE;
  isRunwayBySourceLocation?: boolean; // True if we are loading runways specific to source location Id
}

const FAACompareFileDetails: FC<Props> = ({ airportStore, sidebarStore, airportSettingsStore, ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<FAA_IMPORT_COMPARISON_FILTERS, FaaPropertyTableViewModel>(gridFilters, gridState);

  const unsubscribe = useUnsubscribe();
  const params = useParams() as RouteParams;
  const navigate = useNavigate();
  const classes = useStyles();
  const airportModuleSecurity = useAirportModuleSecurity();

  const state = useLocalStore(() => ({
    selectedStagingRecord: new FAAImportComparisonModel(),
    autoCompleteOptions: [],
    setSelectedStagingRecord: data => (state.selectedStagingRecord = data),
    setAutoCompleteOptions: data => (state.autoCompleteOptions = data),
  }));

  // 89814 editing and checkbox selection not allowed for removed records
  const isRemovedRecord = () =>
    Utilities.isEqual(state.selectedStagingRecord.faaComparisonType, FAA_COMPARISON_TYPE.DELETED);
  const isNewRecord = () => Utilities.isEqual(state.selectedStagingRecord.faaComparisonType, FAA_COMPARISON_TYPE.ADDED);
  const isNewOrRemovedRecord = () => isNewRecord() || isRemovedRecord();
  const isFrequency = () => Utilities.isEqual(props.entityType, FAA_IMPORT_STAGING_ENTITY_TYPE.FREQUENCY);
  const isRunways = () => Utilities.isEqual(props.entityType, FAA_IMPORT_STAGING_ENTITY_TYPE.RUNWAYS);

  useEffect(() => {
    // Show Runways List in Airport Review Screen
    const isAirport = props.entityType === FAA_IMPORT_STAGING_ENTITY_TYPE.AIRPORT;
    const options = faaImportReviewSidebarOptions(isAirport).filter(x => !x.isHidden);
    sidebarStore?.setNavLinks(options, faaBasePath());
    loadInitialData();
  }, []);

  const faaBasePath = (): string => {
    const { id, processId, stagingTableId, sourceLocationId } = params;

    // Checking if the URL contains 'source-location'
    const isSourceLocation = window.location.href.includes('source-location');
    // Setting the subPath accordingly
    const subPath = isSourceLocation
      ? '/airports'
      : isRunways()
        ? '/runways'
        : isFrequency()
          ? '/frequencies'
          : '/airports';

    const baseUrl = `airports/import-faa/${id}/${processId}${subPath}/${stagingTableId}/${sourceLocationId}`;
    return props.isRunwayBySourceLocation
      ? `${baseUrl}/review-details/runways/source-location/review-details`
      : `${baseUrl}/review-details`;
  };

  const disableMergeButton = (): boolean => {
    if (
      !airportModuleSecurity.isEditable ||
      gridState.isRowEditing ||
      isDataMerged(state.selectedStagingRecord.faaMergeStatus)
    ) {
      return true;
    }

    // If new or removed Records of Airports and Runways then enable merge button
    if (isNewOrRemovedRecord() && !isFrequency()) {
      return false;
    }

    return gridState.isRowEditing || !gridState.hasSelectedRows;
  };

  /* istanbul ignore next */
  const loadInitialData = () => {
    if (!airportStore) {
      return;
    }
    UIStore.setPageLoader(true);
    airportStore
      .getFAAImportComparisonById(params.stagingTableId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((tableData: FAAImportComparisonModel) => {
        if (!tableData) {
          return;
        }
        state.setSelectedStagingRecord(tableData);
        gridState.setGridData(getGridData(tableData.faaImportStagingTables, [ 1 ], false));
        const selectAll = gridState.data.some(x => !Utilities.isEqual(x.faaMergeStatus, FAA_MERGE_STATUS.MERGED));
        gridState.setAllowSelectAll(selectAll);

        // Hide old values for new records
        agGrid.setColumnVisible('oldValue', !isNewRecord());
        // 89814 Hide new Value For Removed Records
        agGrid.setColumnVisible('newValue', !isRemovedRecord());
        agGrid.reloadColumnState();
      });
  };

  const allowSelection = (faaMergeStatus: number): boolean => {
    if (isFrequency() && !isDataMerged(faaMergeStatus)) {
      return true;
    }
    if (gridState.isRowEditing || !airportModuleSecurity.isEditable || isNewOrRemovedRecord()) {
      return false;
    }
    return !isDataMerged(faaMergeStatus);
  };

  // onFocus load settings dropdown options
  const loadSettingsData = (node: RowNode): void => {
    if (!airportSettingsStore) {
      return;
    }

    const propertyName = node.data.propertyName?.split('.').pop();
    UIStore.setPageLoader(true);
    apiSettingsData(propertyName, airportSettingsStore)
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$),
        tapWithAction(response => state.setAutoCompleteOptions(response))
      )
      .subscribe();
  };

  // Search City State and other Files By Search
  const onSearch = (searchValue: string, node?: RowNode): void => {
    let observableOfType = of<any>([]);
    const propertyName = node?.data.propertyName
      ?.split('.')
      .pop()
      .toLowerCase();

    // No Need to Search For Settings Screen
    if (!Object.values(FAA_IMPORT_EDITABLE_PROPERTIES).includes(propertyName)) {
      return;
    }

    /* 88835 Pick Country or State Id from New UnMerged State or Country 
      if available else pick the merged country or state */
    const stagingTables =
      state.selectedStagingRecord.faaImportStagingTables.find(x => x.id === node?.data.parentTableId)
        ?.faaImportStagingProperties || [];

    const stateId =
      stagingTables.find(x => Utilities.isEqual(x.propertyName, getSearchProperty(node?.data.propertyName, 'state')))
        ?.newValueId || state.selectedStagingRecord.stateId;

    const countryId =
      stagingTables.find(x => Utilities.isEqual(x.propertyName, getSearchProperty(node?.data.propertyName, 'country')))
        ?.newValueId || state.selectedStagingRecord.countryId;

    // return if store not available
    if (!airportStore || !airportSettingsStore) {
      return;
    }

    switch (propertyName) {
      case FAA_IMPORT_EDITABLE_PROPERTIES.CITY:
        observableOfType = airportStore
          .searchCities({ searchValue, stateId, countryId }, true, true)
          .pipe(map(x => mapModelList(x, FAA_IMPORT_EDITABLE_PROPERTIES.CITY)));
        break;
      case FAA_IMPORT_EDITABLE_PROPERTIES.STATE:
        observableOfType = airportStore
          .searchStates({ searchValue, countryId })
          .pipe(map(x => mapModelList(x, FAA_IMPORT_EDITABLE_PROPERTIES.STATE)));
        break;
      case FAA_IMPORT_EDITABLE_PROPERTIES.COUNTRY:
        observableOfType = airportStore
          .searchCountries(searchValue)
          .pipe(map(x => mapModelList(x, FAA_IMPORT_EDITABLE_PROPERTIES.COUNTRY)));
        break;
      case FAA_IMPORT_EDITABLE_PROPERTIES.ICAO:
        observableOfType = airportSettingsStore
          .searchIcaoCode(searchValue)
          .pipe(map(x => mapModelList(x, FAA_IMPORT_EDITABLE_PROPERTIES.ICAO)));
        break;
      default:
        observableOfType = of([]);
        break;
    }
    UIStore.setPageLoader(true);
    observableOfType
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
        takeUntil(unsubscribe.destroy$),
        tapWithAction(response => state.setAutoCompleteOptions(response))
      )
      .subscribe();
  };

  const confirmMergeWithRunways = (): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Merge"
        message="Are you sure you want to merge the record with associated runways"
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          faaMergeWithAssociatedRunways();
        }}
      />
    );
  };

  // implemented as per 97347
  const faaMergeWithAssociatedRunways = (): void => {
    const { sourceLocationId } = state.selectedStagingRecord;
    const { stagingTableId, processId } = params;
    const request: IAPIFAAMergeByAirport = {
      sourceLocationId,
      processId,
      faaImportStagingId: parseInt(stagingTableId),
      mergeRunways: true,
    };
    UIStore.setPageLoader(true);
    airportStore
      ?.faaMergeWithAssociatedRunways(request)
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
        error: error => AlertStore.critical(error.message),
      });
  };

  const confirmMergeChanges = (
    faaImportStagings: FaaPropertyTableViewModel[],
    _isNewOrRemovedRecord?: boolean
  ): void => {
    if (!faaImportStagings?.length && !_isNewOrRemovedRecord) {
      return;
    }
    ModalStore.open(
      <ConfirmDialog
        title={`Confirm merge Record${faaImportStagings?.length > 1 ? 's' : ''}`}
        message={`Are you sure you want to merge the ${
          _isNewOrRemovedRecord && !isFrequency()
            ? 'Record'
            : `selected FAA record${faaImportStagings?.length > 1 ? 's' : ''}`
        }?`}
        yesButton="Yes"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          mergeRecords(faaImportStagings, Boolean(_isNewOrRemovedRecord));
        }}
      />
    );
  };

  /* istanbul ignore next */
  const mergeRecords = (selectedRows: FaaPropertyTableViewModel[], _isNewOrRemovedRecord: boolean): void => {
    const { faaImportStagingEntityType } = state.selectedStagingRecord;
    const { stagingTableId, processId } = params;

    // Filter Only Not merged Rows
    const mergeAbleRows = selectedRows.filter(x => !isDataMerged(x.faaMergeStatus));

    // Auto Select country or state based on city for modified records only
    // Auto Select country based on the state
    const countryOrStateIds = isNewOrRemovedRecord()
      ? mergeAbleRows
      : mergeAbleRows.concat(getCountryOrStateIds(mergeAbleRows, gridState.data));

    // Filter selected direct Tables id
    const tableIds = countryOrStateIds.filter(x => Boolean(x.tableName)).map(x => x.id);
    // Filter Properties by excluding parent tableIds if parent table selected then no need to get child properties
    const propertyIds = countryOrStateIds.filter(x => !Boolean(x.tableName) && !tableIds.includes(x.parentTableId));

    // Parent Tables and it's properties
    const parentTableIds = propertyIds
      .reduce(
        (total: number[], curr) => (total.includes(curr.parentTableId) ? total : total.concat(curr.parentTableId)),
        []
      )
      .concat(tableIds);

    const request = {
      faaImportStagingEntityType: faaImportStagingEntityType,
      faaImportProcessId: processId,
      faaImportStagingId: parseInt(stagingTableId),
      faaImportStagingTableAndProperties: parentTableIds
        .map(tableId => ({
          tableId,
          propertyIds: propertyIds.filter(x => x.parentTableId === tableId).map(x => x.id),
        }))
        .filter(x => x.tableId),
    };

    UIStore.setPageLoader(true);
    const mergeApi =
      _isNewOrRemovedRecord && !isFrequency()
        ? airportStore?.mergeSelectedFaaRecord([ request.faaImportStagingId ], processId, faaImportStagingEntityType)
        : airportStore?.faaMergeStagingTables(request);
    mergeApi
      ?.pipe(
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
        error: error => AlertStore.critical(error.message),
      });
  };

  /* istanbul ignore next */
  const callSaveChangesApi = (request: IAPIFaaImportStagingProperty[]): void => {
    if (!gridState.gridApi || !airportStore) {
      return;
    }
    UIStore.setPageLoader(true);
    airportStore
      .updateFaaRecord(request)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe(loadInitialData, error => {
        AlertStore.critical(error.message);
        UIStore.setPageLoader(false);
      });
  };

  /* istanbul ignore next */
  // implemented as per 93786
  const getEditRequestData = (rowIndex: number): IAPIFaaImportStagingProperty[] => {
    const faaRecord = agGrid._getTableItem(rowIndex);
    const stagingTableId = parseInt(params.stagingTableId);
    const isCityOrState = faaRecord.propertyName.includes('City') || faaRecord.propertyName.includes('State');
    // allow only city and state updates
    if (isCityOrState) {
      // Select Parent Table for City or State
      const selectedTable = state.selectedStagingRecord?.faaImportStagingTables?.find(
        x => x.id === faaRecord.parentTableId
      ) as FaaImportStagingTableModel;
      const cityRow = getAssociatedProperty(selectedTable, faaRecord, 'City');
      const stateRow = getAssociatedProperty(selectedTable, faaRecord, 'State');
      const countryRow = getAssociatedProperty(selectedTable, faaRecord, 'Country');
      const isEmptyState = Boolean(stateRow) && !Boolean(stateRow?.newValueId);
      const isEmptyCountry = Boolean(countryRow) && !Boolean(countryRow?.newValueId);

      // If State is being updated
      if (faaRecord.propertyName.includes('State')) {
        const country = airportStore?.states?.find(x => x.id === faaRecord?.newValue?.id)?.country;

        const cityRequest = new FaaPropertyTableViewModel({
          id: cityRow?.id,
          newValue: mapModel(null, FAA_IMPORT_EDITABLE_PROPERTIES.CITY),
        }).serialize(stagingTableId);

        const countryRequest = new FaaPropertyTableViewModel({
          id: countryRow?.id,
          newValue: mapModel(country, FAA_IMPORT_EDITABLE_PROPERTIES.COUNTRY),
        }).serialize(stagingTableId);

        return Boolean(cityRow?.newValueId) && Boolean(countryRow?.newValueId)
          ? [ cityRequest, faaRecord.serialize(stagingTableId) ]
          : isEmptyCountry
            ? [ faaRecord.serialize(stagingTableId), countryRequest ]
            : [ faaRecord.serialize(stagingTableId) ];
      }
      //if there is no empty state or country then only update City
      if (!isEmptyState && !isEmptyCountry) {
        return [ faaRecord.serialize(stagingTableId) ];
      }

      const cityObj = airportStore?.cities.find(_city => _city.id === faaRecord?.newValue?.id);

      const stateObj = new FaaPropertyTableViewModel({
        id: stateRow?.id,
        newValue: mapModel(cityObj?.state, FAA_IMPORT_EDITABLE_PROPERTIES.STATE),
      }).serialize(stagingTableId);

      const countryObj = new FaaPropertyTableViewModel({
        id: countryRow?.id,
        newValue: mapModel(cityObj?.country, FAA_IMPORT_EDITABLE_PROPERTIES.COUNTRY),
      }).serialize(stagingTableId);

      return isEmptyState && isEmptyCountry
        ? [ faaRecord.serialize(stagingTableId), stateObj, countryObj ]
        : isEmptyState
          ? [ faaRecord.serialize(stagingTableId), stateObj ]
          : [ faaRecord.serialize(stagingTableId), countryObj ];
    }
    return [ faaRecord?.serialize(stagingTableId) ];
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Old Value',
      field: 'oldValue',
      editable: false,
      valueFormatter: ({ data, value }) => {
        // If needs to use boolean value in select
        if (getIsSelectInput(data.propertyName)) {
          return getStringToYesNoNull(value);
        }
        return value || '';
      },
    },
    {
      headerName: 'New Value',
      field: 'newValue',
      editable: true,
      valueFormatter: ({ data, value }) => {
        // If needs to use boolean value in select
        if (getIsSelectInput(data.propertyName)) {
          return getStringToYesNoNull(value?.label || value);
        }
        return value?.label || '';
      },
      cellEditorSelector: ({ data }) => ({
        component: getIsAutoComplete(data.propertyName)
          ? 'customAutoComplete'
          : getIsSelectInput(data.propertyName)
            ? 'customSelect'
            : 'customCellEditor',
      }),
      cellEditorParams: {
        onSearch,
        airportStore,
        isRequired: ({ data }) => requiredDropdownFields.includes(data?.propertyName),
        getIsMultiSelect: ({ data }) => getIsMultiSelect(data?.propertyName),
        getAutoCompleteOptions: () => state.autoCompleteOptions,
        isLoading: () => UIStore.pageLoading,
        limitTags: () => 1,
        optionCompareKey: node => {
          if (getIsMultiSelect(node?.data.propertyName)) {
            return 'label';
          }
          return 'value';
        },
        selectValueFormatter: (name, node) => {
          return new IdNameCodeModel({ name: getBooleanToString(name) as string, id: null as any });
        },
        // format incoming value
        autoCompleteFormatValue: (value, node) => {
          if (getIsMultiSelect(node?.data.propertyName)) {
            return (value.label?.split(',') || []).map(key => new IdNameCodeModel({ name: key, id: null as any }));
          }
          return value;
        },
        // format outgoing value
        autoCompleteParseValue: (value, node) => {
          if (getIsMultiSelect(node?.data.propertyName)) {
            const stringObj = value ? (value.map(item => item.label) || []).join(', ') : '';
            return new IdNameCodeModel({ name: stringObj, id: null as any });
          }
          return value;
        },
        // format Outgoing Value
        parseValue: (value, node) => new IdNameCodeModel({ name: value, id: null as any }),
        // used By cell editor to format value into way it required in cell editor
        formatValue: (value, node) => {
          // If needs to use boolean value in select
          if (getIsSelectInput(node?.data?.propertyName)) {
            return getYesNoNullToBoolean(value?.label);
          }
          return value?.label;
        },
        getRules: (params: ICellEditorParams) => {
          return getFieldRules(params.data?.propertyName, state.selectedStagingRecord.faaImportStagingEntityType);
        },
        getLabel: (params: ICellEditorParams) => params.data?.propertyName,
        isBoolean: true,
      },
    },
    {
      headerName: 'FAA Merge Status',
      field: 'faaMergeStatus',
      editable: false,
      cellRenderer: 'actionViewRenderer',
      cellRendererParams: {
        getViewRenderer: (_, rowNode) => <FaaMergedStatus data={rowNode?.data} fieldKey="faaMergeStatus" />,
      },
    },
    {
      headerName: 'Actions',
      field: 'actionRenderer',
      cellRenderer: 'actionViewRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 140,
      minWidth: 140,
      sortable: false,
      filter: false,
      suppressSizeToFit: true,
      suppressNavigable: true,
      hide: !airportModuleSecurity.isEditable,
      cellStyle: { ...(cellStyle() as any) },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
        onInputChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
        onOptionChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
      },
      columnDefs: columnDefs,
      isEditable: airportModuleSecurity.isEditable,
      gridActionProps: {
        getDisabledState: () => gridState.hasError,
        getEditableState: () => gridState.isRowEditing,
        getViewRenderer: (rowIndex: number, { data }: RowNode) => {
          const hideEditButton = nonEditableFields.includes(data?.propertyName) || isRemovedRecord();
          return (
            <FAAGridActions
              data={data}
              hideMergeButton={isNewRecord() && !isFrequency()}
              disabled={isDataMerged(data.faaMergeStatus) || gridState.hasSelectedRows || UIStore.pageLoading}
              hideEditButton={hideEditButton}
              onMerge={() => confirmMergeChanges([ data ])}
              onEdit={() => agGrid._startEditingCell(rowIndex, 'newValue')}
            />
          );
        },
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (action === GRID_ACTIONS.SAVE) {
            gridState.gridApi.stopEditing();
            const request = getEditRequestData(rowIndex);
            callSaveChangesApi(request);
            return;
          }
          gridState.gridApi.stopEditing(true);
        },
      },
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      pagination: false,
      suppressClickEdit: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressScrollOnNewData: true,
      rowHeight: 40,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        sortable: false,
        cellEditor: '',
      },
      frameworkComponents: {
        customHeader: AgGridGroupHeader,
        customAutoComplete: AgGridAutoComplete,
        actionViewRenderer: AgGridViewRenderer,
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customSelect: AgGridSelectControl,
      },
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(params);
        loadSettingsData(params.node);
      },
      onRowEditingStopped: event => {
        state.setAutoCompleteOptions([]);
        agGrid.onRowEditingStopped();
        agGrid.reloadColumnState();
      },
      onCellFocused: ({ rowIndex }) => gridState.setClickedRowIndex(rowIndex as number),
      onRowSelected: ({ node, data, rowIndex }) => {
        // If row clicked dynamically then ignore event
        if (gridState.clickedRowIndex !== rowIndex) {
          gridState.setHasSelectedRows(Boolean(gridState.gridApi.getSelectedRows()?.length));
          return;
        }
        // If Parent Item is Selected then select it's all child's
        if (Boolean(data.tableName)) {
          gridState.gridApi
            .getRenderedNodes()
            .filter(x => x.data.parentTableId === data.id)
            .forEach(_node => _node.setSelected(Boolean(node.isSelected())));
          gridState.setHasSelectedRows(Boolean(gridState.gridApi.getSelectedRows()?.length));
          return;
        }

        // If All child's selected then select the parent
        const { parentTableId } = data;
        const selectedNodes = gridState.gridApi
          .getSelectedNodes()
          .filter(({ data }) => data.parentTableId === parentTableId && !Boolean(data.tableName));
        const renderedNodes = gridState.gridApi
          .getRenderedNodes()
          .filter(({ data }) => data.parentTableId === parentTableId && !Boolean(data.tableName));
        const parentNode = gridState.gridApi.getRenderedNodes().find(({ data }) => data.id === parentTableId);
        parentNode?.setSelected(selectedNodes.length === renderedNodes.length, false, false);
        gridState.setHasSelectedRows(Boolean(gridState.gridApi.getSelectedRows()?.length));
      },
      // Tree Data Props
      groupDefaultExpanded: -1,
      getDataPath: data => data.path,
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Name (Table / Property)',
        field: 'tableName',
        cellRenderer: 'agGroupCellRenderer',
        sortable: false,
        minWidth: 170,
        editable: false,
        headerCheckboxSelection: ({ data }: any) =>
          gridState.allowSelectAll ? allowSelection(data?.faaMergeStatus) : false,
        valueFormatter: ({ data }) => data?.formattedTableName || data?.propertyName || '',
        cellRendererParams: {
          suppressCount: true,
          checkbox: ({ data }) => allowSelection(data?.faaMergeStatus),
        },
      },
    };
  };

  const topHeaderActions = (): ReactNode => {
    const { faaImportStagingTables } = state.selectedStagingRecord;
    return (
      <DetailsEditorHeaderSection
        title={getTitle(state.selectedStagingRecord, isRunways())}
        isEditMode={false}
        showBreadcrumb={true}
        backNavLink=""
        useHistoryBackNav={true}
        onBackClick={() => {
          if (props.isRunwayBySourceLocation) {
            airportStore?.setIsRunwayBackNav(true);
          }
          navigate(-1);
        }}
        backNavTitle="Back"
        classes={{
          title: classes?.title,
          titleContainer: classes?.titleContainer,
          contentContainer: classes?.contentContainer,
        }}
        customActionButtons={() => (
          <>
            <ViewPermission hasPermission={!isRunways() && !isFrequency()}>
              <PrimaryButton
                disabled={
                  !airportModuleSecurity.isEditable ||
                  gridState.isRowEditing ||
                  isDataMerged(state.selectedStagingRecord.faaMergeStatus) ||
                  gridState.hasSelectedRows
                }
                variant="contained"
                color="primary"
                onClick={() => confirmMergeWithRunways()}
              >
                Merge Airport With Runways
              </PrimaryButton>
            </ViewPermission>
            <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
              <PrimaryButton
                disabled={disableMergeButton() || !Boolean(faaImportStagingTables.length)}
                variant="contained"
                color="primary"
                onClick={() => confirmMergeChanges(gridState.gridApi.getSelectedRows(), isNewOrRemovedRecord())}
              >
                Merge {`${isNewOrRemovedRecord() && !isFrequency() ? 'Record' : 'Selected'}`}
              </PrimaryButton>
            </ViewPermission>
          </>
        )}
      />
    );
  };

  return (
    <DetailsEditorWrapper
      headerActions={topHeaderActions()}
      isEditMode={false}
      isBreadCrumb={true}
      hasChanges={gridState.hasSelectedRows}
    >
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('airportStore', 'sidebarStore', 'airportSettingsStore')(observer(FAACompareFileDetails));

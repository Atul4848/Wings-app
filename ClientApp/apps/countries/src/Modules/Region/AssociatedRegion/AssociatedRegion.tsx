import { Theme } from '@material-ui/core';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  AccessLevelModel,
  GEOGRAPHICAL_REGION_TYPE,
  GRID_ACTIONS,
  IAPIGridRequest,
  ISelectOption,
  SourceTypeModel,
  UIStore,
  Utilities,
  cellStyle,
  rowStyle,
} from '@wings-shared/core';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuditHistory, CountryModel, ModelStatusOptions, RegionModel, StateModel, baseApiPath } from '@wings/shared';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  ICellEditor,
  ICellEditorParams,
  ICellRendererParams,
  RowEditingStartedEvent,
  RowNode,
  ValueFormatterParams,
} from 'ag-grid-community';
import { AxiosError } from 'axios';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, RefObject, useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ASSOCIATED_REGION_FILTERS, COUNTRY_AUDIT_MODULES, useCountryModuleSecurity } from '../../Shared';
import { AssociatedRegionModel } from '../../Shared/Models';
import { CountryStore, RegionStore, SettingsStore } from '../../Shared/Stores';
import { useStyles } from './AssociatedRegion.styles';
interface Props extends Partial<ICellRendererParams> {
  regionStore?: RegionStore;
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  theme?: Theme;
  isMasterDetails?: boolean; // Showing in grid as child entity for regions screen
  countryModel?: CountryModel;
  isEditable?: boolean;
  isParentRowEditing?: () => boolean;
  ref?: RefObject<any>;
  getAssociatedRegions?: (regionId: number, countryId: number) => Observable<AssociatedRegionModel[]>;
}

const AssociatedRegion: FC<Props> = ({ ...props }) => {
  const alertMessageId: string = 'AssociatedRegionAlertMessage';
  const gridState = useGridState();
  const agGrid = useAgGrid<ASSOCIATED_REGION_FILTERS, AssociatedRegionModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const countryModuleSecurity = useCountryModuleSecurity()
  const isEditable = Boolean(props.isEditable);
  const regionId: number = props.data?.id;
  const countryId = props.countryModel?.id as number;
  const [ countryAssociatedRegions, setCountryAssociatedRegions ] = useState<AssociatedRegionModel[]>([]);
  const _regionStore = props.regionStore as RegionStore;
  const _countryStore = props.countryStore as CountryStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const classes = useStyles();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', isEditable);
  }, [ isEditable ]);

  // check if parent row is editing or not
  const isParentRowEditing = () => {
    const { isParentRowEditing } = props as Required<Props>;
    return isParentRowEditing instanceof Function ? isParentRowEditing() : false;
  };

  // return row data as regions if it's master details
  /* istanbul ignore next */
  const regions = (): RegionModel[] => {
    return props.isMasterDetails
      ? [ props.data ]
      : _regionStore.regions.filter(
        ({ regionType }) => !Utilities.isEqual(regionType.label, GEOGRAPHICAL_REGION_TYPE.GEOGRAPHICAL_REGION)
      );
  };

  // Load associated regions based on region id or countryId
  /* istanbul ignore next */
  const getAssociatedRegions = () => {
    const { getAssociatedRegions } = props;
    return typeof getAssociatedRegions === 'function'
      ? getAssociatedRegions(regionId, countryId)
      : _regionStore.getAssociatedRegions(regionId, countryId);
  };

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    getAssociatedRegions()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(associatedRegions => {
        gridState.setGridData(associatedRegions as AssociatedRegionModel[]);
      });
  };

  /* istanbul ignore next */
  const loadStates = (countryId: number) => {
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([
        countryId ? { propertyName: 'Country.CountryId', propertyValue: countryId } : {},
      ]),
    };
    UIStore.setPageLoader(true);
    _countryStore
      .getStates(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadCountryAssociatedRegions = (countryId: number) => {
    if (!countryId) {
      return;
    }

    UIStore.setPageLoader(true);
    _regionStore
      .getAssociatedRegions(null, countryId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => setCountryAssociatedRegions(response));
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Region',
      field: 'region',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      hide: props.isMasterDetails,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Region',
        getAutoCompleteOptions: () => regions(),
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Region Type',
      field: 'region.regionType',
      editable: false,
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      hide: props.isMasterDetails,
    },
    {
      headerName: 'Country',
      field: 'country',
      hide: !props.isMasterDetails,
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'commonName'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.commonName || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Country',
        getAutoCompleteOptions: () => _countryStore.countries,
        getDisableState: ({ data }: RowNode) => Boolean(data?.id) || Boolean(countryId),
      },
    },
    {
      headerName: 'State',
      field: 'state',
      cellEditor: 'customAutoComplete',
      comparator: (current, next) => Utilities.customComparator(current, next, 'commonName'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.commonName || '',
      cellEditorParams: {
        placeHolder: 'Select State',
        getAutoCompleteOptions: () => _countryStore.states,
        getDisableState: ({ data }: RowNode) => Boolean(data?.id),
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
      },
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Source Type',
        getAutoCompleteOptions: () => _settingsStore.sourceTypes,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: '',
      field: 'actionRenderer',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 150,
      minWidth: 130,
      sortable: false,
      filter: false,
      suppressSizeToFit: true,
      suppressNavigable: true,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => [
          { title: 'Edit', isHidden: true, action: GRID_ACTIONS.EDIT },
          { title: 'Audit', isHidden: !props.isMasterDetails, action: GRID_ACTIONS.AUDIT },
        ],
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange,
      },
      columnDefs: columnDefs,
      isEditable: isEditable,
      gridActionProps: {
        hideActionButtons: !props.isMasterDetails,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      getRowStyle: () => rowStyle(isParentRowEditing() || gridState.isRowEditing, isEditable),
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(params);
        agGrid.setColumnVisible('region.regionType', false);
        _countryStore.states = [];
        setCountryAssociatedRegions([]);
        _countryStore.getCountries().subscribe();
        // load data based on country id
        const _countryId: number = countryId || params.data?.country?.id;
        if (_countryId) {
          loadStates(_countryId);
          loadCountryAssociatedRegions(_countryId);
        }
      },
      onRowEditingStopped: () => {
        agGrid.onRowEditingStopped();
        agGrid.setColumnVisible('region.regionType', !props.isMasterDetails);
      },
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', isEditable as boolean);
      },
    };
  };

  const onDropDownChange = (params: ICellEditorParams, value: ISelectOption) => {
    const colId: string = params.column?.getColId();
    if (colId === 'country') {
      const selectedCountry: CountryModel = value as CountryModel;
      const stateInstances: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'state' ] });

      if (stateInstances && stateInstances.length) {
        const selectedState: StateModel = stateInstances[0]?.getValue();

        if (selectedState && selectedState.countryId !== selectedCountry?.id) {
          if (stateInstances[0].getFrameworkComponentInstance) {
            stateInstances[0].getFrameworkComponentInstance().setValue(null);
          }
        }
      }

      _countryStore.states = [];
      if (selectedCountry) {
        loadStates(selectedCountry?.id);
      }
      loadCountryAssociatedRegions(selectedCountry?.id);
    }

    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Check if country already associated with other GEOGRAPHICAL_REGION 46303
  /* istanbul ignore next */
  const isAlreadyAssociated = (associatedRegionModel: AssociatedRegionModel) => {
    const _region: RegionModel = agGrid.getInstanceValue('region') || associatedRegionModel.region;
    const _state: StateModel = agGrid.getInstanceValue('state') || associatedRegionModel.state;

    // Needs to check for geographical only
    if (!Utilities.isEqual(_region?.regionType.label, GEOGRAPHICAL_REGION_TYPE.GEOGRAPHICAL_REGION)) {
      return false;
    }

    const geographicalRegions = countryAssociatedRegions.filter(({ id, region, state }) => {
      return (
        !Utilities.isEqual(id, associatedRegionModel.id) &&
        Utilities.isEqual(region?.regionType.name, GEOGRAPHICAL_REGION_TYPE.GEOGRAPHICAL_REGION)
      );
    });

    const isCountryAssociated = geographicalRegions.some(({ region, state }) => {
      return _state.id ? Utilities.isEqual(state.id, _state.id) : !Utilities.isEqual(region.id, _region.id);
    });

    if (isCountryAssociated) {
      agGrid.showAlert('This Country is already associated with other geographical region.', alertMessageId);
      return true;
    }
    return false;
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[props.isMasterDetails ? 2 : 0].field || '');
        break;
      case GRID_ACTIONS.AUDIT:
        const model: AssociatedRegionModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model?.name}
            entityId={model?.id}
            entityType={COUNTRY_AUDIT_MODULES.ASSOCIATEDREGION}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
      case GRID_ACTIONS.SAVE:
        upsertAssociatedRegion(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const upsertAssociatedRegion = (rowIndex: number) => {
    const data: AssociatedRegionModel = agGrid._getTableItem(rowIndex);
    const stateId = agGrid.getCellEditorInstance('state')?.getValue()?.id;
    const isExists = agGrid._isAlreadyExists([ 'region', 'country', 'state' ], data.id, rowIndex);
    if (isExists) {
      agGrid.showAlert(`Region${stateId ? ', State' : ''} and Country should be unique.`, alertMessageId);
      return;
    }

    if (isAlreadyAssociated(data)) {
      return;
    }
    
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _regionStore
      ?.upsertAssociatedRegion(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: AssociatedRegionModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const addAssociatedRegion = () => {
    const associatedRegionModel = new AssociatedRegionModel({
      id: 0,
      country: props.countryModel || new CountryModel(),
      region: props.data || new RegionModel(),
    });
    const colKey: string = countryId ? 'region' : 'country';
    agGrid.addNewItems([ associatedRegionModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  return (
    <div className={classNames({ [classes.root]: true, [classes.masterDetails]: !props.isMasterDetails })}>
      <AgGridMasterDetails
        addButtonTitle="Add Association"
        onAddButtonClick={addAssociatedRegion}
        hasAddPermission={countryModuleSecurity.isEditable}
        disabled={
          gridState.isProcessing || isParentRowEditing() || !isEditable || gridState.isRowEditing || UIStore.pageLoading
        }
        key={`master-details-${isEditable}-${isParentRowEditing()}`}
      >
        <CustomAgGridReact
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing || isParentRowEditing()}
          classes={{ gridContainer: props.isMasterDetails ? classes.gridContainer : classes.customHeight }}
        />
      </AgGridMasterDetails>
    </div>
  );
};

export default observer(AssociatedRegion);

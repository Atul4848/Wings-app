import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { AxiosError } from 'axios';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams, ICellEditor, ICellEditorParams } from 'ag-grid-community';
import {
  AuditHistory,
  BaseCityModel,
  CountryModel,
  MetroModel,
  ModelStatusOptions,
  StateModel,
  baseApiPath,
} from '@wings/shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import {
  ViewPermission,
  GRID_ACTIONS,
  UIStore,
  AccessLevelModel,
  Utilities,
  ISelectOption,
  SourceTypeModel,
  IAPIGridRequest,
  regex,
} from '@wings-shared/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  SettingsStore,
  CountryStore,
  METRO_FILTERS,
  COUNTRY_AUDIT_MODULES,
  useCountryModuleSecurity,
  updateCountrySidebarOptions,
} from '../Shared';
import { SidebarStore } from '@wings-shared/layout';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  sidebarStore: typeof SidebarStore;
}

const Metro: FC<Props> = ({ countryStore, settingsStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<METRO_FILTERS, MetroModel>([], gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const _countryStore = countryStore as CountryStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const state = observable<any>({ cities: [] });
  const countryModuleSecurity = useCountryModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateCountrySidebarOptions('Metros'), 'countries');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _countryStore
      .getMetros()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(metros => (gridState.data = metros));
  };

  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getSourceTypes(), _settingsStore.getAccessLevels(), _countryStore.getCountries() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadCities = (countryId: number, stateId?: number, searchValue?: string): Observable<BaseCityModel[]> => {
    const countryFilter = Utilities.getFilter('Country.CountryId', countryId);
    const stateFilter = Utilities.getFilter('State.StateId', stateId as number);
    const filters = stateId ? [ countryFilter, stateFilter ] : [ countryFilter ];
    const request: IAPIGridRequest = {
      pageSize: 50,
      filterCollection: JSON.stringify(filters),
      searchCollection: (searchValue
        ? JSON.stringify([
          { propertyName: 'OfficialName', operator: 'and', searchType: 'start', propertyValue: searchValue },
          { propertyName: 'CommonName', operator: 'or', searchType: 'start', propertyValue: searchValue },
        ])
        : null) as string,
    };

    return _countryStore.getCities(request).pipe(
      takeUntil(unsubscribe.destroy$),
      map(response => response.results),
      tap((cities: BaseCityModel[]) => (state.cities = cities))
    );
  };

  /* istanbul ignore next */
  const loadStatesAndCities = (countryId: number, stateId?: number) => {
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([{ propertyName: 'Country.CountryId', propertyValue: countryId }]),
    };

    UIStore.setPageLoader(true);
    forkJoin([ _countryStore.getStates(request), loadCities(countryId, stateId) ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const onInputChange = (params: ICellEditorParams, value: ISelectOption) => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const resetInstances = (instances: ICellEditor[]) => {
    if (Array.isArray(instances) && instances.length) {
      (instances[0] as any).getFrameworkComponentInstance().setValue(null);
    }
  };

  const resetStatesAndCities = () => {
    _countryStore.states = [];
    state.cities = [];
  };

  const onDropDownChange = (params: ICellEditorParams, value: ISelectOption) => {
    const colId: string = params.colDef.field || '';
    const cityInstances: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'city' ] });

    if (colId === 'country') {
      const selectedCountry: CountryModel = value as CountryModel;
      const stateInstances: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'state' ] });
      //reset state instances
      resetInstances(stateInstances);
      //reset city instances
      resetInstances(cityInstances);
      resetStatesAndCities();
      const selectedCountryId = (selectedCountry && isNaN(Number(selectedCountry?.id))
        ? null
        : Number(selectedCountry?.id)) as number;
      if (selectedCountryId) {
        loadStatesAndCities(selectedCountryId);
      }
    }

    if (colId === 'state') {
      const selectedState: StateModel = value as StateModel;
      const countryInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({ columns: [ 'country' ] });
      resetInstances(cityInstances);

      state.cities = [];
      const countryId: number = countryInstance[0].getValue().id;
      const stateId: number = selectedState && selectedState.id;

      UIStore.setPageLoader(true);
      loadCities(countryId, stateId).subscribe({ complete: () => UIStore.setPageLoader(false) });
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Check if Metro already exists
  const isAlreadyExists = (id: number): boolean => {
    const state: any = agGrid.getInstanceValue('state');
    const code = agGrid.getInstanceValue('code');
    if (code) {
      const isExist = agGrid._isAlreadyExists(state?.id ? [ 'code', 'country', 'state' ] : [ 'code', 'country' ], id);
      if (isExist) {
        agGrid.showAlert(`Metro Code, Country ${state?.id ? 'and State' : ''}  should be unique.`, 'MetroAlertMessage');
        return true;
      }
    }
    return false;
  };

  /* istanbul ignore next */
  const upsertMetro = (rowIndex: number): void => {
    const data: MetroModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _countryStore
      .upsertMetro(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: MetroModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  /* istanbul ignore next */
  const onSearch = (searchValue: string): void => {
    const countryId = gridState.gridApi.getCellEditorInstances({ columns: [ 'country' ] })[0].getValue()?.id;
    const stateId = gridState.gridApi.getCellEditorInstances({ columns: [ 'state' ] })[0].getValue()?.id;
    if (Boolean(searchValue.length > 2)) {
      UIStore.setPageLoader(true);
      loadCities(countryId, stateId, searchValue).subscribe({ next: () => UIStore.setPageLoader(false) });
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.AUDIT:
        const model: MetroModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.name}
            entityId={model.id}
            entityType={COUNTRY_AUDIT_MODULES.METRO}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
      case GRID_ACTIONS.SAVE:
        upsertMetro(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        agGrid.cancelEditing(rowIndex);
        break;
      default:
        gridState.gridApi.stopEditing(true);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Metro Name',
      field: 'name',
      cellEditorParams: {
        rules: `required|string|between:1,100|regex:${regex.alphabetsWithSpaces}`,
      },
    },
    {
      headerName: 'Metro Code',
      field: 'code',
      cellEditorParams: {
        rules: `string|between:1,10|regex:${regex.alphabetsWithoutSpaces}`,
      },
    },
    {
      headerName: 'Country Code',
      field: 'country',
      cellEditor: 'customAutoComplete',
      comparator: (current: CountryModel, next: CountryModel) =>
        Utilities.customComparator(current, next, 'isO2Code'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.isO2Code,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Country Code',
        getAutoCompleteOptions: () => _countryStore.countries,
        valueGetter: (option: CountryModel) => option,
      },
    },
    {
      headerName: 'State Code',
      field: 'state',
      cellEditor: 'customAutoComplete',
      comparator: (current: StateModel, next: StateModel) => Utilities.customComparator(current, next, 'commonName'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.code || '',
      cellEditorParams: {
        placeHolder: 'State Code',
        getAutoCompleteOptions: () => _countryStore.states,
        valueGetter: (option: StateModel) => option,
      },
    },
    {
      headerName: 'City Code',
      field: 'city',
      cellEditor: 'customAutoComplete',
      comparator: (current: BaseCityModel, next: BaseCityModel) =>
        Utilities.customComparator(current, next, 'cappsCode'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.cappsCode || '',
      cellEditorParams: {
        placeHolder: 'City Code',
        getAutoCompleteOptions: () => state.cities,
        onSearch: (searchValue: string) => onSearch(searchValue),
        valueGetter: (option: BaseCityModel) => option,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Source Type',
        getAutoCompleteOptions: () => _settingsStore.sourceTypes,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !countryModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
            },
            {
              title: 'Audit',
              action: GRID_ACTIONS.AUDIT,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: countryModuleSecurity.isEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { name, code, city, country, state, id } = node.data as MetroModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [METRO_FILTERS.NAME]: name,
              [METRO_FILTERS.CODE]: code,
              [METRO_FILTERS.CITY_CODE]: city?.cappsCode,
              [METRO_FILTERS.COUNTRY_CODE]: country.isO2Code,
              [METRO_FILTERS.STATE_CODE]: state?.code,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        resetStatesAndCities();
        loadSettingsData();
        const countryId: number = params.data?.country?.id;
        const stateId: number = params.data?.state?.id;
        if (countryId) {
          loadStatesAndCities(countryId, stateId);
        }
      },
    };
  };

  /* istanbul ignore next */
  const addMetros = () => {
    const metro = new MetroModel({ id: 0, name: '' });
    agGrid.addNewItems([ metro ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
          onClick={addMetros}
        >
          Add Metros
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(METRO_FILTERS, METRO_FILTERS.NAME) ]}
        rightContent={rightContent}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('countryStore', 'settingsStore', 'sidebarStore')(observer(Metro));

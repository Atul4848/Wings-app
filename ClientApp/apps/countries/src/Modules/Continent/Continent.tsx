import React, { ReactNode, FC, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { ModelStatusOptions, ContinentModel, AuditHistory, baseApiPath } from '@wings/shared';
import { takeUntil, finalize } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { inject, observer } from 'mobx-react';
import {
  CountryStore,
  CONTINENT_FILTERS,
  SettingsStore,
  COUNTRY_AUDIT_MODULES,
  updateCountrySidebarOptions,
  useCountryModuleSecurity,
} from '../Shared';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { forkJoin } from 'rxjs';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Logger } from '@wings-shared/security';
import {
  AccessLevelModel,
  ISelectOption,
  SourceTypeModel,
  UIStore,
  Utilities,
  regex,
  ViewPermission,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  CustomAgGridReact,
  IActionMenuItem,
  useAgGrid,
  useGridState,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { SidebarStore } from '@wings-shared/layout';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const Continent: FC<Props> = ({ countryStore, settingsStore, sidebarStore }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<CONTINENT_FILTERS, ContinentModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _countryStore = countryStore as CountryStore;
  const _settingsStore = settingsStore as SettingsStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;
  const countryModuleSecurity = useCountryModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateCountrySidebarOptions('Continents'), 'countries');
    loadInitialData();
  }, []);

  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getSourceTypes(), _settingsStore.getAccessLevels() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _countryStore
      .getContinents(true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: continents => (gridState.data = continents),
        error: (error: AxiosError) => Logger.error(error.message),
      });
  };

  const actionMenus = (): IActionMenuItem[] => {
    return [
      { title: 'Edit', isHidden: !countryModuleSecurity.isEditable, action: GRID_ACTIONS.EDIT },
      {
        title: 'View Countries',
        action: GRID_ACTIONS.VIEW,
        to: node => `${node?.data.id}/countries`,
      },
      { title: 'Audit', action: GRID_ACTIONS.AUDIT },
    ];
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        rules: `required|string|between:1,100|regex:${regex.alphabetsWithSpaces}`,
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      cellEditorParams: {
        rules: `required|string|between:1,4|regex:${regex.alphabetsWithSpaces}`,
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
        getAutoCompleteOptions: () => _settingsStore?.accessLevels,
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
        getAutoCompleteOptions: () => _settingsStore?.sourceTypes,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => actionMenus(),
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs: columnDefs,
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
        const { name, code, id } = node.data as ContinentModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [CONTINENT_FILTERS.NAME]: name,
              [CONTINENT_FILTERS.CODE]: code,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: event => {
        agGrid.onRowEditingStarted(event);
        loadSettingsData();
      },
    };
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }

    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertContinent(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        agGrid.cancelEditing(rowIndex);
        break;
      case GRID_ACTIONS.AUDIT:
        const model: ContinentModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.name}
            entityId={model.id}
            entityType={COUNTRY_AUDIT_MODULES.CONTINENT}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
      default:
        gridState.gridApi.stopEditing();
        break;
    }
  };

  const upsertContinent = (rowIndex: number) => {
    gridState.gridApi.stopEditing();

    UIStore.setPageLoader(true);
    const continentModel: ContinentModel = agGrid._getTableItem(rowIndex);
    _countryStore
      ?.upsertContinent(continentModel)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ContinentModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const addContinents = () => {
    const continent = new ContinentModel({ id: 0, name: '', code: '' });
    agGrid.addNewItems([ continent ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isProcessing || gridState.isRowEditing}
          onClick={addContinents}
        >
          Add Continents
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        onExpandCollapse={() => agGrid.autoSizeColumns()}
        selectInputs={[ agGridUtilities.createSelectOption(CONTINENT_FILTERS, CONTINENT_FILTERS.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('countryStore', 'settingsStore', 'sidebarStore')(observer(Continent));

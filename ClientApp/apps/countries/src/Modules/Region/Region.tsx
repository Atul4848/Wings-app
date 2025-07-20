import { Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  AccessLevelModel,
  GRID_ACTIONS,
  ISelectOption,
  SettingsTypeModel,
  SourceTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
  cellStyle,
} from '@wings-shared/core';
import {
  CustomAgGridReact,
  IActionMenuItem,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AuditHistory, ModelStatusOptions, RegionModel, baseApiPath } from '@wings/shared';
import { ColDef, EditableCallbackParams, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { AxiosError } from 'axios';
import { inject, observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  COUNTRY_AUDIT_MODULES,
  REGION_FILTERS,
  updateCountrySidebarOptions,
  useCountryModuleSecurity,
} from '../Shared';
import { CountryStore, RegionStore, SettingsStore } from '../Shared/Stores';
import AssociatedRegion from './AssociatedRegion/AssociatedRegion';
import { SidebarStore } from '@wings-shared/layout';

interface Props {
  regionStore?: RegionStore;
  settingsStore?: SettingsStore;
  countryStore?: CountryStore;
  theme?: Theme;
  sidebarStore?: typeof SidebarStore;
}

const Region: FC<Props> = ({ regionStore, settingsStore, countryStore, sidebarStore }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<REGION_FILTERS, RegionModel>([], gridState);
  const _countryStore = countryStore as CountryStore;
  const _regionStore = regionStore as RegionStore;
  const _settingsStore = settingsStore as SettingsStore;
  const countryModuleSecurity = useCountryModuleSecurity();
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateCountrySidebarOptions('Regions'), 'countries');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);

    forkJoin([
      _regionStore.getRegions(null, true),
      _settingsStore.getRegionTypes(),
      _settingsStore.getSourceTypes(),
      _settingsStore.getAccessLevels(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ regions ]) => {
        gridState.setGridData(regions);
      });
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellRenderer: 'agGroupCellRenderer',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,50',
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      cellEditorParams: {
        rules: 'string|between:1,5',
      },
    },
    {
      headerName: 'Type',
      field: 'regionType',
      cellEditor: 'customAutoComplete',
      editable: ({ data }: EditableCallbackParams) => Boolean(!data?.id),
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Region Type',
        getAutoCompleteOptions: () => _settingsStore?.regionTypes,
        valueGetter: (option: SettingsTypeModel) => option,
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

  const actionMenus = (): IActionMenuItem[] => {
    return [
      { title: 'Edit', isHidden: true, action: GRID_ACTIONS.EDIT },
      { title: 'Audit', action: GRID_ACTIONS.AUDIT },
    ];
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.AUDIT:
        const model: RegionModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.name}
            entityId={model.id}
            entityType={COUNTRY_AUDIT_MODULES.REGION}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
      case GRID_ACTIONS.SAVE:
        upsertRegion(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  // Check if region already exists
  /* istanbul ignore next */
  const isAlreadyExists = (id: number) => {
    const code = agGrid.getInstanceValue('code');

    if (agGrid._isAlreadyExists([ 'name', 'code', 'regionType' ], id)) {
      agGrid.showAlert(`Region Name${code ? ', Code' : ''} and Type should be unique.`, 'RegionAlertMessage');
      return true;
    }
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Region Name should be unique.', 'RegionAlertMessage');
      return true;
    }
    return false;
  };

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
      detailCellRenderer: 'customDetailCellRenderer',
      detailCellRendererParams: {
        isMasterDetails: true,
        isEditable: countryModuleSecurity.isEditable,
        isParentRowEditing: () => gridState.isRowEditing,
        countryStore: _countryStore,
        regionStore: _regionStore,
        settingsStore: _settingsStore,
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        customDetailCellRenderer: AssociatedRegion,
      },
      doesExternalFilterPass: node => {
        const { name, code, id } = node.data as RegionModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [REGION_FILTERS.NAME]: name,
              [REGION_FILTERS.CODE]: code,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const upsertRegion = (rowIndex: number) => {
    const data: RegionModel = agGrid._getTableItem(rowIndex);

    if (isAlreadyExists(data.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const hasInvalidRowData: boolean = Utilities.hasInvalidRowData(gridState.gridApi);

    if (hasInvalidRowData) {
      AlertStore.info('Please fill all required fields');
      return;
    }

    UIStore.setPageLoader(true);
    _regionStore
      ?.upsertRegion(data)
      .pipe(takeUntil(unsubscribe.destroy$))
      .subscribe({
        next: (response: RegionModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
        complete: () => UIStore.setPageLoader(false),
      });
  };

  // right content for search header
  const rightContent = () => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
          onClick={addRegion}
        >
          Add Region
        </PrimaryButton>
      </ViewPermission>
    );
  };

  /* istanbul ignore next */
  const addRegion = () => {
    const region = new RegionModel({
      id: 0,
      name: '',
      code: '',
      regionTypeId: 0,
      regionTypeName: '',
      regionType: new SettingsTypeModel(),
    });
    agGrid.addNewItems([ region ], { startEditing: false, colKey: 'name' });
    gridState.setHasError(true);
  };
  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        onExpandCollapse={() => agGrid.autoSizeColumns()}
        selectInputs={[ agGridUtilities.createSelectOption(REGION_FILTERS, REGION_FILTERS.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('regionStore', 'settingsStore', 'countryStore', 'sidebarStore')(observer(Region));

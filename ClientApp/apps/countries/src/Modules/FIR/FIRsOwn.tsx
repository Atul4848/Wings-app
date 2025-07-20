import React, { FC, ReactNode, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { AxiosError } from 'axios';
import { forkJoin, Observable } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams, RowNode } from 'ag-grid-community';
import { AuditHistory, CountryModel, GridPagination, ModelStatusOptions, baseApiPath } from '@wings/shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { AlertStore } from '@uvgo-shared/alert';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
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
  IClasses,
  IAPIPageResponse,
  EntityMapModel,
} from '@wings-shared/core';
import { Tooltip, Chip } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useUnsubscribe } from '@wings-shared/hooks';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import {
  SettingsStore,
  CountryStore,
  COUNTRY_AUDIT_MODULES,
  FIRStore,
  FIRModel,
  useCountryModuleSecurity,
  updateCountrySidebarOptions,
} from '../Shared';
import { FIR_FILTERS } from './Enums';
import { useStyles } from './FIRsOwn.styles';
import { SidebarStore } from '@wings-shared/layout';

interface Props {
  firStore?: FIRStore;
  countryStore?: CountryStore;
  settingsStore?: SettingsStore;
  showSearchHeader?: boolean;
  countryId?: number;
  sidebarStore?: typeof SidebarStore;
}

const FIRsOwn: FC<Props> = ({
  firStore,
  countryStore,
  settingsStore,
  countryId,
  sidebarStore,
  showSearchHeader = true,
}) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<FIR_FILTERS, FIRModel>([], gridState);
  const classes = useStyles();
  const countryModuleSecurity = useCountryModuleSecurity();
  const _settingsStore = settingsStore as SettingsStore;
  const _countryStore = countryStore as CountryStore;
  const _firStore = firStore as FIRStore;
  const _sidebarStore = sidebarStore as typeof SidebarStore;

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateCountrySidebarOptions('FIRs'), 'countries');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    loadFIRsOwned()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  const loadSettingsData = () => {
    UIStore.setPageLoader(true);
    forkJoin([
      _settingsStore.getFeeRequirement(),
      _settingsStore.getSourceTypes(),
      _settingsStore.getAccessLevels(),
      _countryStore.getCountries(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  /* istanbul ignore next */
  const filterCollection = (): IAPIGridRequest | null => {
    if (countryId) {
      return {
        filterCollection: JSON.stringify([
          { propertyName: 'FIRControllingCountries.CountryId', propertyValue: countryId, isArray: true },
          { propertyName: 'FIRLandmassCountries.CountryId', propertyValue: countryId, isArray: true, operator: 'or' },
        ]),
      };
    }
    return null;
  };

  /* istanbul ignore next */
  const loadFIRsOwned = (pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<FIRModel>> => {
    const request: IAPIGridRequest = {
      pageSize: 0,
      ...pageRequest,
      ...filterCollection(),
    };
    return _firStore.getFIRsOwned(request).pipe(
      takeUntil(unsubscribe.destroy$),
      tap(FIR => {
        gridState.data = FIR.results;
        gridState.pagination = new GridPagination({ ...FIR });
      })
    );
  };

  // Check if FIR already exists
  const isAlreadyExists = (id: number, rowIndex: number): boolean => {
    const isExists = agGrid._isAlreadyExists([ 'code', 'name' ], id, rowIndex);
    if (isExists) {
      agGrid.showAlert('Code and Name should be unique.', 'FIRsOwnAlertMessage');
    }
    return isExists;
  };

  const upsertFIRs = (rowIndex: number): void => {
    const data: FIRModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id, rowIndex)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const hasInvalidRowData: boolean = Utilities.hasInvalidRowData(gridState.gridApi);

    if (hasInvalidRowData) {
      AlertStore.info('Please fill all required fields');
      return;
    }
    UIStore.setPageLoader(true);
    _firStore
      .upsertFIRControllingCountry(data)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: FIRModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[2].field || '');
        break;
      case GRID_ACTIONS.AUDIT:
        const model: FIRModel = agGrid._getTableItem(rowIndex);
        ModalStore.open(
          <AuditHistory
            title={model.name}
            entityId={model.id}
            entityType={COUNTRY_AUDIT_MODULES.FIR}
            baseUrl={baseApiPath.countries}
          />
        );
        break;
      case GRID_ACTIONS.SAVE:
        upsertFIRs(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const viewRenderer = (
    countryChips: CountryModel[],
    getTagProps?: AutocompleteGetTagProps,
    isReadMode?: boolean
  ): ReactNode => {
    const numTags = countryChips.length;
    const limitTags = 1;
    const chipsList = isReadMode ? countryChips : [ ...countryChips ].slice(0, limitTags);
    return (
      <div>
        {Utilities.customArraySort(chipsList, 'isO2Code').map((country: CountryModel, index) => (
          <Tooltip title={country.commonName || ''} key={index}>
            <Chip
              classes={{ root: (classes as IClasses).root }}
              key={country.id}
              label={country.isO2Code}
              {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
            />
          </Tooltip>
        ))}
        {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  /* istanbul ignore next */
  const viewRendererFeeRequirement = (chips: EntityMapModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    const numTags = chips.length;
    const limitTags = 1;
    const chipsList = [ ...chips ].slice(0, limitTags);
    return (
      <div>
        {chipsList.map((feeRequirement: EntityMapModel, index) => (
          <Chip
            key={feeRequirement.id}
            label={feeRequirement.label}
            {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
          />
        ))}
        {numTags > limitTags && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Code',
      field: 'code',
      headerTooltip: 'Code',
      cellEditorParams: {
        isRequired: true,
        rules: `required|string|regex:${regex.alphabetsWithoutSpaces}|size:4`,
      },
    },
    {
      headerName: 'Name',
      field: 'name',
      headerTooltip: 'Name',
      cellEditorParams: {
        isRequired: true,
        rules: 'required|string|between:1,100',
      },
    },
    {
      headerName: 'Controlling Countries',
      field: 'firControllingCountries',
      headerTooltip: 'Controlling Countries',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'viewRenderer',
      sortable: false,
      filter: false,
      minWidth: 250,
      filterValueGetter: ({ data }: ValueGetterParams) => data.firControllingCountries,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.firControllingCountries, null, true),
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Country',
        multiSelect: true,
        disableCloseOnSelect: true,
        valueGetter: (selectedOptions: CountryModel[]) => selectedOptions,
        renderTags: (values: CountryModel[], getTagProps: AutocompleteGetTagProps) => viewRenderer(values, getTagProps),
        getAutoCompleteOptions: () => _countryStore.countries,
      },
    },
    {
      headerName: 'Landmass Countries',
      field: 'firLandmassCountries',
      headerTooltip: 'Landmass Countries',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'viewRenderer',
      sortable: false,
      filter: false,
      minWidth: 250,
      filterValueGetter: ({ data }: ValueGetterParams) => data.firLandmassCountries,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.firLandmassCountries, null, true),
      },
      cellEditorParams: {
        placeHolder: 'Select Country',
        displayKey: 'name',
        multiSelect: true,
        disableCloseOnSelect: true,
        valueGetter: (selectedOptions: CountryModel[]) => selectedOptions,
        renderTags: (values: CountryModel[], getTagProps: AutocompleteGetTagProps) => viewRenderer(values, getTagProps),
        getAutoCompleteOptions: () => _countryStore.countries,
      },
    },
    {
      headerName: 'Fee Requirement',
      field: 'appliedFeeRequirements',
      headerTooltip: 'Fee Requirement',
      cellEditor: 'customAutoComplete',
      filter: false,
      cellRenderer: 'agGridChipView',
      minWidth: 250,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || [],
      cellEditorParams: {
        multiSelect: true,
        placeHolder: 'Select Fee Requirement',
        getAutoCompleteOptions: () =>
          _settingsStore.feeRequirement.map(x => new EntityMapModel({ ...x, id: 0, entityId: x.id })),
        valueGetter: (option: EntityMapModel[]) => option,
        renderTags: viewRendererFeeRequirement,
      },
    },
    ...agGrid.generalFields(_settingsStore),
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !countryModuleSecurity.isEditable || Boolean(countryId),
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
      context: {
        onInputChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
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
      suppressClickEdit: Boolean(countryId),
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { name, code, firControllingCountries, firLandmassCountries, id } = node.data as FIRModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [FIR_FILTERS.NAME]: name,
              [FIR_FILTERS.CODE]: code,
              [FIR_FILTERS.CONTROLLING_COUNTRY]: firControllingCountries.map(c => c.officialName),
              [FIR_FILTERS.OVER_LANDMASS_COUNTRY]: firLandmassCountries.map(c => c.officialName),
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

  /* istanbul ignore next */
  const addFir = () => {
    const fir = new FIRModel({ id: 0 });
    agGrid.addNewItems([ fir ], { startEditing: false, colKey: 'code' });
    gridState.setHasError(true);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={countryModuleSecurity.isEditable}>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          disabled={gridState.isRowEditing || UIStore.pageLoading}
          onClick={addFir}
        >
          Add FIRs
        </PrimaryButton>
      </ViewPermission>
    );
  };

  return (
    <>
      {showSearchHeader && (
        <SearchHeaderV3
          useSearchHeader={searchHeader}
          onExpandCollapse={agGrid.autoSizeColumns}
          // eslint-disable-next-line max-len
          selectInputs={[ agGridUtilities.createSelectOption([ FIR_FILTERS.NAME, FIR_FILTERS.CODE ], FIR_FILTERS.NAME) ]}
          rightContent={rightContent}
          onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
          onSearch={sv => gridState.gridApi.onFilterChanged()}
          disableControls={gridState.isRowEditing}
        />
      )}
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('firStore', 'countryStore', 'settingsStore', 'sidebarStore')(observer(FIRsOwn));

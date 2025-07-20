import React, { FC, RefObject, useEffect } from 'react';
import { ColDef, GridOptions, ICellRendererParams, ValueFormatterParams, ICellEditorParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { useUnsubscribe } from '@wings-shared/hooks';
import { Utilities, GRID_ACTIONS, IAPIGridRequest, UIStore, regex } from '@wings-shared/core';
// eslint-disable-next-line max-len
import {
  NAVBLUE_COUNTRY_MAPPING,
  NavblueCountryMappingModel,
  SettingsStore,
  useCountryModuleSecurity,
} from '../../../Shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { CountryModel } from '@wings/shared';
interface Props extends Partial<ICellRendererParams> {
  settingsStore?: SettingsStore;
  isEditable?: boolean;
  ref?: RefObject<any>;
}

const NavBlueCountryMapping: FC<Props> = ({ settingsStore }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<NAVBLUE_COUNTRY_MAPPING, NavblueCountryMappingModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _settingsStore = settingsStore as SettingsStore;
  const countryModuleSecurity = useCountryModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getNavBlueCountryMapping()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  /* istanbul ignore next */
  const saveChanges = (rowIndex): void => {
    const data: NavblueCountryMappingModel = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertNavBlueCountryMapping(data.serialize())
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: NavblueCountryMappingModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          agGrid._startEditingCell(rowIndex, columnDefs[1].field || '');
          AlertStore.critical(error.message);
        },
        complete: () => UIStore.setPageLoader(false),
      });
  };

  const onDropDownChange = (params: ICellEditorParams, value: any): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || !value.length);
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        saveChanges(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Country',
      field: 'country',
      headerTooltip: 'Country',
      valueFormatter: ({ value }) => value?.label || '',
      comparator: (current: CountryModel, next: CountryModel) => Utilities.customComparator(current, next, 'label'),
      cellEditorParams: {
        getDisableState: () => true,
      },
    },
    {
      headerName: 'Navblue Country Mapping',
      field: 'navBlueCountryCodes',
      sortable: false,
      filter: false,
      headerTooltip: 'Navblue Country Mapping',
      cellEditor: 'customFreeSoloChip',
      cellRenderer: 'customFreeSoloChip',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return Array.isArray(value) ? value.map(x => x.label) : value?.label;
      },
      cellEditorParams: {
        limitTags: () => 10,
        rules: regex.alphabetsWithTenCharacter,
        getAutoCompleteOptions: () => [],
        placeHolder: 'Navblue Country Mapping',
        customErrorMessage: 'NavBlue Country Mapping should be a string with a maximum length of 10 characters.',
        isRequired: () => true,
      },
    },
    {
      ...agGrid.actionColumn({
        hide: !countryModuleSecurity.isSettingsEditable,
        cellRendererParams: {
          cellRenderer: 'actionRenderer',
          cellEditor: 'actionRenderer',
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
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
        onDropDownChange,
      },
      columnDefs,
      isEditable: countryModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        return node.data.country.name?.toLowerCase().includes(searchHeader.getFilters().searchValue.toLowerCase());
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(NAVBLUE_COUNTRY_MAPPING, NAVBLUE_COUNTRY_MAPPING.COUNTRY, 'defaultOption'),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('settingsStore')(observer(NavBlueCountryMapping));

import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import {
  ENGINE_TYPE_FILTERS,
  SettingsStore,
  EngineTypeModel,
  SeriesModel,
  useAircraftModuleSecurity,
} from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { forkJoin } from 'rxjs';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  settingsStore?: SettingsStore;
}

const EngineType: FC<Props> = ({ settingsStore }) => {
  const alertMessageId: string = 'EngineType';
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<ENGINE_TYPE_FILTERS, EngineTypeModel>([], gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getEngineTypes(), _settingsStore.getSeries() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ engineTypes ]) => gridState.setGridData(engineTypes));
  };

  const addNewType = (): void => {
    agGrid.addNewItems(
      [
        new EngineTypeModel({
          id: 0,
          name: '',
        }),
      ],
      {
        startEditing: false,
        colKey: 'name',
      }
    );
    gridState.setHasError(true);
  };

  /* istanbul ignore next */
  const viewRenderer = (chips: SeriesModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    const numTags = chips.length;
    const limitTags = 3;
    const chipsList = [ ...chips ].slice(0, limitTags);
    return (
      <div>
        {chipsList.map((country: SeriesModel, index) => (
          <Chip
            key={country.id}
            label={country.label}
            {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
          />
        ))}
        {numTags > limitTags && ` +${numTags - limitTags} more`}
      </div>
    );
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Called from Ag Grid Component
  const onDropDownChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', alertMessageId);
      return true;
    }
    return false;
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
        upsertEngineType(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  const upsertEngineType = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertEngineType(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: EngineTypeModel) => agGrid._sortColumns(rowIndex, response, 'name'),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Series',
      field: 'engineTypeSeries',
      cellEditor: 'customAutoComplete',
      filter: false,
      cellRenderer: 'agGridChipView',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        multiSelect: true,
        placeHolder: 'Series',
        getAutoCompleteOptions: () => _settingsStore.series,
        valueGetter: (option: SeriesModel) => option,
        renderTags: viewRenderer,
      },
    },
    {
      headerName: 'Engine',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        isRequired: true,
        rules: 'required|string|between:1,50',
      },
    },
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !aircraftModuleSecurity.isSettingsEditable,
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: aircraftModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, engineTypeSeries } = node.data as EngineTypeModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [ENGINE_TYPE_FILTERS.SERIES]: engineTypeSeries.map(x => x.label).toString(),
              [ENGINE_TYPE_FILTERS.ENGINE]: name,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!aircraftModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addNewType}
      >
        Add Engine Type
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(ENGINE_TYPE_FILTERS, ENGINE_TYPE_FILTERS.SERIES) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('settingsStore')(observer(EngineType));

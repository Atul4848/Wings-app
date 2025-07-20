import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { SettingsStore, AircraftModel, SeriesModel, SERIES_FILTERS, useAircraftModuleSecurity } from '../../../Shared';
import { AlertStore } from '@uvgo-shared/alert';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, Utilities, GRID_ACTIONS, IClasses } from '@wings-shared/core';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { forkJoin } from 'rxjs';
import { Theme } from '@material-ui/core';
import { AutocompleteGetTagProps } from '@material-ui/lab';
import Chip from '@material-ui/core/Chip';
import { ModalStore } from '@uvgo-shared/modal-keeper';

interface Props {
  classes?: IClasses;
  settingsStore?: SettingsStore;
  theme?: Theme;
}

const Series: FC<Props> = ({ settingsStore }) => {
  const alertMessageId: string = 'Series';
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<SERIES_FILTERS, SeriesModel>([], gridState);
  const _settingsStore = settingsStore as SettingsStore;
  const aircraftModuleSecurity = useAircraftModuleSecurity();
  const _useConfirmDialog = useConfirmDialog();

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    forkJoin([ _settingsStore.getSeries(), _settingsStore.getAircraftModels() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ series ]) => gridState.setGridData(series));
  };

  const addNewType = () => {
    agGrid.addNewItems(
      [
        new SeriesModel({
          id: 0,
          name: '',
        }),
      ],
      {
        startEditing: false,
        colKey: 'seriesModels',
      }
    );
    gridState.setHasError(true);
  };

  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'name' ], id)) {
      agGrid.showAlert('Name should be unique.', alertMessageId);
      return true;
    }
    return false;
  };

  const confirmRemoveSeries = (rowIndex: number) => {
    const model: SeriesModel = agGrid._getTableItem(rowIndex);
    if (!Boolean(model.id)) {
      agGrid._removeTableItems([ model ]);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteSeries(rowIndex), {
      title: 'Delete Series',
      message: 'Are you sure you want to delete this Series?',
    });
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
        upsertSeries(rowIndex);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveSeries(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };

  /* istanbul ignore next */
  const upsertSeries = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(model.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertSeries(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: SeriesModel) => agGrid._sortColumns(rowIndex, response, 'name'),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };

  /* istanbul ignore next */
  const deleteSeries = (rowIndex: number): void => {
    ModalStore.close();
    const model = agGrid._getTableItem(rowIndex);
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .removeSeries(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          agGrid._removeTableItems([ model ]);
          gridState.setGridData(gridState.data.filter(({ id }) => model.id !== id));
        },
        error: (error: AxiosError) => AlertStore.critical(error.message),
      });
  };

  const viewRenderer = (chips: AircraftModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    const numTags = chips.length;
    const limitTags = 3;
    const chipsList = [ ...chips ].slice(0, limitTags);
    return (
      <div>
        {chipsList.map((country: AircraftModel, index) => (
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

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Model',
      field: 'seriesModels',
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellRenderer: 'agGridChipView',
      cellEditorParams: {
        multiSelect: true,
        isRequired: true,
        placeHolder: 'Model',
        getAutoCompleteOptions: () => _settingsStore.aircraftModels,
        valueGetter: (option: AircraftModel) => option,
        renderTags: (values: AircraftModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRenderer(values, getTagProps),
      },
    },
    {
      headerName: 'Series',
      field: 'name',
      cellEditorParams: {
        ignoreNumber: true,
        rules: 'required|string|between:1,50',
      },
    },
    {
      ...agGrid.actionColumn({
        minWidth: 150,
        maxWidth: 210,
        hide: !(aircraftModuleSecurity.isSettingsEditable || aircraftModuleSecurity.isFPDMUser),
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
      isEditable: aircraftModuleSecurity.isSettingsEditable || aircraftModuleSecurity.isFPDMUser,
      gridActionProps: {
        showEditButton: aircraftModuleSecurity.isSettingsEditable,
        showDeleteButton: aircraftModuleSecurity.isFPDMUser || aircraftModuleSecurity.isSettingsEditable,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });
    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, seriesModels } = node.data as SeriesModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [SERIES_FILTERS.NAME]: name,
              [SERIES_FILTERS.MODEL]: seriesModels.map(x => x.name).toString(),
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
        Add Series
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        // eslint-disable-next-line max-len
        selectInputs={[ agGridUtilities.createSelectOption(SERIES_FILTERS, SERIES_FILTERS.NAME) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
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

export default inject('settingsStore')(observer(Series));

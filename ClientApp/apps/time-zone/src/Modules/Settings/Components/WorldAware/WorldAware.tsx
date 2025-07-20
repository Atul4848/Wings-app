import React, { FC, useEffect } from 'react';
import moment from 'moment';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { Theme } from '@material-ui/core';
import {
  regex,
  Utilities,
  DATE_FORMAT,
  UIStore,
  DATE_TIME_PICKER_TYPE,
  IClasses,
  GRID_ACTIONS,
  cellStyle,
  IAPIGridRequest,
} from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
import { TimeZoneSettingsStore, WorldAwareModel, WORLD_AWARE_FILTERS } from '../../../Shared';
import { useGeographicModuleSecurity } from '../../../Shared/Tools';
import { Logger } from '@wings-shared/security';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { CustomAgGridReact, useAgGrid, useGridState, agGridUtilities } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  classes?: IClasses;
  theme?: Theme;
}

const WorldAware: FC<Props> = ({ timeZoneSettingsStore }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<WORLD_AWARE_FILTERS, WorldAwareModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _timeZoneSettingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const geographicModuleSecurity = useGeographicModuleSecurity();

  // Load Data on Mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    _timeZoneSettingsStore
      .getWorldAwares()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setGridData(response);
      });
  };

  const saveChanges = (rowIndex): void => {
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _timeZoneSettingsStore
      .upsertWorldAware(agGrid._getTableItem(rowIndex))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: WorldAwareModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
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
      headerName: 'Refresh Interval',
      field: 'refreshFrequency',
      cellEditorParams: {
        isRequired: true,
        rules: 'required',
      },
    },
    {
      headerName: 'Last Refresh Date ',
      field: 'lastRefreshDate',
      cellEditor: 'customTimeEditor',
      maxWidth: 210,
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value ? moment(value, DATE_FORMAT.GRID_DISPLAY).format(DATE_FORMAT.GRID_DISPLAY) : '';
      },
      cellEditorParams: {
        isRequired: true,
        pickerType: DATE_TIME_PICKER_TYPE.DATE_TIME,
        format: DATE_FORMAT.GRID_DISPLAY,
      },
    },
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 210,
      cellStyle: { ...cellStyle() },
    },
  ];

  const onInputChange = (params: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || !regex.cronExpression.test(value));
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange,
      },
      columnDefs: columnDefs,
      isEditable: geographicModuleSecurity.isSettingsEditable,
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
        const { id, refreshFrequency, lastRefreshDate } = node.data as WorldAwareModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [WORLD_AWARE_FILTERS.REFRESH_INTERVAL]: refreshFrequency?.toString(),
              [WORLD_AWARE_FILTERS.LAST_REFRESH_DATE]: lastRefreshDate,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
    };
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        placeHolder="Search by refresh interval"
        selectInputs={[ agGridUtilities.createSelectOption(WORLD_AWARE_FILTERS, WORLD_AWARE_FILTERS.REFRESH_INTERVAL) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('timeZoneSettingsStore')(observer(WorldAware));

import React, { FC, useEffect } from 'react';
import moment from 'moment';
import { ColDef, GridOptions, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { Theme } from '@material-ui/core';
import { Logger } from '@wings-shared/security';
import { inject, observer } from 'mobx-react';
import { finalize, takeUntil } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { AlertStore } from '@uvgo-shared/alert';
// eslint-disable-next-line max-len
import {
  SECURITY_THREAT_LEVEL_FILTERS,
  SettingsStore,
  SecurityThreatLevelModel,
  useCountryModuleSecurity,
} from '../../../Shared';
import { useSearchHeader, SearchHeaderV3 } from '@wings-shared/form-controls';
import {
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  IClasses,
  UIStore,
  Utilities,
  regex,
  GRID_ACTIONS,
  IAPIGridRequest,
} from '@wings-shared/core';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  AgGridActions,
  AgGridDateTimePicker,
  useAgGrid,
  useGridState,
  agGridUtilities,
} from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  settingsStore?: SettingsStore;
  classes?: IClasses;
  theme?: Theme;
}

const SecurityThreatLevel: FC<Props> = ({ settingsStore }) => {
  const gridState = useGridState();
  const searchHeader = useSearchHeader();
  const agGrid = useAgGrid<SECURITY_THREAT_LEVEL_FILTERS, SecurityThreatLevelModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const _settingsStore = settingsStore as SettingsStore;
  const countryModuleSecurity = useCountryModuleSecurity();

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    _settingsStore
      .getSecurityThreatLevels()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: securityThreatLevels => gridState.setGridData(securityThreatLevels),
      });
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
    { ...agGrid.actionColumn({ headerName: '', minWidth: 150, maxWidth: 210 }) },
  ];

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, columnDefs[0].field || '');
        break;
      case GRID_ACTIONS.SAVE:
        upsertSecurityThreatLevel(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        break;
    }
  };
  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: (params: ICellEditorParams, value: string) =>
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi) || !regex.cronExpression.test(value)),
      },
      columnDefs: columnDefs,
      isEditable: countryModuleSecurity.isSettingsEditable,
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
        if (!searchHeader) {
          return false;
        }
        const { id, refreshFrequency, lastRefreshDate } = node.data as SecurityThreatLevelModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [SECURITY_THREAT_LEVEL_FILTERS.REFRESH_INTERVAL]: refreshFrequency?.toString(),
              [SECURITY_THREAT_LEVEL_FILTERS.LAST_REFRESH_DATE]: lastRefreshDate,
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customTimeEditor: AgGridDateTimePicker,
      },
    };
  };

  /* istanbul ignore next */
  const upsertSecurityThreatLevel = (rowIndex: number) => {
    gridState.gridApi.stopEditing();
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertSecurityThreatLevel(agGrid._getTableItem(rowIndex))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: SecurityThreatLevelModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => {
          AlertStore.critical(error.message);
          Logger.error(error.message);
        },
      });
  };
  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(
            SECURITY_THREAT_LEVEL_FILTERS,
            SECURITY_THREAT_LEVEL_FILTERS.REFRESH_INTERVAL
          ),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} isRowEditing={gridState.isRowEditing} />
    </>
  );
};

export default inject('settingsStore')(observer(SecurityThreatLevel));

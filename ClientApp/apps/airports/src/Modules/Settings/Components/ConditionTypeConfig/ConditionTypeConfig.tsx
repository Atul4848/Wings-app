import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import {
  AirportSettingsStore,
  CONDITION_TYPE_CONFIG,
  CONDITION_TYPE_VALUE,
  ConditionTypeConfigModel,
  ConditionTypeModel,
  IAPIConditionTypeConfig,
  useAirportModuleSecurity,
} from '../../../Shared';
import { ColDef, GridOptions } from 'ag-grid-community';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { UIStore, GRID_ACTIONS, Utilities, SelectOption } from '@wings-shared/core';
import { useGridState, useAgGrid, agGridUtilities, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AxiosError } from 'axios';
import { takeUntil, finalize } from 'rxjs/operators';
import AddIcon from '@material-ui/icons/AddCircleOutline';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
}

const ConditionTypeConfig: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const [ conditionType, setConditionType ] = useState<ConditionTypeModel[]>();
  const agGrid = useAgGrid<CONDITION_TYPE_CONFIG, ConditionTypeConfigModel>([], gridState);
  const _settingsStore = props.airportSettingsStore as AirportSettingsStore;
  const airportModuleSecurity = useAirportModuleSecurity();

  const ConditionTypeValues = Object.keys(CONDITION_TYPE_VALUE).map(
    key =>
      new SelectOption({
        name: ConditionTypeConfigModel.getConditionTypeName(CONDITION_TYPE_VALUE[key]),
        value: CONDITION_TYPE_VALUE[key],
      })
  );

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .loadConditionTypeConfig()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'conditionType' ], id)) {
      agGrid.showAlert('Condition Type should be unique.', 'ConditionTypeConfig');
      return true;
    }
    return false;
  };

  const upsertConditionTypeConfig = (rowIndex: number): void => {
    const data: ConditionTypeConfigModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertConditionTypeConfig(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ConditionTypeConfigModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertConditionTypeConfig'),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, 'conditionType');
        break;
      case GRID_ACTIONS.SAVE:
        upsertConditionTypeConfig(rowIndex);
        break;
      case GRID_ACTIONS.CANCEL:
        agGrid.cancelEditing(rowIndex);
        break;
      default:
        break;
    }
  };

  /* istanbul ignore next */
  const addNewType = (): void => {
    agGrid.addNewItems([ new ConditionTypeConfigModel({ id: 0 }) ], { startEditing: false, colKey: 'conditionType' });
    gridState.setHasError(true);
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Condition Type',
      field: 'conditionType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: any) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Condition Type',
        getAutoCompleteOptions: () => _settingsStore.conditionTypes,
        valueGetter: (option: ConditionTypeModel) => option,
      },
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      headerName: 'Is Dropdown',
      field: 'isDropDown',
      cellEditor: 'checkBoxRenderer',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
    },
    {
      headerName: 'API Source',
      field: 'apiSource',
    },
    {
      headerName: 'Condition Type Value',
      field: 'conditionValueType',
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: any) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Condition Type Value',
        getAutoCompleteOptions: () => ConditionTypeValues,
      },
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
    },
    {
      ...agGrid.actionColumn({ hide: !airportModuleSecurity.isSettingsEditable }),
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
      isEditable: airportModuleSecurity.isSettingsEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });
    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { searchValue, selectInputsValues } = searchHeader.getFilters();
        if (!searchValue) {
          return false;
        }
        const { id, apiSource, conditionValueType, conditionType } = node.data as ConditionTypeConfigModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [CONDITION_TYPE_CONFIG.API_SOURCE]: apiSource,
              [CONDITION_TYPE_CONFIG.CONDITION_VALUE]: conditionValueType.label,
              [CONDITION_TYPE_CONFIG.CONDITION_TYPE]: conditionType.label,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: e => {
        agGrid.onRowEditingStarted(e);
        _settingsStore
          .loadConditionTypes()
          .pipe(
            takeUntil(unsubscribe.destroy$),
            finalize(() => UIStore.setPageLoader(false))
          )
          .subscribe(response => setConditionType(response));
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!airportModuleSecurity.isSettingsEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addNewType}
      >
        Add Condition Type Config
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        // eslint-disable-next-line max-len
        selectInputs={[ agGridUtilities.createSelectOption(CONDITION_TYPE_CONFIG, CONDITION_TYPE_CONFIG.CONDITION_TYPE) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('airportSettingsStore')(observer(ConditionTypeConfig));

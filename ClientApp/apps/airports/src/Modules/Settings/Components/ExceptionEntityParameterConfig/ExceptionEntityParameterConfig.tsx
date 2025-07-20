import React, { FC, ReactNode, useEffect } from 'react';
import {
  AirportSettingsStore,
  ENTITY_PARAMETER_TYPE,
  EXCEPTION_ENTITY_PARAMETER_CONFIG,
  ExceptionEntityParameterConfigModel,
} from '../../../Shared';
import { AxiosError } from 'axios';
import { inject, observer } from 'mobx-react';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useUnsubscribe } from '@wings-shared/hooks';
import { takeUntil, finalize } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { UIStore, GRID_ACTIONS, Utilities, SelectOption } from '@wings-shared/core';
import { useGridState, useAgGrid, agGridUtilities, CustomAgGridReact } from '@wings-shared/custom-ag-grid';

interface Props {
  isEditable: boolean;
  airportSettingsStore?: AirportSettingsStore;
}

const ExceptionEntityParameterConfig: FC<Props> = ({ ...props }) => {
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<EXCEPTION_ENTITY_PARAMETER_CONFIG, ExceptionEntityParameterConfigModel>([], gridState);
  const _settingsStore = props.airportSettingsStore as AirportSettingsStore;

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _settingsStore
      .loadExceptionEntityParameterConfigs()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (id: number): boolean => {
    if (agGrid._isAlreadyExists([ 'exceptionEntityType' ], id)) {
      agGrid.showAlert('Exception Entity Type should be unique.', 'exceptionEntityParameterConfig');
      return true;
    }
    return false;
  };

  const upsertExceptionEntityParameterConfig = (rowIndex: number): void => {
    const data: ExceptionEntityParameterConfigModel = agGrid._getTableItem(rowIndex);
    if (isAlreadyExists(data.id)) {
      return;
    }
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    _settingsStore
      .upsertExceptionEntityParameterConfig(model)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: ExceptionEntityParameterConfigModel) => agGrid._updateTableItem(rowIndex, response),
        error: (error: AxiosError) => agGrid.showAlert(error.message, 'upsertExceptionConfig'),
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (rowIndex === null) {
      return;
    }
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        agGrid._startEditingCell(rowIndex, 'exceptionEntityType');
        break;
      case GRID_ACTIONS.SAVE:
        upsertExceptionEntityParameterConfig(rowIndex);
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
    agGrid.addNewItems([ new ExceptionEntityParameterConfigModel({ id: 0 }) ], {
      startEditing: false,
      colKey: 'exceptionEntityType',
    });
    gridState.setHasError(true);
  };

  const entityParameterTypes = Object.keys(ENTITY_PARAMETER_TYPE).map(
    key =>
      new SelectOption({
        name: ExceptionEntityParameterConfigModel.getConditionTypeName(ENTITY_PARAMETER_TYPE[key]),
        value: ENTITY_PARAMETER_TYPE[key],
      })
  );

  const columnDefs: ColDef[] = [
    {
      headerName: 'Exception Entity Type',
      field: 'exceptionEntityType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: any) => value?.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'label'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Condition Type',
        getAutoCompleteOptions: () => _settingsStore.exceptionEntityTypes,
      },
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
      headerName: 'Entity Parameter Type',
      field: 'entityParameterType',
      cellEditor: 'customAutoComplete',
      filter: false,
      valueFormatter: ({ value }: any) => value?.label,
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Entity Parameter Type',
        getAutoCompleteOptions: () => entityParameterTypes,
      },
    },
    {
      headerName: 'Entity Parameter',
      field: 'entityParameter',
    },
    {
      headerName: 'Supported Operators',
      field: 'supportedOperators',
      cellRenderer: 'agGridChipView',
      filter: false,
      sortable: false,
      valueFormatter: ({ value }: any) => value?.label,
    },
    {
      ...agGrid.actionColumn({ hide: !props.isEditable }),
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
      isEditable: props.isEditable,
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
        const {
          id,
          apiSource,
          exceptionEntityType,
          entityParameter,
          entityParameterType,
        } = node.data as ExceptionEntityParameterConfigModel;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [EXCEPTION_ENTITY_PARAMETER_CONFIG.API_SOURCE]: apiSource,
              [EXCEPTION_ENTITY_PARAMETER_CONFIG.EXCEPTION_ENTITY_TYPE]: exceptionEntityType.label,
              [EXCEPTION_ENTITY_PARAMETER_CONFIG.ENTITY_PARAMETER]: entityParameter,
              [EXCEPTION_ENTITY_PARAMETER_CONFIG.ENTITY_PARAMETER_TYPE]: entityParameterType?.label,
            },
            searchValue,
            selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: e => {
        agGrid.onRowEditingStarted(e);
        _settingsStore.loadExceptionEntityTypes().subscribe();
        _settingsStore.loadExceptionConditionalOperators();
      },
    };
  };

  const rightContent = (): ReactNode => {
    if (!props.isEditable) {
      return null;
    }
    return (
      <PrimaryButton
        variant="contained"
        startIcon={<AddIcon />}
        disabled={gridState.isRowEditing || UIStore.pageLoading}
        onClick={addNewType}
      >
        Add Exception Entity Parameter Config
      </PrimaryButton>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        rightContent={rightContent}
        // eslint-disable-next-line max-len
        selectInputs={[
          agGridUtilities.createSelectOption(
            EXCEPTION_ENTITY_PARAMETER_CONFIG,
            EXCEPTION_ENTITY_PARAMETER_CONFIG.EXCEPTION_ENTITY_TYPE
          ),
        ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
        onExpandCollapse={agGrid.autoSizeColumns}
      />
      <CustomAgGridReact isRowEditing={gridState.isRowEditing} rowData={gridState.data} gridOptions={gridOptions()} />
    </>
  );
};

export default inject('airportSettingsStore')(observer(ExceptionEntityParameterConfig));

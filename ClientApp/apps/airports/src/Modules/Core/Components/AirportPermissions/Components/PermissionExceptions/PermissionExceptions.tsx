/* eslint-disable no-debugger */
import React, { FC, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { AirportSettingsStore, PermissionExceptionModel, useAirportModuleSecurity } from '../../../../../Shared';
import { useStyles } from '../PermissionGrid.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { GRID_ACTIONS, ISelectOption, SettingsTypeModel, UIStore, Utilities, ViewPermission } from '@wings-shared/core';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  ICellEditorParams,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import { EDITOR_TYPES } from '@wings-shared/form-controls';
import {
  AgGridDynamicEntityEditor,
  DynamicEntityStore,
  IAgGridDynamicEntityEditor,
  AgGridDynamicValueRenderer,
  useDynamicEntityMapper,
} from '@wings/shared';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  airportSettingsStore?: AirportSettingsStore;
  isEditable: boolean;
  exceptions: PermissionExceptionModel[];
  onGridDataUpdate: (gridName: string, gridData: PermissionExceptionModel[]) => void;
  isRowEditing: (isEditing: boolean) => void;
}

const PermissionExceptions: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const classes = useStyles();
  const agGrid = useAgGrid<'', PermissionExceptionModel>([], gridState);
  const dynamicMapper = useDynamicEntityMapper();
  const _airportSettingStore = props.airportSettingsStore as AirportSettingsStore;
  const _disabled = gridState.isRowEditing || UIStore.pageLoading || !props.isEditable;
  const { isEditable } = useAirportModuleSecurity();

  const confirm = useConfirmDialog();
  const _dynamicEntityStore = new DynamicEntityStore();
  const [ isLoadingConfig, setIsLoadingConfig ] = useState(false);

  useEffect(() => {
    _airportSettingStore?.loadExceptionEntityParameterConfigs().subscribe(() => setIsLoadingConfig(false));
  }, []);

  /* istanbul ignore next */
  useEffect(() => {
    agGrid.setColumnVisible('actionRenderer', props.isEditable);
    gridState.setGridData(props.exceptions);
  }, [ props.exceptions, props.isEditable ]);

  const onInputChange = ({ colDef, data }: ICellEditorParams, value: string): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  // Clear some fileds on selection change
  const clearValues = keys => {
    if (!Array.isArray(keys)) {
      return;
    }
    keys.forEach(keyName => {
      const value = keyName == 'permissionExceptionValues' ? [] : '';
      agGrid.getComponentInstance(keyName)?.setValue(value);
    });
  };

  // This help us to get config related params
  const getEntityConfig = () => {
    const searchEntity = agGrid.getInstanceValue<{ id: number }>('entityParameter');
    if (!searchEntity) return null;

    const option = _airportSettingStore.exceptionEntityParameterConfigs.find(x => x.id === searchEntity?.id);
    if (!option) return null;
    return option;
  };

  const getEditorType = option => {
    if (option.entityParameterType?.name === 'Boolean') {
      return EDITOR_TYPES.SELECT_CONTROL;
    }

    return EDITOR_TYPES.DROPDOWN;
  };

  // Sync Exception Values
  const syncExceptionValues = (): void => {
    const instance = agGrid.getComponentInstance('permissionExceptionValues') as IAgGridDynamicEntityEditor;
    if (!instance) return;
    const option = getEntityConfig();
    if (!option) return;

    const ediotrType = option.isDropDown ? getEditorType(option) : EDITOR_TYPES.TEXT_FIELD;
    instance.setEditorType(ediotrType);
    const operator = agGrid.getInstanceValue<ISelectOption>('exceptionConditionalOperator')?.label;
    instance.setConditionOperator(operator);

    const inputType = option.entityParameterType?.name?.toLowerCase() === 'integer' ? 'number' : 'text';
    instance.setInputType(inputType);
  };

  const onDropDownChange = ({ colDef, data }: ICellEditorParams, value: ISelectOption): void => {
    switch (colDef.field) {
      case 'exceptionEntityType':
        clearValues([ 'entityParameter', 'exceptionConditionalOperator', 'permissionExceptionValues' ]);
        break;
      case 'entityParameter':
        clearValues([ 'exceptionConditionalOperator', 'permissionExceptionValues' ]);
        syncExceptionValues();
        break;
      case 'exceptionConditionalOperator':
        clearValues([ 'permissionExceptionValues' ]);
        syncExceptionValues();
        break;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const addNewException = (): void => {
    agGrid.setColumnVisible('actionRenderer', true);
    agGrid.addNewItems([ new PermissionExceptionModel({ id: 0 }) ], {
      startEditing: false,
      colKey: 'name',
    });
    gridState.setHasError(true);
  };

  const updateTableData = (): void => {
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    props.onGridDataUpdate('permissionExceptions', gridState.data);
    props.isRowEditing(false);
  };

  const removeTableData = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    const filteredData = gridState.data.filter(({ id }) => model.id !== id);
    gridState.setGridData(filteredData);
    props.onGridDataUpdate('permissionExceptions', filteredData);
  };

  // Property Value
  const getEntityParameterOptions = () => {
    const exceptionEntityType = agGrid.getInstanceValue<ISelectOption>('exceptionEntityType')?.label;
    if (!exceptionEntityType) return [];

    const options = _airportSettingStore.exceptionEntityParameterConfigs.filter(x =>
      Utilities.isEqual(x.exceptionEntityType?.name, exceptionEntityType)
    );
    return options.map(x => new SettingsTypeModel({ id: x.id, name: x.entityParameter }));
  };

  const getConditionOpertorOptions = () => {
    const entityParameter = agGrid.getInstanceValue<ISelectOption>('entityParameter')?.label;
    const options = _airportSettingStore.exceptionEntityParameterConfigs
      .filter(x => Utilities.isEqual(x.entityParameter, entityParameter))
      .map(x => x.supportedOperators)
      .flat();
    return options;
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
        updateTableData();
        props.isRowEditing(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirm.confirmAction(() => removeTableData(rowIndex), {
          message: 'Are you sure you want to delete this exception?',
          isDelete: true,
          title: 'Delete Exception',
        });
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        props.isRowEditing(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      cellEditorParams: {
        placeHolder: 'Name',
        rules: 'string|required',
      },
    },
    {
      headerName: 'Requirement',
      field: 'exceptionRequirement',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Requirement',
        getAutoCompleteOptions: () => _airportSettingStore.exceptionRequirements,
      },
    },
    {
      headerName: 'Entity Type',
      field: 'exceptionEntityType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Condition Type',
        getAutoCompleteOptions: () => _airportSettingStore.exceptionEntityTypes,
      },
    },
    {
      headerName: 'Entity Parameter',
      field: 'entityParameter',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Entity',
        getAutoCompleteOptions: () => getEntityParameterOptions(),
      },
    },
    {
      headerName: 'Condition Operator ',
      field: 'exceptionConditionalOperator',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Condition Operator',
        getAutoCompleteOptions: () => getConditionOpertorOptions(),
      },
    },
    {
      headerName: 'Condition Value',
      field: 'permissionExceptionValues',
      cellEditor: 'permissionExceptionValueEditor',
      cellRenderer: 'agGridDynamicValueRenderer',
      cellEditorParams: {
        isRequired: true,
        getDisableState: (node: RowNode) => isLoadingConfig,
        getAutoCompleteOptions: () => [],
        onSearch: (searchText: string) => {
          const config = getEntityConfig();
          return _dynamicEntityStore.searchEntity(searchText, config.apiSource.toLowerCase());
        },
      },
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              action: GRID_ACTIONS.EDIT,
            },
            // {
            //   title: 'Delete',
            //   action: GRID_ACTIONS.DELETE,
            // },
          ],
          onAction: gridActions,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable,
      gridActionProps: {
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: gridActions,
      },
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      frameworkComponents: {
        ...baseOptions.frameworkComponents,
        permissionExceptionValueEditor: AgGridDynamicEntityEditor,
        agGridDynamicValueRenderer: AgGridDynamicValueRenderer,
      },
      suppressClickEdit: true,
      onGridReady: (param: GridReadyEvent) => {
        agGrid.onGridReady(param);
        agGrid.setColumnVisible('actionRenderer', props.isEditable);
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        props.isRowEditing(true);
        _airportSettingStore?.loadExceptionRequirements().subscribe();
        _airportSettingStore?.loadExceptionEntityTypes().subscribe();
        setTimeout(() => syncExceptionValues(), 100); // Delay to ensure the grid is ready
      },
    };
  };

  return (
    <>
      <div className={classes.addButtonContainer}>
        <ViewPermission hasPermission={props.isEditable}>
          <PrimaryButton variant="contained" startIcon={<AddIcon />} disabled={_disabled} onClick={addNewException}>
            Add Exception
          </PrimaryButton>
        </ViewPermission>
      </div>
      <div className={classes.gridWrapper}>
        <CustomAgGridReact
          rowData={gridState.data}
          gridOptions={gridOptions()}
          isRowEditing={gridState.isRowEditing}
          hidePagination={true}
        />
      </div>
    </>
  );
};

export default inject('airportSettingsStore')(observer(PermissionExceptions));

import React, { FC, useEffect } from 'react';
import { ICellRendererParams, GridOptions, ColDef, ICellEditorParams, ValueFormatterParams } from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { UIStore, Utilities, GRID_ACTIONS, DATE_FORMAT, SettingsTypeModel, EntityMapModel } from '@wings-shared/core';
import { observer, inject } from 'mobx-react';
import { SettingsStore, useCountryModuleSecurity } from '../../../../Shared';
import { BasePermitStore, FlightPlanningACASGridModel, IUseUpsert } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from '../OperationalRequirements.styles';
import { useConfirmDialog } from '@wings-shared/hooks';
import { AlertStore } from '@uvgo-shared/alert';

interface Props extends Partial<ICellRendererParams> {
  isEditable?: boolean;
  onRowEditingChange: (isRowEditing: boolean) => void;
  settingsStore?: SettingsStore;
  basePermitStore?: BasePermitStore;
  onDataSave: (response: FlightPlanningACASGridModel[]) => void;
  acasiiAdditionalInformations: FlightPlanningACASGridModel[];
  acasiIdataIsRqrd?: boolean;
  useUpsert?: IUseUpsert;
}

const FlightPlanningACASGrid: FC<Props> = ({
  isEditable,
  settingsStore,
  onRowEditingChange,
  basePermitStore,
  onDataSave,
  acasiiAdditionalInformations,
  acasiIdataIsRqrd,
  useUpsert,
}: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', FlightPlanningACASGridModel>([], gridState);
  const _useConfirmDialog = useConfirmDialog();
  const countryModuleSecurity = useCountryModuleSecurity();

  useEffect(() => {
    loadInitialData();
  }, [ acasiiAdditionalInformations, acasiIdataIsRqrd ]);

  const loadInitialData = () => {
    if (!acasiIdataIsRqrd) {
      gridState.setIsRowEditing(false);
      gridState.setHasError(false);
    }
    gridState.setGridData(acasiiAdditionalInformations);
  };

  const addFlightPlanningACAS = (): void => {
    const flightPlanningACASGridModel = new FlightPlanningACASGridModel({ id: 0, airworthinessDate: '' });
    const colKey: string = 'flightOperationalCategory';
    agGrid.addNewItems([ flightPlanningACASGridModel ], { startEditing: false, colKey });
    gridState.setHasError(true);
  };

  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const isAlreadyExists = (): boolean => {
    // save button will not enable without these keys
    const objTypeKeys = [ 'flightOperationalCategory', 'requirementType' ];
    const planKeys = [ 'mtowMin', 'paxMin', 'airworthinessDate' ];
    const columns = objTypeKeys.concat(planKeys);
    const editorInstance = gridState.gridApi.getCellEditorInstances({ columns });
    const currentItem = columns.reduce((total, key, idx) => {
      if (!editorInstance[idx]?.getValue()) {
        return total;
      }
      return {
        ...total,
        [key]: editorInstance[idx].getValue(),
      };
    }, {});

    const hasDuplicate = gridState.data.some(item => {
      const firstMatch = objTypeKeys.every(key =>
        Utilities.isEqual(currentItem[key]?.name || '', item[key]?.name || '')
      );

      if (!firstMatch) {
        return false;
      }
      if (Object.keys(currentItem).length > 2) {
        return planKeys.some(key => {
          const currentItemValue = key === 'airworthinessDate' ? currentItem[key] : Number(currentItem[key]);
          const itemValue = key === 'airworthinessDate' ? item[key] : Number(item[key]);
          return Utilities.isEqual(currentItemValue, itemValue);
        });
      }
      return planKeys.every(key => !Boolean(item[key]));
    });

    if (hasDuplicate) {
      AlertStore.critical('ACAS Information should be unique');
      return true;
    }
    return false;
  };

  const updateTableData = (): void => {
    if (isAlreadyExists()) {
      return;
    }
    gridState.gridApi.stopEditing();
    const data = agGrid._getAllTableRows();
    gridState.setGridData(data);
    onDataSave(gridState.data);
  };

  const upsertACASII = (rowIndex): void => {
    updateTableData();
  };

  const deleteACASII = (model: FlightPlanningACASGridModel): void => {
    agGrid._removeTableItems([ model ]);
    updateTableData();
    ModalStore.close();
  };

  const confirmRemoveACASII = (rowIndex: number): void => {
    const model: FlightPlanningACASGridModel = agGrid._getTableItem(rowIndex);
    if (model.id === 0) {
      deleteACASII(model);
      return;
    }
    _useConfirmDialog.confirmAction(() => deleteACASII(model), { isDelete: true });
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
        upsertACASII(rowIndex);
        onRowEditingChange(false);
        break;
      case GRID_ACTIONS.DELETE:
        confirmRemoveACASII(rowIndex);
        onRowEditingChange(false);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        agGrid.cancelEditing(rowIndex);
        onRowEditingChange(false);
        break;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Flight Operational Category',
      field: 'flightOperationalCategory',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Flight Operational Category',
        getAutoCompleteOptions: () => {
          return basePermitStore?.flightOperationalCategories;
        },
        valueGetter: (option: EntityMapModel) => {
          return option;
        },
      },
      headerTooltip: 'Flight Operational Category',
      comparator: (current: EntityMapModel, next: EntityMapModel) => Utilities.customComparator(current, next, 'code'),
    },
    {
      headerName: 'Requirement Type',
      field: 'requirementType',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Select Requirement Type',
        getAutoCompleteOptions: () => settingsStore?.requirementType,
        valueGetter: (option: SettingsTypeModel) => {
          return option;
        },
      },
      headerTooltip: 'Requirement Type',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
    },
    {
      headerName: 'MTOW Min',
      field: 'mtowMin',
      cellEditorParams: {
        rules: 'numeric|min:1|max:999999',
      },
      headerTooltip: 'MTOW Min',
    },
    {
      headerName: 'PAX Min',
      field: 'paxMin',
      cellEditorParams: {
        rules: 'numeric|min:1|max:999',
      },
      headerTooltip: 'PAX Min',
    },
    {
      headerName: 'Airworthiness Date',
      field: 'airworthinessDate',
      cellEditor: 'customTimeEditor',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
      headerTooltip: 'Airworthiness Date',
      comparator: (current, next) => Utilities.customDateComparator(current, next),
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            { title: 'Edit', action: GRID_ACTIONS.EDIT },
            { title: 'Delete', action: GRID_ACTIONS.DELETE },
          ],
        },
      }),
    },
  ];

  const onDropDownChange = (params: ICellEditorParams, value: any): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        hideActionButtons: !isEditable,
        showDeleteButton: false,
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      pagination: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
        onRowEditingChange(true);
        basePermitStore?.getFlightOperationalCategories().subscribe();
        settingsStore?.getRequirementType().subscribe();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
      },
    };
  };

  return (
    <div className={classes.gridRoot}>
      <AgGridMasterDetails
        addButtonTitle="Add ACAS Information"
        onAddButtonClick={() => addFlightPlanningACAS()}
        hasAddPermission={countryModuleSecurity.isEditable}
        disabled={!isEditable || gridState.hasError || gridState.isRowEditing || UIStore.pageLoading}
        key={`master-details-${isEditable}`}
      >
        <CustomAgGridReact gridOptions={gridOptions()} rowData={gridState.data} isRowEditing={gridState.isRowEditing} />
      </AgGridMasterDetails>
    </div>
  );
};

export default inject(
  'operationalRequirementStore',
  'settingsStore',
  'basePermitStore'
)(observer(FlightPlanningACASGrid));

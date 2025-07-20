import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, ICellEditorParams } from 'ag-grid-community';
import { regex, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { EtpSettingsStore, PENALTY_CATEGORY, EtpPenaltyModel } from '../../../Shared';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';

interface Props {
  isEditable: boolean;
  rowData: EtpPenaltyModel[];
  etpSettingsStore?: EtpSettingsStore;
  onDataUpdate: (etpPenalties: EtpPenaltyModel[]) => void;
}

const EtpPenaltiesGrid = ({ isEditable, rowData, etpSettingsStore, onDataUpdate }, ref) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<'', EtpPenaltyModel>([], gridState);
  const _etpSettingsStore = etpSettingsStore as EtpSettingsStore;
  const unRequiredCategory: string[] = [
    PENALTY_CATEGORY.ICE_PENALTY_PERCENTAGE,
    PENALTY_CATEGORY.APPLY_ICE_PENALTY,
    PENALTY_CATEGORY.WIND_SPEED_ADJUSTMENT,
  ];
  const defaultBiasFieldRule = `numeric|between:0.01,99999|regex:${regex.numberWithTwoDecimal}`;
  const validatedCategory: string[] = [ PENALTY_CATEGORY.APPLY_ICE_PENALTY, PENALTY_CATEGORY.ICE_PENALTY_PERCENTAGE ];
  const hasValidBiasField = observable({
    data: false,
  });

  useEffect(() => {
    gridState.setGridData(rowData);
  }, []);

  const hasPenaltyError = useMemo(() => {
    return gridState.data
      .filter(a => a.biasFields)
      .some(a => (unRequiredCategory.includes(a.etpPenaltyCategory.name) ? false : !Boolean(a.etpPenaltyBiasType?.id)));
  }, [ gridState.data ]);

  useImperativeHandle(
    ref,
    () => {
      return {
        resetData,
        hasPenaltyError,
      };
    },
    [ hasPenaltyError ]
  );

  const resetData = (etpPenalties: EtpPenaltyModel[]): void => {
    gridState.setGridData(etpPenalties);
    gridState.gridApi.redrawRows();
  };

  const isBiasEditable = (): boolean => {
    const AICData = agGrid._getTableItem(0);
    const EAIUData = agGrid._getTableItem(1);
    return hasRequiredData(AICData) || hasRequiredData(EAIUData);
  };

  const hasRequiredData = (rowData: EtpPenaltyModel): boolean => {
    if (!rowData.biasFields) {
      return false;
    }
    const { etpPenaltyBiasType, etpPenaltyApplyTo } = rowData;
    return (
      (Utilities.isEqual(etpPenaltyBiasType.name, 'Rate') || Utilities.isEqual(etpPenaltyBiasType.name, 'Percent')) &&
      Utilities.isEqual(etpPenaltyApplyTo.name, 'Total')
    );
  };

  /* istanbul ignore next */
  const isEditables = (colDef: ColDef, rowIndex: number): boolean => {
    const rowData = agGrid._getTableItem(rowIndex);
    const categoryName = rowData.etpPenaltyCategory.name; // as PENALTY_CATEGORY;
    if (!isEditable) {
      return false;
    }
    switch (colDef.field) {
      case 'biasFields':
        return validatedCategory.includes(categoryName) ? isBiasEditable() : true;
      case 'etpPenaltyBiasType':
      case 'etpPenaltyApplyTo':
        return !unRequiredCategory.includes(categoryName) && Boolean(rowData.biasFields);
      default:
        return true;
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'etpPenaltyCategory',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      editable: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
    },
    {
      headerName: 'Bias',
      field: 'biasFields',
      cellEditorParams: {
        rules: defaultBiasFieldRule,
      },
    },
    {
      headerName: 'Type',
      field: 'etpPenaltyBiasType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        isRequired: () => hasValidBiasField.data,
        placeHolder: 'Bias Type',
        getAutoCompleteOptions: () => _etpSettingsStore.ETPPenaltyBias,
        valueGetter: (option: SettingsTypeModel) => option,
      },
    },
    {
      headerName: 'Apply to',
      field: 'etpPenaltyApplyTo',
      cellEditor: 'customAutoComplete',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name,
      cellEditorParams: {
        placeHolder: 'Apply',
        getAutoCompleteOptions: () => _etpSettingsStore.ETPPenaltyApply,
        valueGetter: (option: SettingsTypeModel) => option,
      },
    },
  ];

  /* istanbul ignore next */
  const onEditingStart = (rowIndex: number, colDef: ColDef): void => {
    const rowData = agGrid._getTableItem(rowIndex);
    if (Utilities.isEqual(colDef.field || '', 'biasFields')) {
      const cellInstance = agGrid.getComponentInstance('biasFields');
      switch (rowData.etpPenaltyCategory.name) {
        case PENALTY_CATEGORY.ICE_PENALTY_PERCENTAGE:
          cellInstance.setRules('numeric|between:10,99');
          break;
        case PENALTY_CATEGORY.APPLY_ICE_PENALTY:
          cellInstance.setRules('numeric|between:0.1,2');
          break;
        case PENALTY_CATEGORY.WIND_SPEED_ADJUSTMENT:
          cellInstance.setRules('numeric|between:1,99');
          break;
        default:
          cellInstance.setRules(defaultBiasFieldRule);
          break;
      }
    }
  };

  const resetGridRow = (rowIndex: number, rowData: EtpPenaltyModel): void => {
    gridState.gridApi
      .getRowNode(rowIndex.toString())
      ?.setData(new EtpPenaltyModel({ etpPenaltyCategory: rowData.etpPenaltyCategory, biasFields: null as any }));
    gridState.setGridData(agGrid._getAllTableRows());
    onDataUpdate(gridState.data);
  };

  /* istanbul ignore next */
  const onEditingStop = (rowIndex: number, colDef: ColDef): void => {
    const rowData = agGrid._getTableItem(rowIndex);
    if (Utilities.isEqual(colDef.field || '', 'biasFields')) {
      if (rowData.biasFields) {
        if (validatedCategory.includes(rowData.etpPenaltyCategory.name)) {
          {
            const updatingCategory = Utilities.isEqual(
              rowData.etpPenaltyCategory.name,
              PENALTY_CATEGORY.APPLY_ICE_PENALTY
            )
              ? PENALTY_CATEGORY.ICE_PENALTY_PERCENTAGE
              : PENALTY_CATEGORY.APPLY_ICE_PENALTY;
            const updatingIndex = gridState.data.findIndex(a =>
              Utilities.isEqual(a.etpPenaltyCategory.name, updatingCategory)
            );
            const updatingRowData = agGrid._getTableItem(updatingIndex);
            resetGridRow(updatingIndex, updatingRowData);
          }
        }
      } else {
        resetGridRow(rowIndex, rowData);
      }
    }
    setIppOrAipValidation();
    onDataUpdate(gridState.data);
  };

  const setIppOrAipValidation = (): void => {
    if (isBiasEditable()) {
      return;
    }
    resetRowByCategory(PENALTY_CATEGORY.ICE_PENALTY_PERCENTAGE);
    resetRowByCategory(PENALTY_CATEGORY.APPLY_ICE_PENALTY);
  };

  const resetRowByCategory = (category: string): void => {
    const updatingIndex = gridState.data.findIndex(a => Utilities.isEqual(a.etpPenaltyCategory.name, category));
    const updatingRowData = agGrid._getTableItem(updatingIndex);
    resetGridRow(updatingIndex, updatingRowData);
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onInputChange: onInputChange,
        onDropDownChange: () => gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi)),
      },
      columnDefs,
      isEditable: true,
      editType: 'cellOnly',
    });
    return {
      ...baseOptions,
      postSort: () => null,
      suppressClickEdit: true,
      onCellDoubleClicked: ({ rowIndex, colDef }) => {
        if (isEditables(colDef, Number(rowIndex))) {
          gridState.gridApi.startEditingCell({ rowIndex: Number(rowIndex), colKey: colDef.field || '' });
        }
      },
      onCellEditingStarted: ({ rowIndex, colDef }) => {
        onEditingStart(Number(rowIndex), colDef);
      },
      onCellEditingStopped: ({ rowIndex, colDef }) => {
        onEditingStop(Number(rowIndex), colDef);
      },
    };
  };

  // Called from Ag Grid Component
  const onInputChange = (params: ICellEditorParams, value: string): void => {
    const colId: string = params.column.getColId();
    if (Utilities.isEqual(colId, 'biasFields')) {
      const hasBiasError = agGrid.getComponentInstance('biasFields').hasError;
      hasValidBiasField.data = !hasBiasError;
    }
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  return (
    <CustomAgGridReact
      rowData={gridState.data}
      gridOptions={gridOptions()}
      disablePagination={gridState.isRowEditing}
    />
  );
};

export default inject('etpSettingsStore')(observer(forwardRef(EtpPenaltiesGrid)));

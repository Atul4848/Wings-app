import {
  ValueFormatterParams,
  ProcessCellForExportParams,
  ExportParams,
  ExcelExportParams,
  CsvExportParams,
} from 'ag-grid-community';
import { SelectOption } from '@wings-shared/core';

// Params for Export Excel File
const getGridExportParams = (): ExportParams<CsvExportParams | ExcelExportParams> => {
  return {
    processCellCallback: (params: ProcessCellForExportParams) => {
      const { accumulatedRowIndex, node = null, ...restProps } = params;
      const formatterParams: ValueFormatterParams = {
        ...restProps,
        node,
        colDef: params.column.getColDef(),
        data: params.value,
      };
      const { valueFormatter } = restProps.column.getColDef();
      return valueFormatter instanceof Function ? valueFormatter(formatterParams) : params.value;
    },
    allColumns: true,
    skipColumnGroupHeaders: true,
  };
};

// Create Select Option for Header Search Control
const createSelectOption = (
  value: object,
  defaultValue: string,
  fieldKey = 'defaultOption',
  predicate = option => true // By Default Allow All Fields
) => ({
  fieldKey: fieldKey || 'defaultOption',
  defaultValue,
  selectOptions: Object.values(value)
    .filter(predicate)
    .map(option => new SelectOption({ name: option, value: option })),
});

// Make Clip Board Data
const processCellForClipboard = params => {
  const { accumulatedRowIndex, node, ...restProps } = params;
  const formatterParams: ValueFormatterParams = {
    ...restProps,
    node,
    colDef: params.column.getColDef(),
    data: params.value,
  };
  const { valueFormatter } = restProps.column.getColDef();
  return valueFormatter instanceof Function ? valueFormatter(formatterParams) : params.value;
};

// Make Sure you are adding Stateless function here ...
// If your function needs to use gridState then use it from useAgGrid hook
export const agGridUtilities = { getGridExportParams, createSelectOption, processCellForClipboard };

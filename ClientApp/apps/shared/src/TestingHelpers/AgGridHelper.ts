import { ShallowWrapper, ReactWrapper } from 'enzyme';
import {
  ColDef,
  GridOptions,
  ValueFormatterParams,
  ValueGetterParams,
  EditableCallbackParams,
} from 'ag-grid-community';
import { AgGridMasterDetails, CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import { IAgGridPropsMock, IParentComponentMock } from '../Interfaces';
import { ColumnApiMock, GridApiMock } from '../Mocks';
import { GRID_ACTIONS, SettingsTypeModel } from '@wings-shared/core';
import { expect } from 'chai';
export class AgGridTestingHelper {
  private isMount: boolean = false; // If mount true then it's a ReactWrapper
  private wrapper: ShallowWrapper | ReactWrapper;

  constructor(wrapper: ShallowWrapper | ReactWrapper, isMount = false) {
    this.isMount = isMount;
    this.wrapper = wrapper;
  }

  getGridOptions = (): GridOptions => this.getAgGridProps().gridOptions;

  getAgGridComponent = (hasMasterDetails: boolean = true) => {
    const masterDetails = hasMasterDetails ? this.wrapper.find(AgGridMasterDetails) : this.wrapper;
    const agGrid = masterDetails.find(CustomAgGridReact);
    return this.isMount ? agGrid : (agGrid as ShallowWrapper).dive();
  };

  getAgGridProps = (): IAgGridPropsMock => {
    return this.wrapper.find(CustomAgGridReact).props() as IAgGridPropsMock;
  };

  getCellEditorParams = () => this.getGridOptions()?.defaultColDef?.cellEditorParams;

  // Call on Action From Child
  onAction = (gridAction: GRID_ACTIONS, value: any) => {
    const cellEditorParams = this.getGridOptions()?.defaultColDef?.cellEditorParams;
    if (cellEditorParams?.onAction) {
      cellEditorParams?.onAction(gridAction, value);
      if (this.isMount) {
        return;
      }
      // used to refresh component forcefully
      (this.wrapper as ShallowWrapper).setProps({ abc: Math.random() });
    }
  };

  getParentComponent = (): IParentComponentMock => this.getGridOptions()?.context?.componentParent;

  // Init grid internal props
  initAgGridAPI = () => {
    const options = this.getGridOptions();
    if (options.onGridReady) {
      options.onGridReady({ api: new GridApiMock(), columnApi: new ColumnApiMock(), type: '' });
    }
  };

  //compare different columns
  compareColumnValues = (fieldNames: string[], mockData1: any, mockData2: any): void => {
    const columnDefs = this.getGridOptions().columnDefs;

    columnDefs.forEach((col: ColDef) => {
      if (typeof col.comparator === 'function' && fieldNames.includes(col.field || '')) {
        const comparisonResult = col.comparator(mockData1, mockData2, null, null, false);
        expect(comparisonResult).to.equal(-1);
      }
    });
  };

  //validate the column foramting within coldefs
  validateColumnFormatting = (fieldsToCheck: string[], mockData: any): void => {
    const columnDefs = this.getGridOptions().columnDefs;
    columnDefs.forEach((col: ColDef) => {
      if (typeof col.valueFormatter === 'function' && fieldsToCheck.includes(col.field || '')) {
        const formattedValue = col.valueFormatter(mockData as ValueFormatterParams);
        expect(formattedValue).to.be.oneOf([ 'Mock Name', 'Mock Label', '', undefined ]);
      }
    });
  };

  //validate columnformatting with cell editor params
  validateCellEditorFormatting = (fieldsToCheck: string[], mockData: any): void => {
    const columnDefs = this.getGridOptions().columnDefs;
    columnDefs.forEach((col: ColDef) => {
      if (typeof col.valueFormatter === 'function' && fieldsToCheck.includes(col.field || '')) {
        const formattedValue = col?.cellEditorParams?.formatValue(mockData as ValueFormatterParams);
        expect(formattedValue).to.be.oneOf([ 'Mock Name', 'Mock Label', '', undefined ]);
      }
    });
  };

  //validate options of autocomplete within coldefs
  validateAutocompleteOptions = (fieldToOptionsMap: { [key: string]: any[] }): void => {
    const columnDefs: ColDef[] = this.getGridOptions().columnDefs;

    Object.keys(fieldToOptionsMap).forEach(field => {
      const columnDef = columnDefs.find((col: ColDef) => col.field === field);
      if (
        columnDef &&
        columnDef.cellEditorParams &&
        typeof columnDef.cellEditorParams.getAutoCompleteOptions === 'function'
      ) {
        const options = columnDef.cellEditorParams.getAutoCompleteOptions();
        expect(options).to.deep.equal(fieldToOptionsMap[field]);
      } else {
        throw new Error(`Column definition for field "${field}" not found or getAutoCompleteOptions function missing.`);
      }
    });
  };

  //check the action menus
  validateActionMenus = (expectedNumberOfMenus: number) => {
    const columnDefs = this.getGridOptions().columnDefs;

    columnDefs.forEach((col: ColDef) => {
      if (col.cellRenderer === 'actionRenderer') {
        const actionMenus = col.cellRendererParams?.actionMenus();
        expect(actionMenus).to.have.lengthOf(expectedNumberOfMenus);
      }
    });
  };

  //validate the disabled states
  testDisabledStateForColumns = (fieldsToCheck: string[], disabledColumns: string[], mockData: any) => {
    const columnDefs = this.getGridOptions().columnDefs;

    fieldsToCheck.forEach(field => {
      const columnDef: ColDef = columnDefs.find((col: ColDef) => col.field === field);

      if (columnDef && columnDef.cellEditorParams && typeof columnDef.cellEditorParams.getDisableState === 'function') {
        const disabledState = columnDef.cellEditorParams.getDisableState({ data: mockData });
        expect(disabledState).to.equal(disabledColumns.includes(field));
      } else {
        throw new Error(`Column definition for field "${field}" not found or getDisableState function missing.`);
      }
    });
  };

  //validate the value getter within coldefs
  testFilterValueGetter = (fieldsToCheck: string[], mockData: any, expectedValue: string) => {
    const columnDefs = this.getGridOptions().columnDefs;

    columnDefs.forEach((col: ColDef) => {
      if (typeof col.filterValueGetter === 'function' && fieldsToCheck.includes(col.field || '')) {
        const value = col.filterValueGetter(mockData as ValueGetterParams);
        expect(value).to.equal(expectedValue);
      }
    });
  };

  //validate the column editing within coldefs
  validateColumnEditorConfig = (fieldsToCheck: string[]): void => {
    const columnDefs = this.getGridOptions().columnDefs;
    const mockData = { id: null };
    columnDefs.forEach((col: ColDef) => {
      if (fieldsToCheck.includes(col.field || '')) {
        // Mock EditableCallbackParams
        const mockParams = {
          data: mockData,
          node: {}, // You can add more specific mock properties if needed
          column: {},
          colDef: col,
          api: {},
          context: {},
        } as EditableCallbackParams;

        // Validate editable condition
        if (typeof col.editable === 'function') {
          const isEditable = col.editable(mockParams);
          expect(isEditable).to.equal(!mockData?.id);
        }

        // Validate cellEditorParams
        if (col.cellEditorParams && col.cellEditorParams.rules) {
          expect(col.cellEditorParams.rules).to.be.a('string');
          expect(col.cellEditorParams.rules).to.match(/string|between:\d,\d/);
        }
      }
    });
  };
}

import { RowNode, ValueFormatterParams, ColGroupDef, ColDef } from 'ag-grid-community';
import { Utilities, DATE_FORMAT, cellStyle } from '@wings-shared/core';
import { ModelStatusOptions, SettingsBaseStore } from '@wings/shared';

/* istanbul ignore next */
export const auditFields = (isRowEditing, sort: boolean = true): (ColDef | ColGroupDef)[] => {
  return [
    {
      headerName: 'AD',
      groupId: 'auditDetails',
      suppressMenu: true,
      children: [
        {
          headerName: 'Modified By',
          headerTooltip: 'Modified By',
          field: 'modifiedBy',
          headerComponent: 'customHeader',
          minWidth: 120,
          editable: false,
          sortable: sort,
          cellEditorParams: {
            getDisableState: (node: RowNode) => isRowEditing,
          },
        },
        {
          headerName: 'Modified On',
          headerTooltip: 'Modified On',
          columnGroupShow: 'open',
          field: 'modifiedOn',
          minWidth: 120,
          cellEditor: 'customTimeEditor',
          editable: false,
          sortable: sort,
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
          cellEditorParams: {
            getDisableState: (node: RowNode) => isRowEditing,
          },
          comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
        },
        {
          headerName: 'Created By',
          headerTooltip: 'Created By',
          field: 'createdBy',
          columnGroupShow: 'open',
          minWidth: 120,
          editable: false,
          sortable: sort,
          cellEditorParams: {
            getDisableState: (node: RowNode) => isRowEditing,
          },
        },
        {
          headerName: 'Created On',
          headerTooltip: 'Created On',
          columnGroupShow: 'open',
          field: 'createdOn',
          minWidth: 120,
          cellEditor: 'customTimeEditor',
          editable: false,
          sortable: sort,
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.API_DATE_FORMAT),
          cellEditorParams: {
            getDisableState: (node: RowNode) => isRowEditing,
          },
          comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
        },
      ],
    },
  ];
};

export const actionColumn = (colDefData: ColDef) => ({
  headerName: '',
  field: 'actionRenderer',
  cellRenderer: 'actionRenderer',
  cellEditor: 'actionRenderer',
  suppressColumnsToolPanel: true,
  maxWidth: 150,
  minWidth: 130,
  sortable: false,
  filter: false,
  suppressSizeToFit: true,
  suppressNavigable: true,
  cellStyle: { ...cellStyle() },
  ...colDefData,
});

export const generalFields = (store: SettingsBaseStore, sort?: string): (ColDef | ColGroupDef)[] => {
  return [
    {
      headerName: 'GD',
      groupId: 'generalDetails',
      suppressMenu: true,
      children: [
        {
          headerName: 'Status',
          field: 'status',
          headerComponent: 'customHeader',
          cellRenderer: 'statusRenderer',
          cellEditor: 'customAutoComplete',
          headerTooltip: 'Status',
          minWidth: 120,
          sort: sort || null,
          comparator: (current, next) => Utilities.customComparator(current, next, 'value'),
          filter: false,
          valueFormatter: ({ value }) => value?.label || '',
          cellEditorParams: {
            isRequired: true,
            placeHolder: 'Status',
            getAutoCompleteOptions: () => ModelStatusOptions,
          },
        },
        {
          headerName: 'Source Type',
          field: 'sourceType',
          cellEditor: 'customAutoComplete',
          columnGroupShow: 'open',
          headerTooltip: 'Source Type',
          minWidth: 120,
          comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
          filter: false,
          valueFormatter: ({ value }) => value?.label || '',
          cellEditorParams: {
            placeHolder: 'Source Type',
            getAutoCompleteOptions: () => store.sourceTypes,
          },
        },

        {
          headerName: 'Access Level',
          field: 'accessLevel',
          cellEditor: 'customAutoComplete',
          columnGroupShow: 'open',
          headerTooltip: 'Access Level',
          minWidth: 120,
          comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
          filter: false,
          valueFormatter: ({ value }) => value?.label || '',
          cellEditorParams: {
            isRequired: true,
            placeHolder: 'Access Level',
            getAutoCompleteOptions: () => store.accessLevels,
          },
        },
      ],
    },
  ];
};

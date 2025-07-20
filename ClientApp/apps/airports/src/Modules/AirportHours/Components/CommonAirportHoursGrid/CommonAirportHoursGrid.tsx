import React, { Component } from 'react';
import { VIEW_MODE } from '@wings/shared';
import { GridOptions, ColDef, ValueFormatterParams, ColGroupDef, RowNode } from 'ag-grid-community';
import { AirportHoursModel, AirportModuleSecurity, AirportSettingsStore } from '../../../Shared';
import { inject, observer } from 'mobx-react';
import {
  DATE_FORMAT,
  IClasses,
  ISelectOption,
  Utilities,
  GridPagination,
  GRID_ACTIONS,
  cellStyle,
} from '@wings-shared/core';
import {
  AgColumnHeader,
  AgGridCellEditor,
  CustomAgGridReact,
  AgGridDateTimePicker,
  AgGridAutoComplete,
  AgGridActions,
  AgGridCheckBox,
  AgGridGroupHeader,
  AgGridStatusBadge,
} from '@wings-shared/custom-ag-grid';
import { AuthStore, USER_ACCESS_ROLES } from '@wings-shared/security';
import ConditionEditor from '../AirportHoursDetails/AirportHoursGrid/Components/ConditionEditor/ConditionEditor';

interface Props {
  classes?: IClasses;
  gridOptions: GridOptions;
  airportSettingsStore?: AirportSettingsStore;
  rowData: AirportHoursModel[];
  onAction?: (action: GRID_ACTIONS, rowIndex: number) => void;
  serverPagination?: boolean;
  paginationData?: GridPagination;
  onPaginationChange?: (request: { pageNumber: number; pageSize: number }) => void;
  nameSearchFilterParams?: (searchType: string, colId: string, textLength?: number) => void;
  auditFields: (ColDef | ColGroupDef)[];
  params?: { airportId: number }; // if user coming from airport screen
  isAirportScreen?: boolean;
}

@inject('airportSettingsStore')
@observer
class CommonAirportHoursGrid extends Component<Props> {
  /* istanbul ignore next */
  static defaultProps = {
    onAction: () => {},
  };

  /* istanbul ignore next */
  private searchFilterParams(searchType: string, colId: string, textLength: number = 3): ColDef {
    const { nameSearchFilterParams } = this.props;
    if (nameSearchFilterParams) {
      const defaultFilter = {
        filter: 'agTextColumnFilter',
        filterParams: nameSearchFilterParams(searchType, colId, textLength),
      };
      return defaultFilter;
    }
    return {};
  }

  /* istanbul ignore next */
  private getAirportHoursUrl(data: AirportHoursModel, action: VIEW_MODE): string {
    const airportId = this.props.params?.airportId || data.airport?.id;
    const code = data.airport?.icao?.code || data.icao;
    const urlParams = `${airportId ? `${airportId}/` : ''}${code}/${data.airportHoursType?.id}`;
    return `/airports/airport-hours/${urlParams}/${action.toLocaleLowerCase()}?backNav=${
      this.props.isAirportScreen ? 'airports' : 'hours'
    }`;
  }

  private hideEditButton(data: AirportHoursModel): boolean {
    const _isGRSUser = AuthStore.permissions.hasAnyRole([ USER_ACCESS_ROLES.AIRPORTS_GRS_USER ]);
    // 91169 allow GRS Users to edit CIQ Hours 
    if (Utilities.isEqual(data.airportHoursType?.label as string, 'ciq') && _isGRSUser) {
      return false;
    }
    return !AirportModuleSecurity.isEditable || !Boolean(data.airportHoursType?.id);
  }

  /* istanbul ignore next */
  private columnDefs: ColDef[] = [
    {
      headerName: 'ICAO',
      headerTooltip: 'ICAO',
      field: 'icao',
      ...this.searchFilterParams('contains', 'icao', 2),
    },
    {
      headerName: 'Airport Code',
      headerTooltip: 'ICAO',
      field: 'airport.label',
      ...this.searchFilterParams('contains', 'airport.label', 2),
    },
    {
      headerName: 'Types',
      headerTooltip: 'Types',
      field: 'airportHoursType.name',
      ...this.searchFilterParams('contains', 'airportHoursType.name', 2),
    },
    {
      headerName: 'Sub Types',
      headerTooltip: 'Sub Types',
      field: 'airportHoursSubType.name',
      ...this.searchFilterParams('contains', 'airportHoursSubType.name', 2),
    },
    {
      headerName: 'Conditions',
      headerTooltip: 'Conditions',
      field: 'conditions',
      cellRenderer: 'conditionEditor',
      minWidth: 90,
      cellRendererParams: {
        isRowEditing: false,
        settingsStore: this.props.airportSettingsStore,
      },
    },
    {
      headerName: 'Is 24 Hours',
      headerTooltip: 'Is 24 Hours',
      field: 'schedule.is24Hours',
      cellRenderer: 'checkBoxRenderer',
      minWidth: 115,
      cellStyle: { ...cellStyle() },
      cellRendererParams: { readOnly: true },
    },
    {
      headerName: 'Valid From',
      headerTooltip: 'Valid From',
      field: 'schedule.startDate',
      maxWidth: 210,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
    },
    {
      headerName: 'Valid To',
      headerTooltip: 'Valid To',
      field: 'schedule.endDate',
      maxWidth: 210,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
    },
    {
      headerName: 'Start Time LT',
      headerTooltip: 'Start Time LT',
      maxWidth: 210,
      field: 'schedule.startTime.time',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_TIME_FORMAT),
    },
    {
      headerName: 'End Time LT',
      headerTooltip: 'End Time LT',
      maxWidth: 210,
      field: 'schedule.endTime.time',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.API_TIME_FORMAT),
    },
    {
      headerName: 'Schedule Summary',
      headerTooltip: 'Schedule Summary',
      field: 'scheduleSummary',
      ...this.searchFilterParams('contains', 'scheduleSummary'),
    },
    {
      headerName: 'Status',
      headerTooltip: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (cur: ISelectOption, next: ISelectOption) => Utilities.customComparator(cur, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    ...this.props.auditFields,
    {
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      filter: false,
      sortable: false,
      suppressSizeToFit: true,
      minWidth: 140,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: (node: RowNode) => [
          {
            title: 'Edit',
            isHidden: this.hideEditButton(node.data),
            to: ({ data }) => this.getAirportHoursUrl(data, VIEW_MODE.EDIT),
            action: GRID_ACTIONS.VIEW,
          },
          {
            title: 'Details',
            isHidden: !Boolean(node.data.airportHoursType?.id),
            to: ({ data }) => this.getAirportHoursUrl(data, VIEW_MODE.DETAILS),
            action: GRID_ACTIONS.VIEW,
          },
          { title: 'Audit', action: GRID_ACTIONS.AUDIT },
        ],
        onAction: this.props.onAction,
      },
    },
  ];

  /* istanbul ignore next */
  private get gridOptions(): GridOptions {
    return {
      ...this.props.gridOptions,
      columnDefs: this.columnDefs,
      defaultColDef: {
        ...this.props.gridOptions.defaultColDef,
        sortable: true,
        filter: false,
      },
      frameworkComponents: {
        customCellEditor: AgGridCellEditor,
        customTimeEditor: AgGridDateTimePicker,
        customAutoComplete: AgGridAutoComplete,
        actionRenderer: AgGridActions,
        checkBoxRenderer: AgGridCheckBox,
        customHeader: AgGridGroupHeader,
        agColumnHeader: AgColumnHeader,
        statusRenderer: AgGridStatusBadge,
        conditionEditor: ConditionEditor,
      },
    };
  }

  render() {
    const { rowData, serverPagination, onPaginationChange, paginationData } = this.props;

    return (
      <CustomAgGridReact
        rowData={rowData}
        gridOptions={this.gridOptions}
        serverPagination={serverPagination}
        paginationData={paginationData}
        onPaginationChange={onPaginationChange}
      />
    );
  }
}

export default CommonAirportHoursGrid;

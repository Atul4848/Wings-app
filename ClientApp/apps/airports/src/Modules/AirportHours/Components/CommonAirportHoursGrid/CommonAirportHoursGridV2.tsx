import React, { FC } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowNode, ColGroupDef } from 'ag-grid-community';
import { CustomAgGridReact, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { Utilities, GRID_ACTIONS, cellStyle, GridPagination, DATE_FORMAT, ISelectOption } from '@wings-shared/core';
import { AirportHoursModel, AirportSettingsStore, useAirportModuleSecurity } from '../../../Shared';
import { VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import ConditionEditor from '../AirportHoursDetails/AirportHoursGrid/Components/ConditionEditor/ConditionEditor';

interface Props {
  gridOptions: GridOptions;
  rowData: AirportHoursModel[];
  onAction?: (action: GRID_ACTIONS, rowIndex: number) => void;
  serverPagination?: boolean;
  paginationData?: GridPagination;
  onPaginationChange?: (request: { pageNumber: number; pageSize: number }) => void;
  nameSearchFilterParams?: (colId: string, textLength: number, searchType?: string) => void;
  auditFields: (ColDef | ColGroupDef)[];
  params?: { airportId: number }; // if user coming from airport screen
  isAirportScreen?: boolean;
  airportSettingsStore?: AirportSettingsStore;
}

const CommonAirportHoursGrid: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<'', AirportHoursModel>([], gridState);
  const { isEditable, isGRSUser } = useAirportModuleSecurity();


  /* istanbul ignore next */
  const searchFilterParams = (colId: string, textLength: number, searchType?: string): ColDef => {
    const { nameSearchFilterParams, isAirportScreen } = props;
    if (!isAirportScreen && nameSearchFilterParams) {
      const defaultFilter = {
        filter: 'agTextColumnFilter',
        filterParams: nameSearchFilterParams(colId, textLength, searchType),
      };
      return defaultFilter;
    }
    return {};
  };

  /* istanbul ignore next */
  const hideEditButton = (data: AirportHoursModel): boolean => {
    // 91169 allow GRS Users to edit CIQ Hours 
    if (Utilities.isEqual(data.airportHoursType?.label as string, 'ciq') && isGRSUser) {
      return false;
    }
    return !isEditable || !Boolean(data.airportHoursType?.id);
  }

  /* istanbul ignore next */
  const getAirportHoursUrl = (data: AirportHoursModel, action: VIEW_MODE): string => {
    const airportId = props.params?.airportId || data.airport?.id;
    const code = data.airport?.icao?.code || data.icao;
    const urlParams = `${airportId ? `${airportId}/` : ''}${code}/${data.airportHoursType?.id}`;
    return `/airports/airport-hours/${urlParams}/${action.toLocaleLowerCase()}?backNav=${
      props.isAirportScreen ? 'airports' : 'hours'
    }`;
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'ICAO',
      headerTooltip: 'ICAO',
      field: 'icao',
      ...searchFilterParams('icao', 2),
    },
    {
      headerName: 'Airport Code',
      headerTooltip: 'ICAO',
      field: 'airport.label',
      ...searchFilterParams('airport.label', 2),
    },
    {
      headerName: 'Types',
      headerTooltip: 'Types',
      field: 'airportHoursType.name',
      ...searchFilterParams('airportHoursType.name', 2),
    },
    {
      headerName: 'Sub Types',
      headerTooltip: 'Sub Types',
      field: 'airportHoursSubType.name',
      ...searchFilterParams('airportHoursSubType.name', 2),
    },
    {
      headerName: 'Conditions',
      headerTooltip: 'Conditions',
      field: 'conditions',
      cellRenderer: 'conditionEditor',
      minWidth: 90,
      cellRendererParams: {
        isRowEditing: false,
        settingsStore: props.airportSettingsStore,
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
      ...searchFilterParams('scheduleSummary', 3),
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
    ...props.auditFields,
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: (node: RowNode) => [
            {
              title: 'Edit',
              isHidden: hideEditButton(node.data),
              to: ({ data }) => getAirportHoursUrl(data, VIEW_MODE.EDIT),
              action: GRID_ACTIONS.VIEW,
            },
            {
              title: 'Details',
              isHidden: !Boolean(node.data.airportHoursType?.id),
              to: ({ data }) => getAirportHoursUrl(data, VIEW_MODE.DETAILS),
              action: GRID_ACTIONS.VIEW,
            },
            { title: 'Audit', action: GRID_ACTIONS.AUDIT },
          ],
          onAction: props.onAction,
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return {
      ...props.gridOptions,
      columnDefs,
      defaultColDef: {
        ...props.gridOptions.defaultColDef,
        sortable: true,
        filter: false,
      },
      frameworkComponents: {
        ...props.gridOptions.frameworkComponents,
        conditionEditor: ConditionEditor,
      },
    };
  };
  return (
    <CustomAgGridReact
      rowData={props.rowData}
      gridOptions={gridOptions()}
      serverPagination={props.serverPagination}
      paginationData={props.paginationData}
      onPaginationChange={props.onPaginationChange}
    />
  );
};

export default inject('airportSettingsStore')(observer(CommonAirportHoursGrid));

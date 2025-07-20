// Third party imports
import React, { FC } from 'react';
import { useNavigate } from 'react-router';
import { Palette } from '@material-ui/core/styles/createPalette';
import { CustomAgGridReact } from '@wings-shared/custom-ag-grid';
import moment from 'moment';
import { withTheme } from '@material-ui/core';

// local imports
import { SurveyStatus } from './../../../Shared/Components/SurveyStatus/SurveyStatus';
import { SURVEY_STATUS } from './../../../Shared/Enums/index';
import { styles } from './SurveyTableCore.styles';

interface RowData {
  airportName: string;
  ICAO: string;
  headerName?: string;
  submittedDate: string;
  id: number;
  lastUpdatedUser: string;
  approvedDate: string;
}

type Props = {
  palette?: Palette;
  rowData: RowData[];
};

export const SurveyTableCore: FC<Props> = ({ palette, rowData }) => {
  const classes = styles(palette);
  const navigate = useNavigate();

  // prepare grid options
  const gridOptions = getGridOptions(classes);

  return (
    <div className={classes.container}>
      <CustomAgGridReact
        onRowClicked={event => navigate(`survey/${String(event.data.id)}`)}
        rowData={rowData}
        gridOptions={gridOptions}
        hidePagination={true}
      />
    </div>
  );
};


const getParams = (params) => {
  return { label: params.data.statusLabel, modifier: `table ${params.data.statusClassName}` }
}

const customDateFilter = (filterDate, cellValue) => {
  const selectedDate = moment(filterDate.toISOString());
  const cellDate = moment(cellValue.split(' ')[0], 'DD-MMM-YYYY');
  if (!cellDate.isValid()) return null

  if (selectedDate.isSame(cellDate)) return 0;
  if (selectedDate.isBefore(cellDate)) return 1;
  return -1;
}

const reviewFilters = {
  filterOptions: [
    'empty',
    {
      displayKey: SURVEY_STATUS.PENDING.toLowerCase(),
      displayName: SURVEY_STATUS.PENDING,
      test: function (filterValue, cellValue) {
        return cellValue && cellValue.toLowerCase() === SURVEY_STATUS.PENDING.toLowerCase();
      },
      hideFilterInput: true,
    },
    {
      displayKey: SURVEY_STATUS.UNDER_REVIEW.toLowerCase(),
      displayName: SURVEY_STATUS.UNDER_REVIEW_FORMATTED,
      test: function (filterValue, cellValue) {
        return cellValue && cellValue.toLowerCase() === SURVEY_STATUS.UNDER_REVIEW_FORMATTED.toLowerCase();
      },
      hideFilterInput: true,
    },
    {
      displayKey: SURVEY_STATUS.APPROVED.toLowerCase(),
      displayName: SURVEY_STATUS.APPROVED,
      test: function (filterValue, cellValue) {
        return cellValue && cellValue.toLowerCase() === SURVEY_STATUS.APPROVED.toLowerCase();
      },
      hideFilterInput: true,
    },
  ],
  suppressAndOrCondition: true,
  buttons: [ 'clear' ],
};

const dateComparator = (firstValue, secondValue, nodeA, nodeB, isInverted) => {
  const firstDate = moment(firstValue, 'DD-MMM-YYYY HH:mm')
  const secondDate = moment(secondValue, 'DD-MMM-YYYY HH:mm')

  if (!firstDate.isValid()) {
    return -1;
  }

  if (!secondDate.isValid()) {
    return 1;
  }

  if (firstDate.isSame(secondDate)) return 0;
  if (firstDate.isBefore(secondDate)) return -1;
  return 1;
}

const getGridOptions = (classes) => {
  return {
    headerHeight: 67,
    onGridReady: (params) => params.api.sizeColumnsToFit(),
    frameworkComponents: {
      surveyStatus: SurveyStatus,
    },
    defaultColDef: {
      resizable: true,
    },
    columnDefs: [
      {
        sortable: true,
        filter: true,
        headerClass: classes.headerCell,
        headerName: 'Airport Name',
        field: 'airportName',
      },
      {
        sortable: true,
        filter: true,
        headerClass: classes.headerCell,
        headerName: 'ICAO',
        field: 'ICAO',
      },
      {
        sortable: true,
        filter: true,
        headerClass: classes.headerCell,
        headerName: 'Handler',
        field: 'handlerName',
      },
      {
        sortable: true,
        filter: 'agDateColumnFilter',
        headerClass: classes.headerCell,
        headerName: 'Survey Completed',
        field: 'submittedDate',
        comparator: dateComparator,
        filterParams: {
          comparator: customDateFilter,
          buttons: [ 'clear' ],
        },
      },
      {
        sortable: true,
        filter: true,
        headerClass: classes.headerCell,
        headerName: 'Review Status',
        field: 'statusLabel',
        cellRenderer: 'surveyStatus',
        cellRendererParams: getParams,
        filterParams: reviewFilters,
      },
      {
        sortable: true,
        filter: true,
        headerClass: classes.headerCell,
        headerName: 'User (ID)',
        field: 'lastUpdatedUser',
      },
      {
        sortable: true,
        filter: 'agDateColumnFilter',
        comparator: dateComparator,
        filterParams: {
          comparator: customDateFilter,
          buttons: [ 'clear' ],
        },
        headerClass: classes.headerCell,
        headerName: 'Date/Time (UTC)',
        field: 'approvedDate',
      },
    ],
  }
}

export default withTheme(SurveyTableCore);

import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ActiveUsersModel } from '../Shared';
import { Typography, Tooltip } from '@material-ui/core';
import { useStyles } from './ActiveUsersGrid.styles';
import moment from 'moment';
import { ACTIVE_USER, FUEL_FILTERS } from '../Shared/Enums';
import AssumedIdentity from '@material-ui/icons/PermIdentity';
import { DATE_FORMAT, IClasses, Utilities, IBaseGridFilterSetup, GRID_ACTIONS } from '@wings-shared/core';
import { ChildGridWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';

interface Props {
  classes?: IClasses;
  rowData: ActiveUsersModel[];
  title: string;
  tierTime: string;
  searchValue: string;
  searchType?: ACTIVE_USER;
}

const ActiveUsersGrid: FC<Props> = ({ ...props }: Props) => {
  const [ rowCounts, setRowCounts ] = useState<number>(0);
  const gridState = useGridState();
  const agGrid = useAgGrid<FUEL_FILTERS, ActiveUsersModel>([], gridState);
  const classes = useStyles();

  useEffect(() => {
    _setRowCount();
  }, [ props.searchValue, props.searchType ]);

  const _setRowCount = (): void => {
    setRowCounts(gridState.gridApi?.paginationGetRowCount());
  };

  const columnDefs: ColDef[] = [
    {
      headerName: '',
      field: '',
      cellRenderer: 'viewRenderer',
      filter: false,
      maxWidth: 30,
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => viewRenderer(node.data),
      },
    },

    {
      headerName: 'Email',
      field: 'email',
    },
    {
      headerName: 'UserName',
      field: 'username',
    },
    {
      headerName: 'Client',
      field: 'client',
    },
    {
      headerName: 'Customer Number',
      field: 'customerNumber',
    },
    {
      headerName: 'TimeStamp',
      field: 'timestamp',
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(
          moment
            .utc(value)
            .local()
            .format(DATE_FORMAT.API_FORMAT),
          DATE_FORMAT.SDT_DST_FORMAT
        ),
    },
    {
      headerName: 'IsInternal',
      field: 'isInternal',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        if (value === undefined) {
          return '';
        }
        return value ? 'Internal' : 'External';
      },
    },
    {
      headerName: 'IsInternalOps',
      field: 'isInternalOps',
      valueFormatter: ({ value }: ValueFormatterParams) => {
        if (value === undefined) {
          return '';
        }
        return value ? 'Yes' : 'No';
      },
    },
  ];

  const viewRenderer = (rowData: ActiveUsersModel): ReactNode => {
    return (
      <span
        style={{
          visibility: rowData.assumedIdentity !== 0 ? 'visible' : 'hidden',
        }}
      >
        <Tooltip title="Assumed Identity user">
          <AssumedIdentity className={props.classes?.icon} />
        </Tooltip>
      </span>
    );
  };

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: this,
      columnDefs,
      isEditable: false,
      gridActionProps: {
        showDeleteButton: true,
        getDisabledState: () => gridState.hasError,
        getEditableState: () => false,
      },
    });

    return {
      ...baseOptions,
      isExternalFilterPresent: () => Boolean(props.searchValue) || false,
      doesExternalFilterPass: node => {
        const { username } = node.data as ActiveUsersModel;
        return agGrid.isFilterPass(
          {
            [ACTIVE_USER.USERNAME]: username,
          },
          props.searchValue,
          props.searchType
        );
      },
      onRowDataChanged: () => {
        _setRowCount();
      },
      onFirstDataRendered: () => {
        _setRowCount();
      },
    };
  };

  return (
    <div className={classes.root}>
      <div className={classes.mainWrapper}>
        <div className={classes.titleWrapper}>
          <Typography className={classes.defaultWrapper} color="primary">
            {props.title}:{' '}
          </Typography>
          <Typography className={classes.tierWrapper} variant="h5">
            {props.tierTime}
          </Typography>
        </div>
        <div>
          <Typography className={classes.tierWrapper} variant="h5">
            Total Count: {rowCounts === undefined ? 0 : rowCounts}
          </Typography>
        </div>
      </div>
      <ChildGridWrapper hasAddPermission={false}>
        <CustomAgGridReact
          isRowEditing={gridState.isRowEditing}
          rowData={props.rowData}
          gridOptions={gridOptions()}
          disablePagination={gridState.isRowEditing}
        />
      </ChildGridWrapper>
    </div>
  );
};

export default inject('activeUsersStore')(observer(ActiveUsersGrid));

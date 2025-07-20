import React, { FC, useEffect } from 'react';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { PermitExceptionRuleModel } from '../../../Shared';
import { PermitExceptionMasterDetails } from '../../Components';
import { Collapsable } from '@wings-shared/layout';
import { AgGridViewRenderer, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useStyles } from './PermitExceptionDetails.styles';

interface Props {
  permitExceptionRules: PermitExceptionRuleModel[];
}

const PermitExceptionDetails: FC<Props> = props => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', PermitExceptionRuleModel>([], gridState);

  useEffect(() => {
    gridState.setGridData(props.permitExceptionRules || []);
  }, [ props.permitExceptionRules ]);

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Rule Name',
      field: 'name',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'Permit Requirement Type',
      field: 'permitRequirementType',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: false,
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      groupHeaderHeight: 0,
      suppressColumnVirtualisation: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      detailCellRenderer: 'myDetailCellRenderer',
      frameworkComponents: {
        viewRenderer: AgGridViewRenderer,
        myDetailCellRenderer: PermitExceptionMasterDetails,
      },
    };
  };

  return (
    <Collapsable title={'Permit Exceptions'} classes={{ titleRoot: classes.noPadding, contentRoot: classes.noPadding }}>
      <div className={classes.container}>
        <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} hidePagination={true} />
      </div>
    </Collapsable>
  );
};

export default observer(PermitExceptionDetails);

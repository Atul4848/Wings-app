import React, { FC, ReactNode, useEffect } from 'react';
import { ColDef, GridOptions, ValueFormatterParams, RowNode, FirstDataRenderedEvent } from 'ag-grid-community';
import { observer } from 'mobx-react';
import { Tooltip } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { PermitExceptionRuleModel, RuleFilterModel, RuleValueModel } from '../../../Shared';
import { useStyles } from './PermitExceptionMasterDetails.styles';
import { AgGridViewRenderer, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';

interface Props {
  data: PermitExceptionRuleModel;
}

const PermitExceptionMasterDetails: FC<Props> = (props: Props) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<null, RuleFilterModel>([], gridState);

  useEffect(() => {
    gridState.setGridData(props.data.ruleFilters || []);
  }, []);

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Logical Operator',
      field: 'ruleLogicalOperator',
      minWidth: 160,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Entity Type',
      field: 'ruleEntityType',
      minWidth: 150,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Field',
      field: 'ruleField',
      minWidth: 180,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Conditional Operator',
      field: 'ruleConditionalOperator',
      minWidth: 180,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Value',
      field: 'ruleValues',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode) => viewRenderer(node.data?.ruleValues),
      },
    },
  ];

  /* istanbul ignore next */
  const viewRenderer = (ruleValues: RuleValueModel[], getTagProps?: AutocompleteGetTagProps): ReactNode => {
    return ruleValues.map((data: RuleValueModel, index) => (
      <Tooltip
        title={data.toolTip || ''}
        disableFocusListener={true}
        disableTouchListener={true}
        arrow={true}
        key={data.id}
      >
        <Chip
          classes={{ root: classes.root }}
          label={data.code || data.ruleValue}
          {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
        />
      </Tooltip>
    ));
  };

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
        sortable: false,
      },
      frameworkComponents: {
        viewRenderer: AgGridViewRenderer,
      },
      onFirstDataRendered: (params: FirstDataRenderedEvent) => params.columnApi.autoSizeColumn('ruleValues'),
    };
  };

  return (
    <div className={classes.container}>
      <CustomAgGridReact rowData={gridState.data} gridOptions={gridOptions()} />
    </div>
  );
};

export default observer(PermitExceptionMasterDetails);

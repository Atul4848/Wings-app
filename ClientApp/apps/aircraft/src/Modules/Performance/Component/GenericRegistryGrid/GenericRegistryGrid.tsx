import React, { FC } from 'react';
import { CustomAgGridReact, BaseGrid, useGridState, useAgGrid } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { GenericRegistryModel } from '../../../Shared';
import { useStyles } from './GenericRegistryGrid.styles';
import { Utilities, SettingsTypeModel } from '@wings-shared/core';
import { ChildGridWrapper, Collapsable } from '@wings-shared/layout';

interface Props {
  rowData: GenericRegistryModel[];
}

const GenericRegistryGrid: FC<Props> = ({ rowData }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<'', GenericRegistryModel>([], gridState);

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Generic registry',
      field: 'name',
    },
    {
      headerName: 'Weight UOM',
      field: 'weightUOM',
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => {
        return value?.label;
      },
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    return agGrid.gridOptionsBase({
      context: {},
      columnDefs: columnDefs,
      isEditable: false,
    });
  };

  return (
    <div className={classes.root}>
      <Collapsable title="Generic Registry">
        <ChildGridWrapper hasAddPermission={false}>
          <CustomAgGridReact
            isRowEditing={gridState.isRowEditing}
            rowData={rowData}
            gridOptions={gridOptions()}
            disablePagination={gridState.isRowEditing}
          />
        </ChildGridWrapper>
      </Collapsable>
    </div>
  );
};

export default GenericRegistryGrid;

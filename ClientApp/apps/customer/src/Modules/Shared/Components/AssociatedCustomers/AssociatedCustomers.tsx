import React, { FC, ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { CUSTOMER_FILTER, CustomerModel } from '../..';
import { gridFilters } from './fields';
import { UIStore, IAPIGridRequest, Utilities, ISelectOption } from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { GraphQLStore } from '../../Stores';
import { GridPagination } from '@wings/shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
}

const AssociatedCustomers: FC<Props> = ({ title, backNavTitle, backNavLink }: Props) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const params = useParams();
  const agGrid = useAgGrid<CUSTOMER_FILTER, CustomerModel>(gridFilters, gridState);

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadCustomers();
  }, []);

  /* istanbul ignore next */
  const getGqlQuery = (): string => {
    return params.registryId
      ? `{associatedRegistries: {some: {registry: {registryId: {eq:${Number(params.registryId)}}}}}}`
      : `{associatedOperators: {some: {operator: {operatorId: {eq:${Number(params.operatorId)}}}}}}`;
  };

  /* istanbul ignore next */
  const loadCustomers = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    GraphQLStore.loadGqlData({
      pageSize: gridState.pagination.pageSize,
      pageNumber: gridState.pagination.pageNumber,
      gqlQuery: getGqlQuery(),
      ...pageRequest,
    })
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
      });
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
    },
    {
      headerName: 'Number',
      field: 'number',
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
    },
    ...agGrid.auditFields(gridState.isRowEditing),
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
    });
    return {
      ...baseOptions,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
  };

  const headerActions = (): ReactNode => (
    <DetailsEditorHeaderSection
      title={title}
      backNavTitle={backNavTitle}
      backNavLink={backNavLink}
      isEditMode={false}
    />
  );

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false}>
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadCustomers}
      />
    </DetailsEditorWrapper>
  );
};

export default observer(AssociatedCustomers);

import React, { FC, ReactNode, useEffect } from 'react';
import { DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { SettingsStore, CustomerStore, SITE_FILTER, AssociatedSitesModel } from '../../index';
import { gridFilters } from './fields';
import {
  AccessLevelModel,
  DATE_FORMAT,
  GRID_ACTIONS,
  ISelectOption,
  SourceTypeModel,
  Utilities,
} from '@wings-shared/core';
import { useStyles } from '../../Styles';
import { ModelStatusOptions, VIEW_MODE } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';

interface Props {
  title: string;
  backNavTitle: string;
  backNavLink: string;
  settingsStore?: SettingsStore;
  customerStore?: CustomerStore;
}

const AssociatedSites: FC<Props> = ({ title, backNavTitle, backNavLink, settingsStore, customerStore }: Props) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<SITE_FILTER, AssociatedSitesModel>(gridFilters, gridState);
  const classes = useStyles();
  const searchHeader = useSearchHeader();
  const _settingsStore = settingsStore as SettingsStore;
  const _customerStore = customerStore as CustomerStore;

  // Load Data on Mount
  /* istanbul ignore next */
  useEffect(() => {
    loadAssociatedSites();
  }, []);

  /* istanbul ignore next */
  const loadAssociatedSites = () => {
    const { selectedCustomer } = _customerStore;
    gridState.setGridData(selectedCustomer?.associatedSites);
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Location ( Site )',
      field: 'location',
    },
    {
      headerName: 'Site Use Id',
      field: 'siteUseId',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'End Date',
      field: 'endDate',
      cellEditor: 'customTimeEditor',
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: 'statusRenderer',
      cellEditor: 'customAutoComplete',
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      filter: false,
      sort: 'asc',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Status',
        getAutoCompleteOptions: () => ModelStatusOptions,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Access Level',
      field: 'accessLevel',
      cellEditor: 'customAutoComplete',
      comparator: (current: AccessLevelModel, next: AccessLevelModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Access Level',
        getAutoCompleteOptions: () => _settingsStore.accessLevels,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    {
      headerName: 'Source Type',
      field: 'sourceType',
      cellEditor: 'customAutoComplete',
      comparator: (current: SourceTypeModel, next: SourceTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      filter: false,
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      cellEditorParams: {
        placeHolder: 'Source Type',
        getAutoCompleteOptions: () => _settingsStore.sourceTypes,
        valueGetter: (option: ISelectOption) => option,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
              to: node => `${node.data.id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
            },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs: columnDefs,
    });
    return {
      ...baseOptions,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => Boolean(searchHeader.getFilters().searchValue) || false,
      doesExternalFilterPass: node => {
        const { id, name, siteUseId } = node.data as AssociatedSitesModel;
        if (!searchHeader) {
          return false;
        }
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [SITE_FILTER.SITE]: name,
              [SITE_FILTER.SITE_USE_ID]: String(siteUseId),
            },
            searchHeader.getFilters().searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption')
          )
        );
      },
      onRowEditingStarted: params => {
        agGrid.onRowEditingStarted(params);
      },
      onSortChanged: e => agGrid.filtersApi.onSortChanged(e),
    };
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={title}
        backNavTitle={backNavTitle}
        backNavLink={backNavLink}
        isEditMode={false}
        showBreadcrumb={true}
      />
    );
  };

  return (
    <DetailsEditorWrapper headerActions={headerActions()} isEditMode={false} isBreadCrumb={true}>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(SITE_FILTER, SITE_FILTER.SITE) ]}
        onFiltersChanged={() => gridState.gridApi.onFilterChanged()}
        onSearch={(sv)=> gridState.gridApi.onFilterChanged()}
        disableControls={gridState.isRowEditing}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        classes={{ customHeight: classes.customHeight }}
      />
    </DetailsEditorWrapper>
  );
};

export default inject('settingsStore', 'customerStore')(observer(AssociatedSites));

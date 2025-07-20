import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AuditHistory, baseApiPath, CountryModel, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { PERMIT_AUDIT_MODULES, PERMIT_FILTERS, PermitModel, sidebarOptions, usePermitModuleSecurity } from '../Shared';
import { PermitSettingsStore, PermitStore } from '../Shared/Stores';
import {
  GridPagination,
  IAPIGridRequest,
  UIStore,
  Utilities,
  ViewPermission,
  SearchStore,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader, EDITOR_TYPES } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';
import { permitsGridFilters } from './fields';

interface Props {
  permitStore?: PermitStore;
  permitSettingsStore?: PermitSettingsStore;
  sidebarStore?: typeof SidebarStore;
}

const CoreModule: FC<Props> = ({ permitStore, permitSettingsStore, sidebarStore }) => {
  const settingDetailsGroup: string = 'settingDetails';
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const agGrid = useAgGrid<PERMIT_FILTERS, PermitModel>(permitsGridFilters, gridState);
  const searchHeader = useSearchHeader();
  const _permitStore = permitStore as PermitStore;
  const [ entityOptions, setEntityOptions ] = useState([]);
  const permitModuleSecurity = usePermitModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(sidebarOptions(false), 'permits');
    loadPermits();
    _permitStore.getCountries().subscribe();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadPermits());
  }, []);

  useEffect(() => {
    loadEntityOptions();
  }, [ searchHeader.getFilters().selectInputsValues.get('defaultOption'), searchHeader.searchValue ]);

  /* istanbul ignore next */
  const searchCollection = (): IAPIGridRequest => {
    const _selectedOption = searchHeader.getFilters().selectInputsValues.get('defaultOption');
    const searchChips: any = searchHeader.getFilters().chipValue?.valueOf();
    const _searchValue = searchChips.map(x => {
      return Utilities.isEqual(_selectedOption, PERMIT_FILTERS.ISO2CODE) ? x.isO2Code : x.commonName;
    });
    if (_searchValue.length === 0) {
      return {};
    }
    return {
      searchCollection: JSON.stringify([
        {
          propertyName: Utilities.isEqual(_selectedOption, PERMIT_FILTERS.ISO2CODE) ? 'Country.Code' : 'Country.Name',
          propertyValue: _searchValue[0],
        },
      ]),
    };
  };

  /* istanbul ignore next */
  const loadPermits = (pageRequest?: IAPIGridRequest): void => {
    const searchCollectionData = searchCollection();
    const searchFilters = Object.keys(searchCollectionData).length
      ? searchCollectionData
      : agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue,
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      );

    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...searchFilters,
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };

    UIStore.setPageLoader(true);
    _permitStore
      .loadPermits(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          gridState.setGridData(response.results);
          gridState.setPagination(new GridPagination({ ...response }));
          agGrid.filtersApi.gridAdvancedSearchFilterApplied();
        },
      });
  };

  /* istanbul ignore next */
  const loadEntityOptions = () => {
    if (searchHeader.getFilters().selectInputsValues.get('defaultOption')) {
      setEntityOptions(_permitStore.countries);
    }
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number): void => {
    if (gridAction === GRID_ACTIONS.AUDIT) {
      const model: PermitModel = agGrid._getTableItem(rowIndex);
      ModalStore.open(
        <AuditHistory
          title={model.permitTitle}
          entityId={model.id}
          entityType={PERMIT_AUDIT_MODULES.PERMIT}
          baseUrl={baseApiPath.permits}
        />
      );
    }
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Country',
      field: 'country',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('country', 2),
    },
    {
      headerName: 'Permit Type',
      field: 'permitType',
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('permitType', 2),
    },
    {
      headerName: 'Is Required',
      field: 'isRequired',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
      sortable: false,
    },
    {
      headerName: 'Is Exception',
      field: 'isException',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
      sortable: false,
    },
    {
      headerName: 'Exception',
      field: 'exception',
      cellRenderer: 'customTextAreaEditor',
      minWidth: 280,
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('exception', 2),
      cellRendererParams: {
        readOnly: true,
        editorType: EDITOR_TYPES.RICH_TEXT_EDITOR,
      },
    },
    {
      headerName: 'Permit Applied To',
      field: 'permitApplied.permitAppliedTo',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('permitApplied.permitAppliedTo', 2),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.name || '',
    },
    {
      headerName: 'Extended by Nautical Miles',
      field: 'permitApplied.extendedByNM',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('permitApplied.extendedByNM', 2),
    },
    {
      headerName: 'Is Polygon',
      field: 'permitApplied.isPolygon',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: {
        readOnly: true,
      },
      sortable: false,
    },
    {
      groupId: settingDetailsGroup,
      children: [
        {
          headerName: 'Access Level',
          headerComponent: 'customHeader',
          field: 'accessLevel',
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        },
        {
          headerName: 'Source',
          columnGroupShow: 'open',
          field: 'sourceType',
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        },
        {
          headerName: 'Status',
          field: 'status',
          cellRenderer: 'statusRenderer',
          columnGroupShow: 'open',
          valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
        },
      ],
    },
    ...agGrid.auditFieldsWithAdvanceFilter(gridState.isRowEditing),
    {
      ...agGrid.actionColumn({
        minWidth: 140,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !permitModuleSecurity.isEditable,
              to: ({ data }) => `${data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
              action: GRID_ACTIONS.EDIT,
            },
            {
              title: 'Details',
              to: ({ data }) => `${data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
              action: GRID_ACTIONS.DETAILS,
            },
            { title: 'Audit', action: GRID_ACTIONS.AUDIT },
          ],
        },
      }),
    },
  ];

  /* istanbul ignore next */
  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      isEditable: false,
      columnDefs: columnDefs,
    });

    return {
      ...baseOptions,
      pagination: false,
      suppressClickEdit: true,
      groupHeaderHeight: 0,
      suppressCellSelection: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadPermits();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadPermits();
      },
    };
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={permitModuleSecurity.isEditable}>
        <CustomLinkButton variant="contained" startIcon={<AddIcon />} to="new" title="Add Permit" />
      </ViewPermission>
    );
  };

  const getChipLabel = option => {
    const { commonName, isO2Code, isO3Code } = option;
    const filterType = searchHeader.getFilters().selectInputsValues.get('defaultOption');

    if (Utilities.isEqual(filterType, PERMIT_FILTERS.COUNTRY)) {
      return commonName;
    }
    
    const code = Utilities.isEqual(filterType, PERMIT_FILTERS.ISO2CODE) ? isO2Code : isO3Code;
    return commonName && code ? `${commonName} (${code})` : commonName || code || '';
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[ agGridUtilities.createSelectOption(PERMIT_FILTERS, PERMIT_FILTERS.COUNTRY) ]}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
        isChipInputControl={true}
        chipInputProps={{
          options: entityOptions,
          allowOnlySingleSelect: true,
          getChipLabel: option => getChipLabel(option as CountryModel) || option.label,
          getOptionLabel: option => getChipLabel(option as CountryModel) || option.label,
        }}
        onFiltersChanged={loadPermits}
        onSearch={sv => loadPermits()}
        onExpandCollapse={agGrid.autoSizeColumns}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={request => loadPermits(request)}
      />
    </>
  );
};

export default inject('permitStore', 'permitSettingsStore', 'sidebarStore')(observer(CoreModule));

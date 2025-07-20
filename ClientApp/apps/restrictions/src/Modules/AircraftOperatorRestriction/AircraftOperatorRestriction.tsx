import React, { FC, useEffect } from 'react';
import { AuditHistory, baseApiPath, VIEW_MODE } from '@wings/shared';
import { CustomAgGridReact, agGridUtilities, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { ColDef, ColGroupDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import {
  AircraftOperatorRestrictionsStore,
  AircraftOperatorRestrictionsModel,
  AIRCRAFT_OPERATOR_RESTRICTIONS,
  useRestrictionModuleSecurity,
  SettingsStore,
  RESTRICTION_AUDIT_MODULES,
  updateRestrictionSidebarOptions,
} from '../Shared';
import { finalize, takeUntil } from 'rxjs/operators';
import { gridFilters } from './fields';
import {
  DATE_FORMAT,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  UIStore,
  Utilities,
  ViewPermission,
  SearchStore,
  IdNameCodeModel,
  GRID_ACTIONS,
} from '@wings-shared/core';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { useUnsubscribe } from '@wings-shared/hooks';

interface Props {
  viewMode?: VIEW_MODE;
  aircraftOperatorRestrictionsStore?: AircraftOperatorRestrictionsStore;
  settingsStore?: SettingsStore;
  classes?: IClasses;
  sidebarStore?: typeof SidebarStore;
}

const AircraftOperatorRestriction: FC<Props> = ({ ...props }) => {
  const gridState = useGridState();
  const agGrid = useAgGrid<AIRCRAFT_OPERATOR_RESTRICTIONS, AircraftOperatorRestrictionsModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const searchHeader = useSearchHeader();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();

  /* eslint-disable max-len */
  const _aircraftOperatorRestrictionsStore = props.aircraftOperatorRestrictionsStore as AircraftOperatorRestrictionsStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;

  /* istanbul ignore next */
  useEffect(() => {
    _sidebarStore?.setNavLinks(updateRestrictionSidebarOptions('Aircraft Operator Restrictions'), 'restrictions');
    // Restore Search Result based on available history
    searchHeader.restoreSearchFilters(gridState, () => loadAircraftOperatorRestriction());
    loadAircraftOperatorRestriction();
    agGrid.filtersApi.onAdvanceFilterChange$.subscribe(() => loadAircraftOperatorRestriction());
  }, []);

  /* istanbul ignore next */
  const loadAircraftOperatorRestriction = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: 1,
      pageSize: gridState.pagination.pageSize,
      ...pageRequest,
      ...agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue || '',
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      ),
      ...agGrid.filtersApi.gridSortFilters(),
      ...agGrid.filtersApi.getAdvancedSearchFilters(),
    };
    if (searchHeader.getFilters().searchValue) {
      const _searchFilters = agGrid.filtersApi.getSearchFilters(
        searchHeader.getFilters().searchValue || '',
        searchHeader.getFilters().selectInputsValues.get('defaultOption')
      );
      const result = JSON.parse(_searchFilters.searchCollection as string)[0];
      if (
        searchHeader.getFilters().selectInputsValues.get('defaultOption') ===
        AIRCRAFT_OPERATOR_RESTRICTIONS.EFFECTED_ENTITY
      ) {
        request.searchCollection = JSON.stringify(
          [ result ].concat(
            Utilities.getFilter('EffectedEntity.Code', searchHeader.getFilters().searchValue as string, 'or')
          )
        );
      }
      if (
        searchHeader.getFilters().selectInputsValues.get('defaultOption') ===
        AIRCRAFT_OPERATOR_RESTRICTIONS.RESTRICTING_COUNTRY
      ) {
        request.searchCollection = JSON.stringify(
          [ result ].concat(
            Utilities.getFilter('RestrictingCountry.Code', searchHeader.getFilters().searchValue as string, 'or')
          )
        );
      }
    }

    UIStore.setPageLoader(true);
    _aircraftOperatorRestrictionsStore
      .getAircraftOperatorRestrictions(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse) => {
        gridState.setPagination(new GridPagination({ ...response }));
        gridState.setGridData(response.results);
        agGrid.filtersApi.gridAdvancedSearchFilterApplied();
      });
  };

  const gridActions = (gridAction: GRID_ACTIONS, rowIndex: number) => {
    if (gridAction === GRID_ACTIONS.AUDIT) {
      const model: AircraftOperatorRestrictionsModel = agGrid._getTableItem(rowIndex);
      ModalStore.open(
        <AuditHistory
          title={model.effectedEntity?.label}
          entityId={model.id}
          entityType={RESTRICTION_AUDIT_MODULES.AIRCRAFT_OPERATOR_RESTRICTION}
          baseUrl={baseApiPath.restrictions}
        />
      );
    }
  };

  /* istanbul ignore next */
  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Effected Entity Type',
      field: 'effectedEntityType',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('effectedEntityType', 2),
    },
    {
      headerName: 'Effected Entity',
      field: 'effectedEntity',
      comparator: (current: IdNameCodeModel, next: IdNameCodeModel) =>
        Utilities.customComparator(current, next, 'label'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('effectedEntity', 2),
      filterValueGetter: ({ data }: ValueGetterParams) => data.effectedEntity.label,
    },
    {
      headerName: 'Nationalities',
      field: 'nationalities',
      valueFormatter: ({ value }) => value?.isO2Code || '',
      cellRenderer: 'agGridChipView',
      cellRendererParams: {
        chipLabelField: 'isO2Code',
        tooltipField: 'commonName',
      },
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('nationalities', 2),
      comparator: (current, next) => Utilities.customComparator(current, next, 'isO2Code'),
    },
    {
      headerName: 'Restriction Type',
      field: 'restrictionType',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('restrictionType', 2),
    },
    {
      headerName: 'Restricting Country',
      field: 'restrictingCountry',
      comparator: (current: IdNameCodeModel, next: IdNameCodeModel) =>
        Utilities.customComparator(current, next, 'label'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('restrictingCountry', 2),
      filterValueGetter: ({ data }: ValueGetterParams) => data.restrictingCountry.label,
    },
    {
      headerName: 'Restriction Severity',
      field: 'restrictionSeverity',
      cellRenderer: 'statusRenderer',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('restrictionSeverity', 2),
    },
    {
      headerName: 'Approval Type Required',
      field: 'approvalTypeRequired',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('approvalTypeRequired', 2),
    },
    {
      headerName: 'UWA Allowable Actions',
      field: 'uwaAllowableActions',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      filter: 'agTextColumnFilter',
      filterParams: agGrid.filtersApi.getAdvanceFilterParams('uwaAllowableActions', 2),
    },
    {
      headerName: 'other details',
      groupId: 'otherDetails',
      suppressMenu: true,
      children: [
        {
          headerName: 'Start Date',
          field: 'startDate',
          headerComponent: 'customHeader',
          comparator: (current, next) => Utilities.customDateComparator(current, next),
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
        },
        {
          headerName: 'End Date',
          field: 'endDate',
          columnGroupShow: 'open',
          comparator: (current, next) => Utilities.customDateComparator(current, next),
          valueFormatter: ({ value }: ValueFormatterParams) =>
            Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT) || '',
        },
      ],
    },
    {
      ...agGrid.actionColumn({
        cellRendererParams: {
          isActionMenu: true,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            if ([ GRID_ACTIONS.EDIT, GRID_ACTIONS.VIEW ].includes(action)) {
              if (searchHeader.getFilters().searchValue) {
                searchHeader.saveSearchFilters(gridState);
              }
            }
            gridActions(action, rowIndex);
          },
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !restrictionModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
              to: node => `${node.data.id}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.VIEW,
              to: node => `${node.data.id}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
            },
            {
              title: 'Audit',
              action: GRID_ACTIONS.AUDIT,
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
      gridActionProps: {
        isActionMenu: true,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => gridActions(action, rowIndex),
      },
    });

    return {
      ...baseOptions,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        cellRendererParams: {
          ...baseOptions.defaultColDef?.cellRendererParams,
          chipLabelField: 'code',
        },
      },
      pagination: false,
      isExternalFilterPresent: () => false,
      suppressCellSelection: true,
      suppressRowHoverHighlight: true,
      onFilterChanged: e => {
        if (Array.from(gridState.columFilters).length) {
          searchHeader.resetInputs();
          return;
        }
        loadAircraftOperatorRestriction();
      },
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
        loadAircraftOperatorRestriction();
      },
    };
  };

  const rightContent = () => {
    return (
      <ViewPermission hasPermission={restrictionModuleSecurity.isEditable}>
        <CustomLinkButton
          variant="contained"
          startIcon={<AddIcon />}
          to="new"
          title="Add Aircraft Operator Restriction"
        />
      </ViewPermission>
    );
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        selectInputs={[
          agGridUtilities.createSelectOption(
            AIRCRAFT_OPERATOR_RESTRICTIONS,
            AIRCRAFT_OPERATOR_RESTRICTIONS.EFFECTED_ENTITY_TYPE
          ),
        ]}
        onFiltersChanged={loadAircraftOperatorRestriction}
        onSearch={sv => loadAircraftOperatorRestriction()}
        rightContent={rightContent}
        disableControls={Boolean(Array.from(gridState.columFilters).length) || gridState.isRowEditing}
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
        onPaginationChange={loadAircraftOperatorRestriction}
      />
    </>
  );
};

export default inject(
  'aircraftOperatorRestrictionsStore',
  'settingsStore',
  'sidebarStore'
)(observer(AircraftOperatorRestriction));

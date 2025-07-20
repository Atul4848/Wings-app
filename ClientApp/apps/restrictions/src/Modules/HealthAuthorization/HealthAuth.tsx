import { SearchHeaderV3, useSearchHeader } from '@wings-shared/form-controls';
import { inject, observer } from 'mobx-react';
import React, { FC, ReactNode, useEffect } from 'react';
import {
  HEALTH_AUTH_FILTERS,
  HealthAuthModel,
  HealthAuthStore,
  sidebarOptions,
  useRestrictionModuleSecurity,
} from '../Shared';
import { CustomLinkButton, SidebarStore } from '@wings-shared/layout';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  IdNameCodeModel,
  ISelectOption,
  SettingsTypeModel,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import { agGridUtilities, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { PrimaryButton } from '@uvgo-shared/buttons';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { ModelStatusOptions, VIEW_MODE } from '@wings/shared';
import { ColDef, GridOptions, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { observable } from 'mobx';

interface Props {
  healthAuthStore?: HealthAuthStore;
  sidebarStore?: typeof SidebarStore;
}

const HealthAuth: FC<Props> = ({ healthAuthStore, sidebarStore }) => {
  const searchHeader = useSearchHeader();
  const gridState = useGridState();
  const agGrid = useAgGrid<HEALTH_AUTH_FILTERS, HealthAuthModel>([], gridState);
  const unsubscribe = useUnsubscribe();
  const restrictionModuleSecurity = useRestrictionModuleSecurity();
  const _healthAuthStore = healthAuthStore as HealthAuthStore;
  const healthAuth = observable({
    isStatusFilter: Utilities.isEqual(searchHeader.searchType, HEALTH_AUTH_FILTERS.STATUS),
  });

  /* istanbul ignore next */
  useEffect(() => {
    sidebarStore?.setNavLinks(sidebarOptions(false), 'restrictions');
    loadInitialData();
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _healthAuthStore
      .getHealthAuths(true)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => gridState.setGridData(response.results));
  };

  /* istanbul ignore next */
  const columnDefs: ColDef[] = [
    {
      headerName: 'Level',
      field: 'authorizationLevel',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.authorizationLevel.name,
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Level Designator',
      field: 'levelDesignator',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.levelDesignator.label,
      comparator: (current: IdNameCodeModel, next: IdNameCodeModel) =>
        Utilities.customComparator(current, next, 'label'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
      minWidth: 230,
    },
    {
      headerName: 'Disease or Virus',
      field: 'infectionType',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.infectionType.name,
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Affected Type',
      field: 'affectedType',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) => data.affectedType.name,
      comparator: (current: SettingsTypeModel, next: SettingsTypeModel) =>
        Utilities.customComparator(current, next, 'name'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      headerName: 'Nationality Affected',
      field: 'healthAuthNationalities',
      sortable: false,
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) =>
        data.isAllNationalities ? 'All' : data.healthAuthNationalities?.map(v => v.isO2Code).join(', '),
      valueFormatter: ({ value, data }: ValueFormatterParams) =>
        data.isAllNationalities ? 'All' : value?.map(v => v.isO2Code).join(', '),
    },
    {
      headerName: 'Traveled Country',
      field: 'healthAuthTraveledCountries',
      sortable: false,
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) =>
        data.isAllTraveledCountries ? 'All' : data.healthAuthTraveledCountries?.map(v => v.isO2Code).join(', '),
      valueFormatter: ({ value, data }: ValueFormatterParams) =>
        data.isAllTraveledCountries ? 'All' : value?.map(v => v.isO2Code).join(', '),
    },
    {
      headerName: 'Suspend Automated Email',
      field: 'isSuspendNotification',
      cellRenderer: 'checkBoxRenderer',
      cellRendererParams: { readOnly: true },
      headerTooltip: 'Suspend Automated Email',
    },
    {
      headerName: 'Received Date',
      field: 'receivedDate',
      cellEditor: 'customTimeEditor',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.receivedDate, DATE_FORMAT.DATE_PICKER_FORMAT),
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
    },
    {
      headerName: 'Modified Date',
      field: 'modifiedOn',
      cellEditor: 'customTimeEditor',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.modifiedOn, DATE_FORMAT.DATE_PICKER_FORMAT),
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
    },
    {
      headerName: 'Requested Date',
      field: 'requestedDate',
      cellEditor: 'customTimeEditor',
      filter: true,
      filterValueGetter: ({ data }: ValueGetterParams) =>
        Utilities.getformattedDate(data.requestedDate, DATE_FORMAT.DATE_PICKER_FORMAT),
      valueFormatter: ({ value }: ValueFormatterParams) =>
        Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
      comparator: (current: string, next: string) => Utilities.customDateComparator(current, next),
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: true,
      cellRenderer: 'statusRenderer',
      filterValueGetter: ({ data }: ValueGetterParams) => data.status?.label,
      comparator: (current: ISelectOption, next: ISelectOption) => Utilities.customComparator(current, next, 'value'),
      valueFormatter: ({ value }: ValueFormatterParams) => value?.label || '',
    },
    {
      ...agGrid.actionColumn({
        headerName: 'Action',
        minWidth: 150,
        maxWidth: 210,
        cellRendererParams: {
          isActionMenu: true,
          actionMenus: () => [
            {
              title: 'Edit',
              isHidden: !restrictionModuleSecurity.isEditable,
              action: GRID_ACTIONS.EDIT,
              to: node => `health-authorization/${node?.data.id}/${VIEW_MODE.EDIT.toLowerCase()}`,
            },
            {
              title: 'Details',
              action: GRID_ACTIONS.DETAILS,
              isHidden: false,
              to: node => `health-authorization/${node?.data.id}/${VIEW_MODE.DETAILS.toLowerCase()}`,
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
      columnDefs,
      isEditable: false,
      gridActionProps: {
        tooltip: 'Health Auth',
        getDisabledState: () => gridState.hasError,
      },
    });

    return {
      ...baseOptions,
      suppressClickEdit: true,
      isExternalFilterPresent: () =>
        Boolean(searchHeader.getFilters().searchValue) ||
        Boolean(searchHeader.getFilters().chipValue?.valueOf()) ||
        false,
      doesExternalFilterPass: node => {
        if (!searchHeader) {
          return false;
        }
        const {
          levelDesignator,
          id,
          isAllNationalities,
          isAllTraveledCountries,
          healthAuthNationalities,
          healthAuthTraveledCountries,
          status,
        } = node.data as HealthAuthModel;
        const searchChips: any = searchHeader.getFilters().chipValue?.valueOf();
        const isExactMatch = Utilities.isEqual(
          searchHeader.getFilters().selectInputsValues.get('defaultOption'),
          HEALTH_AUTH_FILTERS.STATUS
        );
        const _searchValue = isExactMatch ? searchChips[0]?.name : searchHeader.getFilters().searchValue;
        return (
          !id ||
          agGrid.isFilterPass(
            {
              [HEALTH_AUTH_FILTERS.LEVEL_DESIGNATOR]: levelDesignator?.label,
              [HEALTH_AUTH_FILTERS.NATIONALITY]: isAllNationalities
                ? 'All'
                : healthAuthNationalities?.map(x => x.isO2Code).join(', '),
              [HEALTH_AUTH_FILTERS.TRAVELED_COUNTRY]: isAllTraveledCountries
                ? 'All'
                : healthAuthTraveledCountries?.map(x => x.isO2Code).join(', '),
              [HEALTH_AUTH_FILTERS.STATUS]: status?.label || '',
            },
            _searchValue,
            searchHeader.getFilters().selectInputsValues.get('defaultOption'),
            isExactMatch
          )
        );
      },
      suppressColumnVirtualisation: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
      },
    };
  };

  const exportHealthAuthExcel = () => {
    UIStore.setPageLoader(true);
    _healthAuthStore
      .getHealthAuthExcelFile()
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((file: File) => {
        const url = window.URL.createObjectURL(new Blob([ file ]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'HealthAuthorization.xlsx');

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });
  };

  const rightContent = (): ReactNode => {
    return (
      <>
        <PrimaryButton
          variant="contained"
          disabled={gridState.isRowEditing || UIStore.pageLoading}
          onClick={exportHealthAuthExcel}
        >
          Export Excel
        </PrimaryButton>
        <ViewPermission hasPermission={restrictionModuleSecurity.isEditable}>
          <CustomLinkButton
            variant="contained"
            startIcon={<AddIcon />}
            to={`health-authorization/${VIEW_MODE.NEW.toLowerCase()}`}
            title="Add Health Authorization"
            disabled={gridState.isRowEditing || UIStore.pageLoading}
          />
        </ViewPermission>
      </>
    );
  };

  /* istanbul ignore next */
  const _searchFilters = () => {
    healthAuth.isStatusFilter = Utilities.isEqual(
      searchHeader.getFilters().selectInputsValues.get('defaultOption'),
      HEALTH_AUTH_FILTERS.STATUS
    );
    gridState.gridApi.onFilterChanged();
  };

  return (
    <>
      <SearchHeaderV3
        useSearchHeader={searchHeader}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[ agGridUtilities.createSelectOption(HEALTH_AUTH_FILTERS, HEALTH_AUTH_FILTERS.LEVEL_DESIGNATOR) ]}
        isChipInputControl={healthAuth.isStatusFilter}
        chipInputProps={{
          options: ModelStatusOptions,
          allowOnlySingleSelect: true,
        }}
        rightContent={rightContent}
        disableControls={gridState.isRowEditing}
        onFiltersChanged={_searchFilters}
        onSearch={sv => gridState.gridApi.onFilterChanged()}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        disablePagination={gridState.isRowEditing}
      />
    </>
  );
};

export default inject('healthAuthStore', 'sidebarStore')(observer(HealthAuth));

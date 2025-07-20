import React, { FC, useEffect, useRef, ReactNode } from 'react';
import { VIEW_MODE, AuditHistory, baseApiPath } from '@wings/shared';
import {
  CustomAgGridReact,
  useGridFilters,
  agGridUtilities,
  useAgGrid,
  useGridState,
  IActionMenuItem,
} from '@wings-shared/custom-ag-grid';
import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { 
  SETTING_ID, 
  StatusBaseModel, 
  useVMSModuleSecurity, 
  VENDOR_LEVEL_COMPARISON_FILTERS, 
  VendorManagmentModel,  
} from '../Shared';
import {
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  UIStore,
  Utilities,
  regex,
  SearchStore,
  GRID_ACTIONS,
  ViewPermission,
  cellStyle,
  SelectOption,
} from '@wings-shared/core';
import { 
  BaseStore, SettingsStore, 
  vendorManagementHeadersNew, 
  VendorManagementStore 
} from '../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router-dom';
import { useStyles } from './VendorLevelGrid.styles';
import { gridFilters } from './fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { forkJoin } from 'rxjs';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { CustomLinkButton } from '@wings-shared/layout';
import { SearchHeaderV2, ISearchHeaderRef } from '@wings-shared/form-controls';
import { VENDOR_AUDIT_MODULES } from '../Shared/Enums/AuditModules.enum';
import { SettingNamesMapper } from '../../Stores/SettingsMapper';

interface Props {
  vendorManagementStore?: VendorManagementStore;
  settingsStore?: SettingsStore;
}

const VendorLevelGrid: FC<Props> = ({ vendorManagementStore, settingsStore }) => {
  const classes = useStyles();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_LEVEL_COMPARISON_FILTERS, VendorManagmentModel>(gridFilters, gridState);
  const unsubscribe = useUnsubscribe();
  const location = useLocation();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const filtersApi = useGridFilters<VENDOR_LEVEL_COMPARISON_FILTERS>(gridFilters, gridState);
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const isStatusFilter = Utilities.isEqual(
    searchHeaderRef.current?.getSelectedOption('defaultOption'),
    VENDOR_LEVEL_COMPARISON_FILTERS.VENDOR_STATUS
  );
  
  useEffect(() => {
    const searchData = SearchStore.searchData.get(location.pathname);
    if (searchData) {
      gridState.setPagination(searchData.pagination);
      searchHeaderRef.current?.setupDefaultFilters(searchData);
      SearchStore.clearSearchData(location.pathname)
      return;
    }
    loadInitialData();
  }, []);

  const onInputChange = (): void => {
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (): void => {
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const rightContent = (): ReactNode => {
    return (
      <ViewPermission hasPermission={vmsModuleSecurityV2.isEditable}>
        <CustomLinkButton variant="contained" startIcon={'+'} to="upsert/new" title="Add Vendor" />
      </ViewPermission>
    );
  };

  const saveRowData = (rowIndex: number) => {
    upsertVendor(rowIndex);
  };

  const searchCollection = (): IAPIGridRequest | null => {
    const propertyValue=getSearchValue();
    if(propertyValue === ''){
      return null;
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType, searchHeaderRef.current.selectedOption)
    );
    const filters = [
      {
        propertyName: property?.apiPropertyName,
        propertyValue: propertyValue,
        operator: 'string',
        filterType: 'string',
      },
    ];
    return {
      searchCollection: JSON.stringify(filters),
    };
  };

  const getSearchValue=():string => {
    const searchHeader = searchHeaderRef.current;
    const chip = searchHeader?.getFilters().chipValue?.valueOf();
    if (!searchHeader) {
      return null;
    }
    
    const propertyValue = (chip?.length > 0
      ? chip[0]?.label
      : searchHeader.searchValue
        ? searchHeader.searchValue
        :'')
    return propertyValue;
  }

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...searchCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    forkJoin([ 
      vendorManagementStore.getVMSComparison(request), 
      settingsStore?.getSettings(
        SETTING_ID.SETTINGS_VENDOR_STATUS, 
        SettingNamesMapper[SETTING_ID.SETTINGS_VENDOR_STATUS]
      ),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: [IAPIPageResponse<VendorManagmentModel>, StatusBaseModel[]]) => {
        gridState.setPagination(new GridPagination({ ...response[0] }));
        const results = VendorManagmentModel.deserializeList(response[0].results);
        gridState.setGridData(results);
        const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const upsertVendor = (rowIndex: number): void => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    const request = new VendorManagmentModel({ ...model });
    request.vendorStatusId = request.vendorStatus.id as any;
    UIStore.setPageLoader(true);
    vendorManagementStore
      ?.upsertVendor(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: VendorManagmentModel) => {
          response.vendorStatus = new StatusBaseModel(response.vendorStatus);
          agGrid._updateTableItem(rowIndex, response);
        },
        error: error => {
          agGrid._startEditingCell(rowIndex, 'name');
          BaseStore.showAlert(error.message, request.id);
        },
      });
  };

  const actionMenus = (): IActionMenuItem[] =>{
    return [
      {
        title: 'Edit',
        action: GRID_ACTIONS.EDIT,
        isHidden: !vmsModuleSecurityV2.isEditable,
        to: node => `upsert/${node.data.id}/${node.data.code}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`,
      },
      {
        title: 'Details',
        action: GRID_ACTIONS.DETAILS,
        to: node => `upsert/${node.data.id}/${node.data.code}/${VIEW_MODE.DETAILS.toLocaleLowerCase()}`,
      },
      { title: 'Audit', action: GRID_ACTIONS.AUDIT },
    ];
  }

  const setSearchData=():void=>{
    const propertyValue=getSearchValue();
    if (propertyValue) {
      const searchHeaderFilter = searchHeaderRef.current.getFilters();
      SearchStore.searchData.set(location.pathname,
        {
          searchValue:searchHeaderFilter.searchValue,
          selectInputsValues:searchHeaderFilter.selectInputsValues,
          chipValue:searchHeaderFilter.chipValue,
          pagination:gridState.pagination
        });
    }
  }

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 295,
      editable: false,
      headerTooltip:'Name',
      cellEditorParams: {
        placeHolder: 'name',
        ignoreNumber: true,
        rules: 'required|string|between:3,200',
      },
    },
    {
      headerName: 'Code',
      field: 'code',
      maxWidth: 100,
      headerTooltip:'Code',
      cellEditorParams: {
        placeHolder: 'code',
        ignoreNumber: true,
        rules: `required|string|between:2,3|regex:${regex.alphaNumericWithoutSpaces}`,
      },
    },
    {
      headerName: 'Status',
      field: 'vendorStatus',
      headerTooltip:'Status',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      cellEditorParams: {
        isRequired: true,
        placeHolder: 'Vendor Status',
        getAutoCompleteOptions: () => settingsStore?.vendorSettings,
        valueGetter: (option: SelectOption) => option.value,
        ignoreNumber: true,
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      suppressSizeToFit: true,
      minWidth: 200,
      maxWidth: 200,
      cellStyle: { ...cellStyle() },
      cellRendererParams: {
        isActionMenu: true,
        actionMenus: () => actionMenus(),
        onAction: (action: GRID_ACTIONS, rowIndex: number, node: RowNode) => {
          if(action === GRID_ACTIONS.EDIT || action === GRID_ACTIONS.DETAILS){
            setSearchData();
          }
          if (action === GRID_ACTIONS.AUDIT) {
            const model: VendorManagmentModel = agGrid._getTableItem(rowIndex);
            ModalStore.open(
              <AuditHistory
                title={model.name || model.commonName}
                entityId={model.id}
                entityType={VENDOR_AUDIT_MODULES.VENDORS}
                baseUrl={`${baseApiPath.vendorManagementCoreUrl}`}
                schemaName={VENDOR_AUDIT_MODULES.VENDORS}
                headers={vendorManagementHeadersNew}
              />
            );
          }
        },
      },
    },
  ];

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: false,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              agGrid._startEditingCell(rowIndex, 'name');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              agGrid.cancelEditing(rowIndex);
              agGrid.filtersApi.resetColumnFilters();
              break;
          }
        },
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: false,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        filtersApi.onSortChanged(e);
        loadInitialData();
      },
    };
  };

  return (
    <>
      
      <SearchHeaderV2
        placeHolder="Start typing to search"
        ref={searchHeaderRef}
        onExpandCollapse={agGrid.autoSizeColumns}
        selectInputs={[
          agGridUtilities.createSelectOption(
            VENDOR_LEVEL_COMPARISON_FILTERS,
            VENDOR_LEVEL_COMPARISON_FILTERS.VENDOR_NAME,
            'defaultOption'
          ),
        ]}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        rightContent={rightContent}
        onFilterChange={isInitEvent => {
          loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
          agGrid.cancelEditing(0);
        }}

        isChipInputControl={isStatusFilter}
        chipInputProps={{
          options: isStatusFilter ? settingsStore?.vendorSettings : [],
          allowOnlySingleSelect: true,
        }}
      />
      <CustomAgGridReact
        isRowEditing={gridState.isRowEditing}
        rowData={gridState.data}
        gridOptions={gridOptions()}
        serverPagination={true}
        paginationData={gridState.pagination}
        onPaginationChange={loadInitialData}
        classes={{ customHeight: classes.customHeight }}
        disablePagination={gridState.isRowEditing || gridState.isProcessing}
      />
    </>
  );
};
export default inject('vendorManagementStore', 'settingsStore')(observer(VendorLevelGrid));

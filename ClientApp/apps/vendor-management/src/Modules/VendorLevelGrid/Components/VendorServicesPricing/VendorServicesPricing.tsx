import React, { FC, useEffect, useRef, ReactNode, useState } from 'react';
import {
  ColDef,
  GridOptions,
  RowNode,
  ValueFormatterParams,
  ValueGetterParams
} from 'ag-grid-community';
import {
  useVMSModuleSecurity,
  VENDOR_PRICING_COMPARISON_FILTERS,
  VENDOR_PRICING_FILTERS,
  VendorLocationModel,
  VendorManagmentModel,
  
} from '../../../Shared';
import {
  UIStore,
  Utilities,
  regex,
  DATE_FORMAT,
  DATE_TIME_PICKER_TYPE,
  GridPagination,
  IClasses,
  IAPIGridRequest,
  SearchStore,
  IAPIPageResponse,
} from '@wings-shared/core';
import {
  ServiceItemPricingStore,
  SettingsStore,
  VendorManagementStore,
} from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation, useParams } from 'react-router-dom';
import { useStyles } from './ServicesPricing.styles';
import { gridFilters } from '../../../VendorPricing/fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import { ServiceItemPricingModel } from '../../../Shared/Models/ServiceItemPricing.model';
import { forkJoin } from 'rxjs';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import {
  AgGridCellEditor,
  CustomAgGridReact,
  useGridFilters,
  useAgGrid,
  AgGridActions,
  AgGridGroupHeader,
  AgGridAutoComplete,
  AgGridCheckBox,
  AgGridDateTimePicker,
  useGridState,
  AgGridViewRenderer,
  agGridUtilities
} from '@wings-shared/custom-ag-grid';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { Chip, Tooltip } from '@material-ui/core';

interface Props {
  serviceItemPricingStore: ServiceItemPricingStore;
  settingsStore: SettingsStore;
  vendorManagementStore: VendorManagementStore;
  classes?: IClasses;
  params?: { vendorId: number; id: number };
}

const VendorServicesPricing: FC<Props> = observer(
  ({ serviceItemPricingStore, settingsStore, vendorManagementStore }) => {
    const classes = useStyles();
    const gridState = useGridState();
    const params = useParams();
    const agGrid = useAgGrid<VENDOR_PRICING_COMPARISON_FILTERS, ServiceItemPricingModel>(gridFilters, gridState);
    const unsubscribe = useUnsubscribe();
    const vmsModuleSecurityV2 = useVMSModuleSecurity();
    const location = useLocation();
    const searchHeaderRef = useRef<ISearchHeaderRef>();
    const [ vendor, setVendor ] = useState('');
    const filtersApi = useGridFilters<VENDOR_PRICING_COMPARISON_FILTERS>(gridFilters, gridState);
    const isStatusFilter = Utilities.isEqual(
      searchHeaderRef.current?.getSelectedOption('defaultOption'),
      VENDOR_PRICING_COMPARISON_FILTERS.PRICING_STATUS
    );
    
    useEffect(() => {
      const searchData = SearchStore.searchData.get(location.pathname);
      if (searchData) {
        gridState.setPagination(searchData.pagination);
        searchHeaderRef.current?.setupDefaultFilters(searchData);
        SearchStore.clearSearchData(location.pathname);
        return;
      }
      loadInitialData();
      loadVendorData();
    }, []);

    const loadVendorData = () => {
      UIStore.setPageLoader(true);
      vendorManagementStore
        ?.getVendorById(parseInt(`${params.vendorId}`))
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: VendorManagmentModel) => {
          setVendor(response);
        });
    };

    function viewRenderer(
      vendorLocationChips: VendorLocationModel[],
      getTagProps?: AutocompleteGetTagProps,
      isReadMode?: boolean
    ): ReactNode {
      const numTags = vendorLocationChips.length;
      const limitTags = 1;
      const chipsList = isReadMode ? vendorLocationChips : [ ...vendorLocationChips ].slice(0, limitTags);
      return (
        <div>
          {Utilities.customArraySort(chipsList, 'label').map((vendorLocation: VendorLocationModel, index) => (
            <Tooltip title={vendorLocation ? vendorLocation.label : ''} key={index}>
              <Chip
                key={vendorLocation?.id}
                label={vendorLocation ? vendorLocation.label : ''}
                {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
              />
            </Tooltip>
          ))}
          {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
        </div>
      );
    }

    const columnDefs: ColDef[] = [
      {
        headerName: 'Vendor Locations',
        minWidth: 330,
        field: 'vendorLocation',
        cellEditor: 'customAutoComplete',
        cellRenderer: 'viewRenderer',
        sortable: false,
        filter: false,
        filterValueGetter: ({ data }: ValueGetterParams) => data.vendorLocation,
        headerTooltip: 'Vendor Locations',
        cellRendererParams: {
          getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
            viewRenderer(node.data?.vendorLocation, null, true),
        },
      },
      {
        headerName: 'Service Item Name',
        minWidth: 160,
        field: 'serviceItem',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Service Item Name',
      },
      {
        headerName: 'Commissionable',
        minWidth: 150,
        field: 'isCommissionable',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Commissionable',
        cellRendererParams: { readOnly: true },
      },
      {
        headerName: 'Direct Service',
        minWidth: 140,
        field: 'isDirectService',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Direct Service',
        cellRendererParams: {
          readOnly: true,
        },
      },
      {
        headerName: '3rd Party Vendor',
        minWidth: 150,
        field: 'thirdPartyVendorComment',
        headerTooltip: '3rd Party Vendor',
      },
      {
        headerName: 'Variable Price',
        minWidth: 150,
        field: 'isVariablePricing',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Variable Price',
        cellRendererParams: {
          readOnly: true,
        },
      },
      {
        headerName: 'Included Handling Fees',
        minWidth: 190,
        field: 'handlingFee',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Included Handling Fees',
      },
      {
        headerName: 'Price Unavailable',
        minWidth: 150,
        field: 'priceDataUnavailable',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Price Unavailable',
        cellRendererParams: {
          readOnly: true,
        },
      },
      {
        headerName: 'Parameter',
        minWidth: 120,
        field: 'parameter',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Parameter',
      },
      {
        headerName: 'Lower Limit',
        minWidth: 120,
        field: 'lowerLimit',
        headerTooltip: 'Lower Limit',
      },
      {
        headerName: 'Upper Limit',
        minWidth: 120,
        field: 'upperLimit',
        headerTooltip: 'Upper Limit',
      },
      {
        headerName: 'Price',
        minWidth: 100,
        field: 'price',
        headerTooltip: 'Price',
      },
      {
        headerName: 'Currency',
        minWidth: 110,
        field: 'currency',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Currency',
      },
      {
        headerName: 'Units',
        minWidth: 100,
        field: 'uom',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Units',
      },
      {
        headerName: 'Formula / Comments',
        minWidth: 180,
        field: 'comment',
        headerTooltip: 'Formula / Comments',
      },
      {
        headerName: 'Valid From',
        minWidth: 120,
        field: 'validFrom',
        cellEditor: 'customDateEditor',
        valueFormatter: ({ value }: ValueFormatterParams) =>
          Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
        headerTooltip: 'Valid From',
      },
      {
        headerName: 'Valid To',
        minWidth: 100,
        field: 'validTo',
        cellEditor: 'customDateEditor',
        valueFormatter: ({ value }: ValueFormatterParams) =>
          Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
        headerTooltip: 'Valid To',
      },
      {
        headerName: 'Status',
        minWidth: 100,
        field: 'status',
        cellEditor: 'customAutoComplete',
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Status',
      },
    ];

    const gridOptions = (): GridOptions => {
      const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
        context: { },
        columnDefs,
        isEditable: vmsModuleSecurityV2.isEditable,
        gridActionProps: {
          isActionMenu: vmsModuleSecurityV2.isEditable,
          showDeleteButton: false,
          getEditableState: ({ data }: RowNode) => {
            return !Boolean(data.id);
          },
        },
      });
      return {
        ...baseOptions,
        pagination: false,
        suppressRowClickSelection: true,
        suppressCellSelection: true,
        suppressClickEdit: true,
        isExternalFilterPresent: () => false,
        suppressScrollOnNewData: true,
        onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
        onSortChanged: e => {
          filtersApi.onSortChanged(e);
          loadInitialData();
        },
        frameworkComponents: {
          actionRenderer: AgGridActions,
          customAutoComplete: AgGridAutoComplete,
          customCellEditor: AgGridCellEditor,
          customHeader: AgGridGroupHeader,
          checkBoxRenderer: AgGridCheckBox,
          customTimeEditor: AgGridDateTimePicker,
          customDateEditor: AgGridDateTimePicker,
          viewRenderer: AgGridViewRenderer,
        },
      };
    };

    const headerActions = (): ReactNode => {
      return (
        <DetailsEditorHeaderSection
          title={<CustomTooltip title={vendor?.name} />}
          backNavTitle="Vendor"
          hideActionButtons={false}
          backNavLink="/vendor-management"
          hasEditPermission={false}
          showStatusButton={false}
          isActive={true}
        />
      );
    };

    const searchCollection = (): IAPIGridRequest | null => {
      const searchHeader = searchHeaderRef.current;
      const chip = searchHeader?.getFilters().chipValue?.valueOf();
      if (!searchHeader) {
        return null;
      }
      const property = gridFilters.find(({ uiFilterType }) =>
        Utilities.isEqual(uiFilterType, searchHeader.selectedOption)
      );
      const propertyValue =
        chip?.length > 0 ? chip[0]?.label : searchHeader.searchValue ? searchHeader.searchValue : '';
      if (propertyValue === '') {
        return null;
      }
      const filters = property?.apiPropertyName?.includes('AirportCode')
        ? [
          { propertyName: 'VendorLocation.AirportReference.ICAOCode', propertyValue: propertyValue },
          { propertyName: 'VendorLocation.AirportReference.UWACode', propertyValue: propertyValue, operator: 'or' },
          { propertyName: 'VendorLocation.AirportReference.FAACode', propertyValue: propertyValue, operator: 'or' },
          { propertyName: 'VendorLocation.AirportReference.IATACode', propertyValue: propertyValue, operator: 'or' },
          {
            propertyName: 'VendorLocation.AirportReference.RegionalCode',
            propertyValue: propertyValue,
            operator: 'or',
          },
          {
            propertyName: 'VendorLocation.AirportReference.DisplayCode',
            propertyValue: propertyValue,
            operator: 'or',
          },
        ]
        : [
          {
            propertyName: property?.apiPropertyName,
            propertyValue: propertyValue,
            operator: 'string',
            filterType: 'string',
          },
        ];
 
      return property?.apiPropertyName?.includes('Status') && chip?.length != 0
        ? {
          filterCollection: JSON.stringify([
            {
              propertyName: 'Vendor.Id',
              propertyValue: params.vendorId,
            },
            {
              propertyName: property?.apiPropertyName,
              propertyValue: propertyValue,
              operator: 'and'
            }
          ]),
        }
        : {
          searchCollection: JSON.stringify(filters),
        };
    };

    const loadInitialData = (pageRequest?: IAPIGridRequest) => {
      UIStore.setPageLoader(true);
      gridState.setIsProcessing(true);
      const request: IAPIGridRequest = {
        pageNumber: gridState.pagination.pageNumber,
        pageSize: gridState.pagination.pageSize,
        filterCollection: JSON.stringify([
          {
            propertyName: 'Vendor.Id',
            propertyValue: params.vendorId,
          },
        ]),
        ...searchCollection(),
        ...agGrid.filtersApi.gridSortFilters(),
        ...pageRequest,
      };
      forkJoin([ serviceItemPricingStore.getVMSComparison(request), settingsStore.getVendorSettingsStatus() ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            gridState.setIsProcessing(false);
          })
        )
        .subscribe((response: [IAPIPageResponse<ServiceItemPricingModel>, IAPIPageResponse<VendorManagmentModel>]) => {
          UIStore.setPageLoader(false);
          gridState.setPagination(new GridPagination({ ...response[0] }));
          const results = ServiceItemPricingModel.deserializeList(response[0].results);
          gridState.setGridData(results);
          const allowSelectAll = response[0].totalNumberOfRecords <= response[0].pageSize;
          gridState.setAllowSelectAll(allowSelectAll);
          agGrid.reloadColumnState();
          agGrid.refreshSelectionState();
        });
    };

    return (
      <ConfirmNavigate isBlocker={gridState.isRowEditing}>
        <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
          <SearchHeaderV2
            placeHolder="Start typing to search"
            ref={searchHeaderRef}
            onExpandCollapse={agGrid.autoSizeColumns}
            selectInputs={[
              agGridUtilities.createSelectOption(
                VENDOR_PRICING_FILTERS,
                VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_LOCATION_NAME,
                'defaultOption'
              ),
            ]}
            onResetFilterClick={() => {
              agGrid.filtersApi.resetColumnFilters();
            }}
            rightContent={()=>{}}
            onFilterChange={isInitEvent => {
              loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
            }}
            isChipInputControl={isStatusFilter}
            chipInputProps={{
              options: isStatusFilter ? settingsStore.vendorSettingsStatus : [],
              allowOnlySingleSelect: true,
            }}
          />
          <div className={classes.gridHeight}>
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
          </div>
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    );
  }
);
export default inject(
  'serviceItemPricingStore',
  'settingsStore',
  'vendorManagementStore'
)(VendorServicesPricing);

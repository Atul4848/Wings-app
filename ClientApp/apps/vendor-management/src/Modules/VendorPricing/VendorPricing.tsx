import React, { FC, useEffect, useRef, ReactNode } from 'react';
import {
  ColDef,
  GridOptions,
  ICellEditor,
  RowNode,
  ValueFormatterParams,
  ValueGetterParams,
  ICellEditorParams,
} from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  SETTING_ID,
  SettingBaseModel,
  StatusBaseModel,
  useVMSModuleSecurity,
  VENDOR_PRICING_COMPARISON_FILTERS,
  VendorLocationModel,
  VendorManagmentModel,
  VendorPricingModel,
  VmsModuleSecurity,
} from '../Shared';
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
  GRID_ACTIONS,
  cellStyle,
  IAPIPageResponse,
  ViewPermission,
} from '@wings-shared/core';
import {
  BaseStore,
  ServiceItemPricingStore,
  SettingsStore,
  VendorLocationStore,
  vendorManagementHeadersNew,
  VendorManagementStore,
} from '../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation } from 'react-router-dom';
import { useStyles } from './VendorPricing.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { gridFilters, vendorValueFormatter } from './fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { Chip, IconButton, Tooltip } from '@material-ui/core';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { SearchHeaderV2, ISearchHeaderRef } from '@wings-shared/form-controls';
import { ServiceItemModel } from '../Shared/Models/ServiceItem.model';
import { ServiceItemPricingModel } from '../Shared/Models/ServiceItemPricing.model';
import { HandlingFeeModel } from '../Shared/Models/HanglingFee.model';
import { forkJoin } from 'rxjs';
import { ConfirmDialog, ConfirmNavigate, ImportDialog } from '@wings-shared/layout';
import {
  AgGridCellEditor,
  AgGridViewRenderer,
  CustomAgGridReact,
  useGridFilters,
  agGridUtilities,
  useAgGrid,
  AgGridActions,
  AgGridGroupHeader,
  AgGridAutoComplete,
  AgGridCheckBox,
  AgGridDateTimePicker,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { UploadIcon, DownloadIcon } from '@uvgo-shared/icons';
import { Dialog } from '@uvgo-shared/dialog';
import { VIEW_MODE, AuditHistory, baseApiPath } from '@wings/shared';
import { VENDOR_AUDIT_MODULES } from '../Shared/Enums/AuditModules.enum';

interface Props {
  serviceItemPricingStore: ServiceItemPricingStore;
  settingsStore: SettingsStore;
  classes?: IClasses;
  vendorManagementStore: VendorManagementStore;
  vendorLocationStore: VendorLocationStore;
}

const VendorPricing: FC<Props> = observer(
  ({ serviceItemPricingStore, settingsStore, vendorManagementStore, vendorLocationStore }) => {
    const classes = useStyles();
    const gridState = useGridState();
    const agGrid = useAgGrid<VENDOR_PRICING_COMPARISON_FILTERS, ServiceItemPricingModel>(gridFilters, gridState);
    const unsubscribe = useUnsubscribe();
    const vmsModuleSecurityV2 = useVMSModuleSecurity();
    const location = useLocation();
    const searchHeaderRef = useRef<ISearchHeaderRef>();
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
      loadDropdownsData();
    }, []);

    const onInputChange = (colDef: ICellEditorParams, value): void => {
      gridState.setIsAllRowsSelected(true);
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
      if (!value) {
        return;
      }
      const colId = colDef.column.getColId();
      switch (colId) {
        case 'validFrom':
          const vtCol = agGrid.fetchCellInstance('validTo');
          const vfToDate = new Date(vtCol.getValue());
          const vfFromDate = new Date(value);
          if (vfFromDate > vfToDate) {
            vtCol.setValue(value);
          }
          break;
        case 'validTo':
          const vfCol = agGrid.fetchCellInstance('validFrom');
          const vtFromDate = new Date(vfCol.getValue());
          const vtToDate = new Date(value);
          if (vtFromDate >= vtToDate) {
            BaseStore.showAlert('Valid to date cannot be less than valid from date', 0);
            agGrid.fetchCellInstance('validTo').setValue('');
            gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
          }
          break;
        case 'comment':
          const handlingFee = fetchCellValue([ 'handlingFee' ]);
          if (handlingFee[0]?.name === 'Conditional') {
            if (value) {
              serviceItemPricingStore.isCommentFieldRequired = false;
            } else {
              serviceItemPricingStore.isCommentFieldRequired = true;
              agGrid.fetchCellInstance('comment')?.setRules('required|string|between:0,300');
            }
          }
          break;
      }
    };

    const deletePricing = (rowIndex: number): void => {
      const model: ServiceItemPricingModel = agGrid._getTableItem(rowIndex);
      UIStore.setPageLoader(true);
      gridState.setIsProcessing(true);
      serviceItemPricingStore
        .removePricing(model.id)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            gridState.setIsProcessing(false);
          })
        )
        .subscribe({
          next: () => {
            agGrid._removeTableItems([ model ]);
            agGrid.filtersApi.resetColumnFilters();
          },
          error: error => {
            agGrid._startEditingCell(rowIndex, 'isDirectService');
            BaseStore.showAlert(error.message, model.id);
          },
        });
    };

    const onCheckboxChange = (key: string, value): void => {
      gridState.setIsAllRowsSelected(true);
      setRequiredRules();
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    };

    const onDropDownChange = (colDef: ICellEditorParams, value): void => {
      gridState.setIsAllRowsSelected(true);
      gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
      const colId = colDef.column.getColId();
      switch (colId) {
        case 'vendor':
          agGrid.fetchCellInstance('vendorLocation').setValue([]);
          vendorLocationStore.vendorLocationList = [];
          gridState.setHasError(true);
          filterLocationByVendor(value);
          break;
        case 'vendorLocation':
          const foundGetAll = getAllLocationOptionSelected(value, 0);
          if (foundGetAll) {
            const allLocationList = vendorLocationStore.vendorLocationList.slice(
              1,
              vendorLocationStore.vendorLocationList.length
            );
            agGrid.fetchCellInstance('vendorLocation').setValue(allLocationList);
          }
          break;
        case 'handlingFee':
          setRequiredRules();
          loadDropdownsData(undefined, false);
          break;
      }
    };

    const getAllLocationOptionSelected = (vendorLocationModelArray: VendorLocationModel[], toFindAll: number) => {
      return vendorLocationModelArray.find(v => v.id == toFindAll);
    };

    const setAllLocationOption = new VendorLocationModel({
      id: 0,
      name: 'ALL',
    });

    const filterLocationByVendor = (vendor?: VendorManagmentModel) => {
      if (!vendor) {
        return;
      }
      const filter = vendor?.id
        ? JSON.stringify([
          {
            propertyName: 'Vendor.Id',
            propertyValue: vendor?.id,
          },
        ])
        : '';

      const request: IAPIGridRequest = {
        filterCollection: filter,
        pageNumber: 1,
        pageSize: 500,
      };
      vendorLocationStore.getVMSComparison(request).subscribe(response => {
        vendorLocationStore.vendorLocationList.unshift(setAllLocationOption);
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
        headerName: 'Vendor (Code)',
        minWidth: 100,
        field: 'vendor',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => vendorValueFormatter(value),
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Vendor (Code)',
        cellEditorParams: {
          isRequired: true,
          placeHolder: 'Vendor (Code)',
          getAutoCompleteOptions: () => vendorManagementStore.vendorList,
          onSearch: (value: string) => vendorManagementStore.searchVendor(value),
        },
      },
      {
        headerName: 'Vendor Location (Airport/City)',
        minWidth: 330,
        field: 'vendorLocation',
        cellEditor: 'customAutoComplete',
        cellRenderer: 'viewRenderer',
        sortable: false,
        filter: false,
        filterValueGetter: ({ data }: ValueGetterParams) => data.vendorLocation,
        headerTooltip: 'Vendor Location (Airport/City)',
        cellRendererParams: {
          getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
            viewRenderer(node.data?.vendorLocation, null, true),
        },
        cellEditorParams: {
          isRequired: true,
          placeHolder: 'Vendor Location (Airport/City)',
          displayKey: 'name',
          multiSelect: true,
          multiple: true,
          disableCloseOnSelect: true,
          valueGetter: (selectedOptions: StatusBaseModel[]) => selectedOptions,
          renderTags: (values: StatusBaseModel[], getTagProps: AutocompleteGetTagProps) =>
            viewRenderer(values, getTagProps),
          getAutoCompleteOptions: () => vendorLocationStore.vendorLocationList,
          rules: 'required',
        },
        valueGetter: (params) => {
          if (Array.isArray(params.data.vendorLocation)) {
            return params.data.vendorLocation.map((item: any) => item.name).join(', ') || '';
          }
          return params.data.vendorLocation?.name || '';
        },
      },
      {
        headerName: 'Service Item Name',
        minWidth: 100,
        field: 'serviceItem',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Service Item Name',
        cellEditorParams: {
          isRequired: true,
          placeHolder: 'Service Item Name',
          getAutoCompleteOptions: () => settingsStore.vendorSettingsServiceItemName,
        },
      },
      {
        headerName: 'Commissionable',
        minWidth: 100,
        field: 'isCommissionable',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Commissionable',
        cellRendererParams: { readOnly: true },
      },
      {
        headerName: 'Direct Service',
        minWidth: 100,
        field: 'isDirectService',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Direct Service',
        cellRendererParams: {
          readOnly: true,
        },
        cellEditorParams: {
          onChange: (a: any, b: any) => {
            serviceItemPricingStore.isDirectService = b;
            onCheckboxChange('isDirectService', b);
          },
        },
      },
      {
        headerName: '3rd Party Vendor',
        minWidth: 100,
        field: 'thirdPartyVendorComment',
        headerTooltip: '3rd Party Vendor',
        cellEditorParams: {
          placeHolder: 'thirdPartyVendorComment',
          ignoreNumber: true,
          getDisableState: (node: RowNode) => serviceItemPricingStore.isDirectService,
          rules: `string|between:0,100|regex:${regex.alphaNumericWithCommaSpace}`,
        },
      },
      {
        headerName: 'Variable Price',
        minWidth: 100,
        field: 'isVariablePricing',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Variable Price',
        cellRendererParams: {
          readOnly: true,
        },
        cellEditorParams: {
          onChange: (a: any, b: any) => onCheckboxChange('isVariablePricing', b),
        },
      },
      {
        headerName: 'Included Handling Fees',
        minWidth: 100,
        field: 'handlingFee',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Included Handling Fees',
        cellEditorParams: {
          isRequired: true,
          placeHolder: 'handlingFee',
          getAutoCompleteOptions: () => settingsStore.vendorSettingsHandlingFee,
        },
      },
      {
        headerName: 'Price Unavailable',
        minWidth: 100,
        field: 'priceDataUnavailable',
        cellRenderer: 'checkBoxRenderer',
        cellEditor: 'checkBoxRenderer',
        headerTooltip: 'Price Unavailable',
        cellRendererParams: {
          readOnly: true,
        },
        cellEditorParams: {
          onChange: (a: any, b: any) => onCheckboxChange('priceDataUnavailable', b),
        },
      },
      {
        headerName: 'Parameter',
        minWidth: 100,
        field: 'parameter',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Parameter',
        cellEditorParams: {
          isRequired: (node: Node) => getValidationConditions(),
          placeHolder: 'Parameter',
          getAutoCompleteOptions: () => settingsStore.vendorSettingsParameters,
        },
      },
      {
        headerName: 'Lower Limit',
        minWidth: 100,
        field: 'lowerLimit',
        headerTooltip: 'Lower Limit',
        cellEditorParams: {
          placeHolder: 'lowerLimit',
          ignoreNumber: true,
          rules: `required|numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
        },
      },
      {
        headerName: 'Upper Limit',
        minWidth: 100,
        field: 'upperLimit',
        headerTooltip: 'Upper Limit',
        cellEditorParams: {
          placeHolder: 'upperLimit',
          ignoreNumber: true,
          rules: `required|numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
        },
      },
      {
        headerName: 'Price',
        minWidth: 100,
        field: 'price',
        headerTooltip: 'Price',
        cellEditorParams: {
          placeHolder: 'price',
          ignoreNumber: true,
          rules: `required|numeric|between:0,99999.99|regex:${regex.numberWithTwoDecimal}`,
        },
      },
      {
        headerName: 'Currency',
        minWidth: 100,
        field: 'currency',
        cellEditor: 'customAutoComplete',
        sortable: false,
        filter: false,
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Currency',
        cellEditorParams: {
          placeHolder: 'Currency',
          getAutoCompleteOptions: () => settingsStore.vendorSettingsCurrency,
          isRequired: (node: Node) => getValidationConditions(),
        },
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
        cellEditorParams: {
          placeHolder: 'Units',
          getAutoCompleteOptions: () => settingsStore.vendorSettingsUnits,
          isRequired: (node: Node) => getValidationConditions(),
        },
      },
      {
        headerName: 'Formula / Comments',
        minWidth: 100,
        field: 'comment',
        headerTooltip: 'Formula / Comments',
        cellEditorParams: {
          placeHolder: 'formulaComments',
          ignoreNumber: true,
          rules: 'string|between:0,300',
          isRequired: () => serviceItemPricingStore.isCommentFieldRequired,
        },
      },
      {
        headerName: 'Valid From',
        minWidth: 100,
        field: 'validFrom',
        cellEditor: 'customDateEditor',
        valueFormatter: ({ value }: ValueFormatterParams) =>
          Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
        headerTooltip: 'Valid From',
        cellEditorParams: {
          isRequired: true,
          format: DATE_FORMAT.DATE_PICKER_FORMAT,
          pickerType: DATE_TIME_PICKER_TYPE.DATE,
          minDate: () => new Date(),
        },
      },
      {
        headerName: 'Valid To',
        minWidth: 100,
        field: 'validTo',
        cellEditor: 'customDateEditor',
        valueFormatter: ({ value }: ValueFormatterParams) =>
          Utilities.getformattedDate(value, DATE_FORMAT.DATE_PICKER_FORMAT),
        headerTooltip: 'Valid To',
        cellEditorParams: {
          isRequired: true,
          format: DATE_FORMAT.DATE_PICKER_FORMAT,
          pickerType: DATE_TIME_PICKER_TYPE.DATE,
          minDate: () => new Date(),
        },
      },
      {
        headerName: 'Status',
        minWidth: 100,
        field: 'status',
        cellEditor: 'customAutoComplete',
        valueFormatter: ({ value }) => value?.name || '',
        comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
        headerTooltip: 'Status',
        cellEditorParams: {
          isRequired: true,
          placeHolder: 'Pricing Status',
          getAutoCompleteOptions: () => settingsStore.vendorSettingsStatus,
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
      },
    ];

    const saveRowData = (rowIndex: number) => {
      upsertVendorPricing(rowIndex);
    };

    const gridOptions = (): GridOptions => {
      const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
        context: { onInputChange, onDropDownChange },
        columnDefs,
        isEditable: vmsModuleSecurityV2.isEditable,
        gridActionProps: {
          isActionMenu: vmsModuleSecurityV2.isEditable,
          showDeleteButton: false,
          getEditableState: ({ data }: RowNode) => {
            return !Boolean(data.id);
          },

          actionMenus: ({ data }: RowNode) => [
            {
              title: 'Edit',
              isHidden: !vmsModuleSecurityV2.isEditable,
              action: GRID_ACTIONS.EDIT,
            },
            {
              title: 'Delete',
              isHidden: !vmsModuleSecurityV2.isEditable,
              action: GRID_ACTIONS.DELETE,
            },
            {
              title: 'Audit',
              isHidden: !vmsModuleSecurityV2.isEditable,
              action: GRID_ACTIONS.AUDIT,
            },
          ],
          getDisabledState: () => gridState.hasError || serviceItemPricingStore.isCommentFieldRequired,
          onAction: (action: GRID_ACTIONS, rowIndex: number) => {
            
            const model: ServiceItemPricingModel = agGrid._getTableItem(rowIndex);
            switch (action) {
              case GRID_ACTIONS.EDIT:
                agGrid._startEditingCell(rowIndex, 'vendorLocation');
                vendorLocationStore.vendorLocationList = [];
                filterLocationByVendor(model.vendor);
                if (!model.isDirectService) {
                  serviceItemPricingStore.isDirectService = false;
                }
                break;
              case GRID_ACTIONS.SAVE:
                saveRowData(rowIndex);
                break;
              case GRID_ACTIONS.CANCEL:
                getConfirmation(rowIndex);
                break;
              case GRID_ACTIONS.DELETE:
                confirmRemove(rowIndex);
                break;
              case GRID_ACTIONS.AUDIT:
                ModalStore.open(
                  <AuditHistory
                    title={model.name}
                    entityId={model.id}
                    entityType={VENDOR_AUDIT_MODULES.PRICING}
                    baseUrl={`${baseApiPath.vendorManagementCoreUrl}`}
                    schemaName={VENDOR_AUDIT_MODULES.PRICING}
                    headers={vendorManagementHeadersNew}
                  />
                );
                break;
            }
          },
        },
      });
      return {
        ...baseOptions,
        pagination: false,
        suppressClickEdit: true,
        suppressScrollOnNewData: true,
        isExternalFilterPresent: () => false,
        onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
        onSortChanged: e => {
          filtersApi.onSortChanged(e);
          loadInitialData();
        },
        frameworkComponents: {
          actionRenderer: AgGridActions,
          customAutoComplete: AgGridAutoComplete,
          customCellEditor: AgGridCellEditor,
          viewRenderer: AgGridViewRenderer,
          customHeader: AgGridGroupHeader,
          checkBoxRenderer: AgGridCheckBox,
          customTimeEditor: AgGridDateTimePicker,
          customDateEditor: AgGridDateTimePicker,
        },
      };
    };

    const removeUnSavedRow = (rowIndex: number) => {
      const data: ServiceItemPricingModel = agGrid._getTableItem(rowIndex);
      if (data.id == 0) {
        const model = agGrid._getTableItem(rowIndex);
        const modelList = new Array(model);
        agGrid._removeTableItems(modelList);
      }
      gridState.setIsAllRowsSelected(false);
    };

    const fetchCellValue = (colList: string[]): any[] => {
      const editorInstance: ICellEditor[] = gridState.gridApi.getCellEditorInstances({
        columns: colList,
      });
      const values = colList.map((item, index) => {
        return editorInstance != undefined && editorInstance.length > 0 ? editorInstance[index].getValue() : false;
      });
      return values;
    };

    const setRequiredRules = (): void => {
      const cellValues = fetchCellValue([ 'isDirectService', 'handlingFee' ]);
      const hasDirectServiceValue = Boolean(cellValues[0]);
      const hasHandlingFeeValue = HandlingFeeModel.deserialize(cellValues[1]);
      const hasConditionMatched = getValidationConditions();

      const thirdPartyVendorCell = agGrid.fetchCellInstance('thirdPartyVendorComment');
      thirdPartyVendorCell?.setRules(
        hasDirectServiceValue
          ? `string|between:0,100|regex:${regex.alphaNumericWithCommaSpace}`
          : `required|string|between:0,100|regex:${regex.alphaNumericWithCommaSpace}`
      );
      thirdPartyVendorCell.setValue(hasDirectServiceValue ? '' : thirdPartyVendorCell.getValue());

      agGrid
        .fetchCellInstance('lowerLimit')
        ?.setRules(hasConditionMatched ? `${getNumberValidation(7)}` : `${getNumberValidation(7)}`);

      agGrid
        .fetchCellInstance('upperLimit')
        ?.setRules(hasConditionMatched ? `${getNumberValidation(7)}` : `${getNumberValidation(7)}`);

      agGrid
        .fetchCellInstance('price')
        ?.setRules(hasConditionMatched ? `${getNumberValidation(5)}` : `${getNumberValidation(5)}`);

      agGrid
        .fetchCellInstance('comment')
        ?.setRules(
          hasHandlingFeeValue?.name == 'Conditional' ? 'required|string|between:0,300' : 'string|between:0,300'
        );

      serviceItemPricingStore.isCommentFieldRequired = false;
      if (hasHandlingFeeValue?.name === 'Conditional') {
        const commentField = agGrid.fetchCellInstance('comment').getValue();
        if (!commentField) {
          serviceItemPricingStore.isCommentFieldRequired = true;
        }
      }
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    };

    const openUploadPictureModal = (): void => {
      ModalStore.open(
        <ImportDialog
          title="Select Excel File"
          fileType="xlsx"
          onUploadFile={file => {
            uploadExcelFile(file);
            return;
          }}
          isLoading={() => UIStore.pageLoading}
        />
      );
    };

    const dialogContent = (errors: string[]): ReactNode => {
      return (
        <div>
          <ul className={classes.excelErrorList}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );
    };

    const uploadExcelFile = (file: File): void => {
      UIStore.setPageLoader(true);
      serviceItemPricingStore
        ?.uploadPricingExcel(file)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
          })
        )
        .subscribe({
          next: response => {
            if (response.isValid) {
              BaseStore.showAlert('File uploaded successfully', 0);
              loadInitialData();
              ModalStore.close();
            } else {
              ModalStore.open(
                <Dialog
                  title="Pricing Upload Errors"
                  open={true}
                  onClose={() => ModalStore.close()}
                  dialogContent={() => dialogContent(response.errors)}
                  dialogActions={() => null}
                />
              );
            }
          },
          error: error => {
            if (error.response.data.errors) {
              errorHandler(error.response.data.errors, '0');
              return;
            }
            BaseStore.showAlert(error.message, 0);
          },
        });
    };

    const rightContent = (): ReactNode => {
      return (
        <ViewPermission hasPermission={vmsModuleSecurityV2.isEditable}>
          <Tooltip title="Upload Excel">
            <IconButton
              color="primary"
              onClick={() => openUploadPictureModal()}
              disabled={gridState.isRowEditing || gridState.isProcessing}
            >
              <UploadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Excel">
            <IconButton
              color="primary"
              onClick={() => downloadTemplate()}
              disabled={gridState.isRowEditing || gridState.isProcessing}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <PrimaryButton
            variant="contained"
            color="primary"
            startIcon={'+'}
            disabled={gridState.isRowEditing || gridState.isProcessing}
            onClick={() => addNewPrice()}
          >
            Add Service
          </PrimaryButton>
        </ViewPermission>
      );
    };

    const getNumberValidation = (upperRangeDigitCount: number) => {
      const range = upperRangeDigitCount == 5 ? '0,99999.99' : '0,9999999.99';
      if (getPricingValidations()) {
        return `required|numeric|between:${range}|regex:${regex.numberWithTwoDecimal}`;
      }
      return `numeric|between:${range}|regex:${regex.numberWithTwoDecimal}`;
    };

    const getValidationConditions = () => {
      const cellValues = fetchCellValue([ 'isVariablePricing', 'handlingFee', 'priceDataUnavailable' ]);
      const hasVariablePricingValue = Boolean(cellValues[0]);
      const hasHandlingFeeValue = HandlingFeeModel.deserialize(cellValues[1]);
      const hasPriceDataUnavailable = Boolean(cellValues[2]);

      return (
        !hasVariablePricingValue &&
        !hasPriceDataUnavailable &&
        (hasHandlingFeeValue?.name == 'Yes + Ad hoc' ||
          hasHandlingFeeValue?.name == 'No' ||
          hasHandlingFeeValue?.name == 'Conditional')
      );
    };

    const getPricingValidations = () => {
      const cellValues = fetchCellValue([ 'isVariablePricing', 'handlingFee', 'priceDataUnavailable' ]);
      const hasVariablePricingValue = Boolean(cellValues[0]);
      const hasHandlingFeeValue = HandlingFeeModel.deserialize(cellValues[1]);
      const hasPriceDataUnavailable = Boolean(cellValues[2]);
      return (
        !hasVariablePricingValue &&
        !hasPriceDataUnavailable &&
        (hasHandlingFeeValue?.name == 'Yes + Ad hoc' ||
          hasHandlingFeeValue?.name == 'No' ||
          hasHandlingFeeValue?.name == 'Conditional')
      );
    };

    const addNewPrice = () => {
      const data = [ new ServiceItemPricingModel() ];
      agGrid.addNewItems(data, { startEditing: false, colKey: 'vendor' });
      vendorLocationStore.vendorLocationList = [];
      loadDropdownsData(data[0], false);
      gridState.setHasError(true);
    };

    const errorHandler = (errors: object, id): void => {
      Object.values(errors)?.forEach(errorMessage => BaseStore.showAlert(errorMessage[0], id));
    };

    const upsertVendorPricing = (rowIndex: number): void => {
      gridState.setIsProcessing(true);
      gridState.gridApi.stopEditing();
      const model = agGrid._getTableItem(rowIndex);
      UIStore.setPageLoader(true);
      serviceItemPricingStore
        ?.upsertServiceItemPricing([ model.serialize() ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            gridState.setIsProcessing(false);
            gridState.setIsAllRowsSelected(false);
          })
        )
        .subscribe({
          next: (response: ServiceItemPricingModel[]) => {
            const data = ServiceItemPricingModel.deserialize(response[0]);
            agGrid._updateTableItem(rowIndex, data);
          },
          error: error => {
            agGrid._startEditingCell(rowIndex, 'vendor');
            if (error.response.data.errors) {
              errorHandler(error.response.data.errors, model.id.toString());
              return;
            }
            BaseStore.showAlert(error.message, model.id);
          },
        });
    };

    const downloadTemplate = (): void => {
      UIStore.setPageLoader(true);
      serviceItemPricingStore
        ?.downloadPricing()
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((file: File) => {
          const url = window.URL.createObjectURL(new Blob([ file ]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'Pricing.xlsx');
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          BaseStore.showAlert('File downloaded successfully!', 0);
        });
    };

    const getConfirmation = (rowIndex: number): void => {
      if (gridState.isAllRowsSelected) {
        ModalStore.open(
          <ConfirmDialog
            title="Confirm Changes"
            message={'Cancelling will lost your changes. Are you sure you want to cancel?'}
            yesButton="Confirm"
            onNoClick={() => ModalStore.close()}
            onYesClick={() => {
              ModalStore.close();
              cancelEditing(rowIndex);
              removeUnSavedRow(rowIndex);
            }}
          />
        );
      } else {
        cancelEditing(rowIndex);
        removeUnSavedRow(rowIndex);
      }
    };

    const confirmRemove = (rowIndex: number): void => {
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to remove this record?"
          yesButton="Delete"
          onNoClick={() => ModalStore.close()}
          onYesClick={() => {
            deletePricing(rowIndex);
            ModalStore.close();
          }}
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
          filterCollection: JSON.stringify(filters),
        }
        : {
          searchCollection: JSON.stringify(filters),
        };
    };

    const cancelEditing = (rowIndex: number) => {
      agGrid.cancelEditing(rowIndex);
      agGrid.filtersApi.resetColumnFilters();
      serviceItemPricingStore.isDirectService = true;
    };

    const loadInitialData = (pageRequest?: IAPIGridRequest) => {
      UIStore.setPageLoader(true);
      gridState.setIsProcessing(true);
      const request: IAPIGridRequest = {
        pageNumber: gridState.pagination.pageNumber,
        pageSize: gridState.pagination.pageSize,
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

    const loadDropdownsData = (model?: ServiceItemPricingModel, isLoadVendorLocation: boolean = true) => {
      UIStore.setPageLoader(false);
      forkJoin([
        vendorManagementStore.getVMSComparison(),
        settingsStore.getSettings(SETTING_ID.SETTINGS_PARAMETERS, 'Parameter'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_HANDLING_FEES, 'HandlingFee'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_CURRENCY, 'Currency'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_SERVICE_ITEM_NAME, 'ServiceItemName'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_UNITS, 'Units'),
      ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(
          (
            response: [
              IAPIPageResponse<VendorManagmentModel>,
              IAPIPageResponse<SettingBaseModel>,
              IAPIPageResponse<SettingBaseModel>,
              IAPIPageResponse<SettingBaseModel>,
              IAPIPageResponse<ServiceItemModel>,
              IAPIPageResponse<SettingBaseModel>
            ]
          ) => {
            UIStore.setPageLoader(false);
          }
        );
    };

    return (
      <ConfirmNavigate isBlocker={gridState.isRowEditing}>
        <SearchHeaderV2
          placeHolder="Start typing to search"
          ref={searchHeaderRef}
          onExpandCollapse={agGrid.autoSizeColumns}
          selectInputs={[
            agGridUtilities.createSelectOption(
              VENDOR_PRICING_COMPARISON_FILTERS,
              VENDOR_PRICING_COMPARISON_FILTERS.VENDOR_NAME,
              'defaultOption'
            ),
          ]}
          onResetFilterClick={() => {
            cancelEditing(0);
          }}
          rightContent={rightContent}
          onFilterChange={isInitEvent => {
            loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
            cancelEditing(0);
          }}
          isChipInputControl={isStatusFilter}
          chipInputProps={{
            options: isStatusFilter ? settingsStore.vendorSettingsStatus : [],
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
      </ConfirmNavigate>
    );
  }
);
export default inject(
  'serviceItemPricingStore',
  'settingsStore',
  'vendorManagementStore',
  'vendorLocationStore'
)(VendorPricing);

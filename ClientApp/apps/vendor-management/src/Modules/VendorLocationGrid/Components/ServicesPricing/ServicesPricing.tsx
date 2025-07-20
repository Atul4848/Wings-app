import React, { FC, useEffect, useRef, ReactNode, useState } from 'react';
import { ColDef, GridOptions, ICellEditor, RowNode, ValueFormatterParams, ICellEditorParams } from 'ag-grid-community';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  SETTING_ID,
  SettingBaseModel,
  useVMSModuleSecurity,
  VENDOR_PRICING_COMPARISON_FILTERS,
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
  GRID_ACTIONS,
  cellStyle,
  IAPIPageResponse,
} from '@wings-shared/core';
import {
  ApprovalChangesStore,
  BaseStore,
  ServiceItemPricingStore,
  SettingsStore,
  VendorLocationStore,
  vendorManagementHeadersNew,
  VendorManagementStore,
} from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useStyles } from './ServicesPricing.styles';
import { gridFilters } from '../../../VendorPricing/fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ISearchHeaderRef } from '@wings-shared/form-controls';
import { ServiceItemModel } from '../../../Shared/Models/ServiceItem.model';
import { ServiceItemPricingModel } from '../../../Shared/Models/ServiceItemPricing.model';
import { HandlingFeeModel } from '../../../Shared/Models/HanglingFee.model';
import { forkJoin } from 'rxjs';
import {
  ConfirmDialog,
  ConfirmNavigate,
  CustomLinkButton,
  DetailsEditorHeaderSection,
  DetailsEditorWrapper,
} from '@wings-shared/layout';
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
  AgGridMasterDetails,
} from '@wings-shared/custom-ag-grid';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { Button } from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { AuditHistory, baseApiPath } from '@wings/shared';
import { VENDOR_AUDIT_MODULES } from '../../../Shared/Enums/AuditModules.enum';

interface Props {
  serviceItemPricingStore: ServiceItemPricingStore;
  settingsStore: SettingsStore;
  classes?: IClasses;
  vendorManagementStore: VendorManagementStore;
  vendorLocationStore: VendorLocationStore;
  approvalChangesStore: ApprovalChangesStore;
  params?: { vendorId: number; id: number };
}

const VendorPricing: FC<Props> = observer(
  ({ serviceItemPricingStore, settingsStore, vendorManagementStore, vendorLocationStore, approvalChangesStore }) => {
    const classes = useStyles();
    const gridState = useGridState();
    const params = useParams();
    const agGrid = useAgGrid<VENDOR_PRICING_COMPARISON_FILTERS, ServiceItemPricingModel>(gridFilters, gridState);
    const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
    const unsubscribe = useUnsubscribe();
    const vmsModuleSecurityV2 = useVMSModuleSecurity();
    const location = useLocation();
    const searchHeaderRef = useRef<ISearchHeaderRef>();
    const filtersApi = useGridFilters<VENDOR_PRICING_COMPARISON_FILTERS>(gridFilters, gridState);
    const navigate = useNavigate();

    useEffect(() => {
      const searchData = SearchStore.searchData.get(location.pathname);
      if (searchData) {
        gridState.setPagination(searchData.pagination);
        searchHeaderRef.current?.setupDefaultFilters(searchData);
        SearchStore.clearSearchData(location.pathname);
        return;
      }
      loadInitialData();
      loadVendorLocationData();
    }, []);

    const onInputChange = (colDef: ICellEditorParams, value): void => {
      gridState.setIsAllRowsSelected(true);
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
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
        case 'lowerLimit':
        case 'upperLimit':
        case 'price':
          setRequiredRules();
          break;
      }
    };

    const onCheckboxChange = (key: string, value): void => {
      gridState.setIsAllRowsSelected(true);
      setRequiredRules();
      gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
    };

    const onDropDownChange = (colDef: ICellEditorParams, value): void => {
      gridState.setIsAllRowsSelected(true);
      gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
      if (!value) {
        return;
      }
      const colId = colDef.column.getColId();
      switch (colId) {
        case 'vendor':
          filterLocationByVendor(value);
          break;
        case 'handlingFee':
          setRequiredRules();
          loadDropdownsData(undefined, false);
          break;
      }
    };

    const filterLocationByVendor = (vendor?: VendorManagmentModel) => {
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
      };
      vendorLocationStore.getVMSComparison(request).subscribe();
    };

    const columnDefs: ColDef[] = [
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
        cellEditorParams: {
          isRequired: true,
          placeHolder: 'Service Item Name',
          getAutoCompleteOptions: () => settingsStore.vendorSettingsServiceItemName,
        },
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
        cellEditorParams: {
          onChange: (a: any, b: any) => {
            serviceItemPricingStore.isDirectService = b;
            onCheckboxChange('isDirectService', b);
          },
        },
      },
      {
        headerName: '3rd Party Vendor',
        minWidth: 150,
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
        minWidth: 150,
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
        minWidth: 190,
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
        minWidth: 150,
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
        minWidth: 120,
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
        minWidth: 120,
        field: 'lowerLimit',
        headerTooltip: 'Lower Limit',
        cellEditorParams: {
          placeHolder: 'lowerLimit',
          ignoreNumber: true,
          rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
          isRequired: (node: Node) => getPricingValidations(),
        },
      },
      {
        headerName: 'Upper Limit',
        minWidth: 120,
        field: 'upperLimit',
        headerTooltip: 'Upper Limit',
        cellEditorParams: {
          placeHolder: 'upperLimit',
          ignoreNumber: true,
          rules: `numeric|between:0,9999999.99|regex:${regex.numberWithTwoDecimal}`,
          isRequired: (node: Node) => getPricingValidations(),
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
          rules: `numeric|between:0,99999.99|regex:${regex.numberWithTwoDecimal}`,
          isRequired: (node: Node) => getPricingValidations(),
        },
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
        minWidth: 180,
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
        minWidth: 120,
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
                agGrid._startEditingCell(rowIndex, 'serviceItem');
                vendorLocationStore.vendorLocationList = [];
                if (!model.isDirectService) {
                  serviceItemPricingStore.isDirectService = false;
                }
                loadDropdownsData(model);
                break;
              case GRID_ACTIONS.SAVE:
                saveRowData(rowIndex);
                break;
              case GRID_ACTIONS.CANCEL:
                getConfirmation(rowIndex);
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
        suppressRowClickSelection: true,
        suppressCellSelection: true,
        isExternalFilterPresent: () => false,
        suppressScrollOnNewData: true,
        onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
        onCellDoubleClicked: ({ rowIndex, colDef }) => {
          vendorLocationStore.vendorLocationList = [];
          const model = agGrid._getTableItem(rowIndex);
          loadDropdownsData(model);
          if (!model.isDirectService) {
            serviceItemPricingStore.isDirectService = false;
          }
          agGrid._startEditingCell(rowIndex, colDef.field);
        },
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
        },
      };
    };

    const removeUnSavedRow = (rowIndex: number) => {
      const data: ServiceItemPricingModel = agGrid._getTableItem(rowIndex);
      if (data?.id == 0) {
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
      agGrid.addNewItems(data, { startEditing: false, colKey: 'serviceItem' });
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
      model.vendorLocation.length == 0;
      {
        model.vendorId = serviceItemPricingStore.vendorLocationData.vendor?.id;
        model.vendor = serviceItemPricingStore.vendorLocationData.vendor;
        model.vendorLocation.push({
          id: serviceItemPricingStore.vendorLocationData.id,
          serviceItemPricingId: model.id,
          airportReference: serviceItemPricingStore.vendorLocationData.airportReference,
          vendorLocationId: serviceItemPricingStore.vendorLocationData.id,
          vendorLocationName: serviceItemPricingStore.vendorLocationData.name,
        });
      }
      serviceItemPricingStore
        ?.upsertServiceItemPricingLocations([ model.serialize() ])
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
            agGrid._startEditingCell(rowIndex, 'serviceItem');
            if (error.response.data.errors) {
              errorHandler(error.response.data.errors, model.id.toString());
              return;
            }
            BaseStore.showAlert(error.message, model.id);
          },
        });
    };

    const headerActions = (): ReactNode => {
      return (
        <DetailsEditorHeaderSection
          title={<CustomTooltip title={serviceItemPricingStore.vendorLocationData?.label} />}
          backNavTitle="Vendor Location"
          hideActionButtons={false}
          backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
          hasEditPermission={false}
          showStatusButton={false}
          isActive={true}
        />
      );
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
        filterCollection: JSON.stringify([
          {
            propertyName: 'VendorLocation.VendorLocationId',
            propertyValue: params.id,
          },
        ]),
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

    const loadVendorLocationData = () => {
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.getVendorLocationById(parseInt(params.id))
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: VendorLocationModel) => {
          serviceItemPricingStore.vendorLocationData = response;
          setSelectedVendorLocation(response);
        });
    };

    const loadDropdownsData = (model?: ServiceItemPricingModel, isLoadVendorLocation: boolean = true) => {
      UIStore.setPageLoader(false);
      if (isLoadVendorLocation) {
        filterLocationByVendor(model?.vendor);
      }
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

    const viewApprovalChanges = () => {
      navigate('approval-changes');
      approvalChangesStore.getServiceItemPricingApprovalData(serviceItemPricingStore.vendorLocationData.id);
    };

    return (
      <ConfirmNavigate isBlocker={gridState.isRowEditing}>
        <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
          <div className={classes.gridHeight}>
            <div className={classes.headerCustomButtons}>
              <CustomLinkButton
                variant="contained"
                title="Add Service"
                disabled={gridState.isProcessing || gridState.isRowEditing}
                onClick={() => {
                  if (!gridState.isProcessing && !gridState.isRowEditing) addNewPrice();
                }}
                startIcon={<AddCircleOutline />}
              />
              <PrimaryButton
                color="primary"
                disabled={gridState.isProcessing || gridState.isRowEditing} 
                onClick={() => viewApprovalChanges()}
                variant="outlined"
              >
                View Changes
              </PrimaryButton>
            </div>
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
            {/* <AgGridMasterDetails
              addButtonTitle="Add Service"
              onAddButtonClick={() => addNewPrice()}
              hasAddPermission={vmsModuleSecurityV2.isEditable}
              disabled={gridState.isProcessing || gridState.isRowEditing}
              resetHeight={true}
              isPrimaryBtn={true}
            >
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
            </AgGridMasterDetails> */}
          </div>
        </DetailsEditorWrapper>
      </ConfirmNavigate>
    );
  }
);
export default inject(
  'serviceItemPricingStore',
  'settingsStore',
  'vendorManagementStore',
  'vendorLocationStore',
  'approvalChangesStore'
)(VendorPricing);

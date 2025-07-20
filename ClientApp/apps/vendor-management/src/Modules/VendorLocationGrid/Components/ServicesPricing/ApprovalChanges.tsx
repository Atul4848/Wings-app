import React, { FC, useEffect, useRef, ReactNode, useState } from 'react';
import { ColDef, GridOptions, RowNode, ValueFormatterParams } from 'ag-grid-community';
import {
  SETTING_ID,
  SettingBaseModel,
  useVMSModuleSecurity,
  VENDOR_PRICING_COMPARISON_FILTERS,
  VendorLocationModel,
  
} from '../../../Shared';
import {
  UIStore,
  Utilities,
  DATE_FORMAT,
  GridPagination,
  IClasses,
  IAPIGridRequest,
  SearchStore,
  IAPIPageResponse,
} from '@wings-shared/core';
import {
  BaseStore,
  ServiceItemPricingStore,
  SettingsStore,
  VendorLocationStore,
  ApprovalChangesStore,
} from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { styles } from './ApprovalChanges.styles';
import { gridFilters } from '../../../VendorPricing/fields';
import { finalize, takeUntil } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { ISearchHeaderRef } from '@wings-shared/form-controls';
import { ServiceItemPricingModel } from '../../../Shared/Models/ServiceItemPricing.model';
import { Dialog } from '@uvgo-shared/dialog';
import {
  ChildGridWrapper,
  CollapsibleWithShowHideButton,
  ConfirmNavigate,
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
  AgGridViewRenderer,
} from '@wings-shared/custom-ag-grid';
import { PrimaryButton, SecondaryButton, TextButton } from '@uvgo-shared/buttons';
import { ApprovalChangesDataModel } from '../../../Shared/Models/ApprovalChanges.model';
import ApprovalStatus from '../../../Shared/Components/ApprovalStatus/ApprovalStatus';
import { VIEW_MODE } from '@wings/shared';
import { Typography, withStyles } from '@material-ui/core';
import classNames from 'classnames';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { APPROVAL_MERGE_STATUS } from '../../../Shared/Enums/Approvals.enum';

interface Props {
  serviceItemPricingStore: ServiceItemPricingStore;
  settingsStore: SettingsStore;
  classes?: IClasses;
  vendorLocationStore: VendorLocationStore;
  approvalChangesStore: ApprovalChangesStore;
  params?: { vendorId: number; id: number; viewMode: VIEW_MODE };
}

const ServicesPricingApprovalChanges: FC<Props> = ({
  serviceItemPricingStore,
  settingsStore,
  vendorLocationStore,
  approvalChangesStore,
  classes,
}) => {
  // const classes = useStyles();
  const _classes = classes as IClasses;
  const gridState = useGridState();
  const params = useParams();
  const agGrid = useAgGrid<VENDOR_PRICING_COMPARISON_FILTERS, ApprovalChangesDataModel>(gridFilters, gridState);
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const location = useLocation();
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const filtersApi = useGridFilters<VENDOR_PRICING_COMPARISON_FILTERS>(gridFilters, gridState);
  const navigate = useNavigate();
  const [ text, setText ] = useState('');

  const handleCommentTextbox = (event) => {
    const newText = event.target.value;
    setText(newText);
    const textLength = newText.length;
    approvalChangesStore.userCommentTextField = textLength >=6 ? false : true;
  };
  
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

  const columnDefs: ColDef[] = [
    {
      headerName: 'Version',
      minWidth: 160,
      field: 'version',
      sortable: false,
      filter: false,
      headerTooltip: 'Version',
    },
    {
      headerName: 'Service Item Name',
      minWidth: 160,
      field: 'serviceItem',
      cellEditor: 'customAutoComplete',
      sortable: false,
      filter: false,
      valueFormatter: ({ value }) => value?.name || '',
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
      cellRenderer: 'actionViewRenderer',
      valueFormatter: ({ value }) => value?.name || '',
      headerTooltip: 'Status',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, rowNode: RowNode) => statusViewRenderer(rowNode),
      },
    },
  ];

  const statusViewRenderer = (rowNode: RowNode) => {
    return <ApprovalStatus {...rowNode} fieldKey="approvalStatus" />;
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {},
      columnDefs,
      isEditable: vmsModuleSecurityV2.isEditable,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        getDisabledState: () => gridState.hasError || serviceItemPricingStore.isCommentFieldRequired,
      },
    });
    return {
      ...baseOptions,
      pagination: false,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      isExternalFilterPresent: () => false,
      suppressScrollOnNewData: true,
      suppressClickEdit: true,
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        filtersApi.onSortChanged(e);
        loadInitialData();
      },
      frameworkComponents: {
        actionRenderer: AgGridActions,
        customAutoComplete: AgGridAutoComplete,
        customCellEditor: AgGridCellEditor,
        actionViewRenderer: AgGridViewRenderer,
        customHeader: AgGridGroupHeader,
        checkBoxRenderer: AgGridCheckBox,
        customTimeEditor: AgGridDateTimePicker,
        customDateEditor: AgGridDateTimePicker,
      },
    };
  };

  const handleBackClick = () => {
    if (params.operationCode) {
      return navigate(
        `/vendor-management/vendor-location/${params.operationCode}/${params.vendorId}/${params.id}/${params.viewMode}/services-pricing`
      );
    }
    return navigate(
      `/vendor-management/vendor-location/upsert/${params.vendorId}/${params.id}/${params.viewMode}/services-pricing`
    );
  };

  const headerActions = (): ReactNode => {
    return (
      <>
        <div className="inner-header">
          <PrimaryButton size="small" variant="outlined" onClick={() => handleBackClick()}>
            Back
          </PrimaryButton>
        </div>
      </>
    );
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    settingsStore.getVendorSettingsStatus().subscribe();
    settingsStore.getSettings(SETTING_ID.SETTINGS_HANDLING_FEES).subscribe();
    settingsStore.getSettings(SETTING_ID.SETTINGS_PARAMETERS).subscribe();
    settingsStore.getSettings(SETTING_ID.SETTINGS_CURRENCY).subscribe();
    settingsStore.getSettings(SETTING_ID.SETTINGS_UNITS).subscribe();
    settingsStore.getSettings(SETTING_ID.SETTINGS_SERVICE_ITEM_NAME).subscribe();
    approvalChangesStore
      .getServiceItemPricingApprovalData(params.id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: IAPIPageResponse<ApprovalChangesDataModel>) => {
        UIStore.setPageLoader(false);
        gridState.setPagination(new GridPagination({ ...response }));        
        const transformedData = approvalChangesStore.approvalData.map(item => {
          let oldValue = null;
          let newValue = null;
          try {
            if (item.oldValue) {
              oldValue = JSON.parse(item.oldValue);
            }
            if (item.newValue) {
              newValue = JSON.parse(item.newValue);
            }
          } catch (error) {
            console.error('Error parsing JSON', error);
          }
          return {
            id: item.id,
            vendor: item.vendor,
            serviceItem: item.serviceItem,
            vendorLocation: item.vendorLocation,
            oldValue,
            newValue,
            comment: item.comment,
            approvalStatus: item.approvalStatus,
            serviceItemPricingId: item.serviceItemPricingId,
          };
        });
        gridState.setGridData(ApprovalChangesDataModel.deserializeList(transformedData));
        
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

  const approveApprovalChanges = (item: ApprovalChangesDataModel) => {
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    const request = new ApprovalChangesDataModel({
      ...item,
      oldValue: JSON.parse(item.oldValue),
      newValue: JSON.parse(item.newValue),
    });
    approvalChangesStore
      ?.approveChanges(request.serialize(item.id, APPROVAL_MERGE_STATUS.APPROVED_STATUS_ID))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: (response: ApprovalChangesDataModel) => {
          loadInitialData();
        },
        error: error => {
          BaseStore.showAlert(error.message, item.id);
        },
      });
  };

  const rejectApprovalChanges = (item: ApprovalChangesDataModel, userComment) => {
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    
    const request = new ApprovalChangesDataModel({
      ...item,
      id: item.id,
      userId: item.userId,
      approvalStatusId: 3,
      comment: userComment,
    });
    approvalChangesStore
      ?.approveChanges(request.serialize(item.id, APPROVAL_MERGE_STATUS.REJECTED_STATUS_ID))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: (response: ApprovalChangesDataModel) => {
          loadInitialData();
        },
        error: error => {
          BaseStore.showAlert(error.message, item.id);
        },
      });
  };

  const actionButtons = item => {
    return (
      <div className={_classes.panelActionButtons}>
        {item.approvalStatus.id !== 3 ? 
          <SecondaryButton
            variant="outlined"
            color="secondary"
            size="medium"
            onClick={()=>{rejectCommentModal(item)}}
            disabled={gridState.isProcessing || gridState.isRowEditing}
          >
            Reject
          </SecondaryButton>
          :
          ''
        }
        <PrimaryButton
          variant="contained"
          onClick={() => approveApprovalChanges(item)}
          disabled={gridState.isProcessing || gridState.isRowEditing}
        >
          Approve
        </PrimaryButton>
      </div>
    );
  };

  const rejectionContent = () => {
    return (
      <>
        <Typography variant="h6" component="p" style={{ fontSize:'16px' }}>
          Comment to vendor regarding why this entry was rejected
        </Typography>
        <textarea
          id="rejectionComment"
          name="rejectionComment"
          maxRows={2}
          aria-label="maximum height"
          placeholder="Enter here"
          className="userCommentArea"
          onChange={handleCommentTextbox}
          style={{
            width: '100%',
            minHeight: '40px',
            borderRadius: '5px',
            padding: '5px',
            resize: 'none',
            marginTop: '10px',
          }}
        ></textarea>
      </>
    );
  };

  const dialogAction = item => {
    return (
      <>
        <TextButton
          color="primary"
          onClick={() => {
            ModalStore.close();
          }}
        >
          Cancel
        </TextButton>
        <PrimaryButton
          variant="contained"
          color="primary"
          disabled={approvalChangesStore.userCommentTextField}
          onClick={() => {
            const elem = document.getElementById('rejectionComment');
            rejectApprovalChanges(item, elem.value);
            ModalStore.close();
            handleBackClick();
          }}
        >
          Confirm
        </PrimaryButton>
      </>
    );
  };

  const rejectCommentModal = item => {
    ModalStore.open(
      <>
        {approvalChangesStore.userCommentTextField = true}
        <Dialog
          title={'Reason for rejection'}
          open={true}
          onClose={() => {ModalStore.close()}}
          dialogContent={() => rejectionContent()}
          closeBtn={true}
          dialogActions={()=>dialogAction(item)}
          disableBackdropClick={true}
        />
      </>
    )
  }

  const detailEditorWrapperClasses = {
    root: classNames({
      [_classes.root]: true,
    }),
    headerActions: classNames({
      [_classes.headerActions]: true,
      [_classes.approvalchangesHeader]: true,
    }),
    container: classNames({
      [_classes.root]: true,
      [_classes.container]: true,
    }),
  };

  const extractValueData = (value, version, dataItem) => {
    if (!value) return null;

    const getSettingById = (settingName, id) => settingName.find(item => item.id === parseInt(id));

    const serviceItem = getSettingById(settingsStore.vendorSettingsServiceItemName,value.ServiceItemId);
    const handlingFee = getSettingById(settingsStore.vendorSettingsHandlingFee, value.HandlingFeeId);
    const parameter = getSettingById(settingsStore.vendorSettingsParameters, value.ParameterId);
    const currency = getSettingById(settingsStore.vendorSettingsCurrency, value.CurrencyId);
    const units = getSettingById(settingsStore.vendorSettingsUnits, value.UnitId);

    return ServiceItemPricingModel.deserialize({
      ...value,
      id: value.Id,
      serviceItem: SettingBaseModel.deserialize(serviceItem),
      comment: value.Comment,
      isCommissionable: value.IsCommissionable,
      isDirectService: value.IsDirectService,
      isVariablePricing: value.IsVariablePricing,
      thirdPartyVendorComment: value.ThirdPartyVendorComment,
      priceDataUnavailable: value.PriceDataUnavailable,
      lowerLimit: value.LowerLimit,
      upperLimit: value.UpperLimit,
      validFrom: value.ValidFrom,
      validTo: value.ValidTo,
      status: version === 'Old' ? value.status : dataItem.approvalStatus,
      handlingFee: SettingBaseModel.deserialize(handlingFee),
      parameter: SettingBaseModel.deserialize(parameter),
      currency: SettingBaseModel.deserialize(currency),
      uom: SettingBaseModel.deserialize(units),
      version,
    });
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <div className={_classes.approvalChangesWrapper}>
        <DetailsEditorWrapper headerActions={headerActions()} classes={detailEditorWrapperClasses}>
          <div className={_classes.editorWrapperContainer}>
            <div className={_classes.gridHeight}>
              {approvalChangesStore.approvalData.length === 0 ? (
                <div className={_classes.noRecordsFound}>No records for Approval Changes</div>
              ) : (
                approvalChangesStore.approvalData.map((item, indexKey) => {
                  const gridData = [];

                  const gridOldNewData = gridState.data[indexKey];
                  const oldValueData = extractValueData(gridOldNewData?.oldValue, 'Old', item);
                  const newValueData = extractValueData(gridOldNewData?.newValue, 'New', item);

                  if (oldValueData) gridData.push(oldValueData);
                  if (newValueData) gridData.push(newValueData);

                  return (
                    <div className="collapseExpandContainer">
                      <CollapsibleWithShowHideButton
                        key={item.serviceItem.id}
                        title={`${item.serviceItem.name}`}
                        buttonText=""
                        isButtonDisabled={gridState.isProcessing || gridState.isRowEditing}
                        onButtonClick={() => {}}
                        titleVariant="h6"
                        hasPermission={vmsModuleSecurityV2.isEditable}
                        actionButtons={actionButtons(item)}
                        titleChildren={
                          <span className="rejectedText">{item.approvalStatus.id === 3 ? 'Rejected' : ''}</span>
                        }
                      >
                        <>
                          <ChildGridWrapper hasAddPermission={false}>
                            <CustomAgGridReact
                              isRowEditing={gridState.isRowEditing}
                              rowData={gridData}
                              gridOptions={gridOptions()}
                              serverPagination={true}
                              hidePagination={true}
                              paginationData={gridState.pagination}
                              onPaginationChange={loadInitialData}
                              classes={{ customHeight: _classes.customHeight }}
                              disablePagination={gridState.isRowEditing || gridState.isProcessing}
                            />
                          </ChildGridWrapper>
                          {item.approvalStatus.id === 3 ? (
                            <div className="rejectionCommentWapper">
                              <Typography variant="h6" component="h6" color="error" className="commentTitle">
                                Reason for rejecting this entry
                              </Typography>
                              <Typography variant="h6" component="h6" className="userCommentMessage">
                                {item.comment}
                              </Typography>
                            </div>
                          ) : (
                            ''
                          )}
                        </>
                      </CollapsibleWithShowHideButton>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DetailsEditorWrapper>
      </div>
    </ConfirmNavigate>
  );
};
export default inject(
  'serviceItemPricingStore',
  'settingsStore',
  'vendorLocationStore',
  'approvalChangesStore'
)(withStyles(styles)(observer(ServicesPricingApprovalChanges)));

import {
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  SearchStore,
  UIStore,
  Utilities,
  ViewPermission,
} from '@wings-shared/core';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ISearchHeaderRef, SearchHeaderV2 } from '@wings-shared/form-controls';
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { SETTING_ID, useVMSModuleSecurity } from '../Shared';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import {
  AgGridActions,
  AgGridAutoComplete,
  AgGridCellEditor,
  AgGridGroupHeader,
  AgGridSelectControl,
  AgGridViewRenderer,
  CustomAgGridReact,
  agGridUtilities,
  useAgGrid,
  useGridState,
} from '@wings-shared/custom-ag-grid';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ApprovalsStore, BaseStore, SettingsStore, VendorManagementStore } from '../../Stores';
import { inject, observer } from 'mobx-react';
import { APPROVAL_MERGE_STATUS, APPROVALS_COMPARISON_FILTERS } from '../Shared/Enums/Approvals.enum';
import { finalize, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions, RowNode, RowEditingStartedEvent, ICellEditorParams } from 'ag-grid-community';
import { useUnsubscribe } from '@wings-shared/hooks';
import { getGridData, gridFilters } from './fields';
import { Grid, Tooltip, Typography, withStyles } from '@material-ui/core';
import { styles } from './Approvals.styles';
import { ApprovalModel } from '../Shared/Models/Approvals.model';
import { ApprovalDataModel } from '../Shared/Models/ApprovalData.model';
import { CancelOutlined, RemoveRedEyeOutlined } from '@material-ui/icons';
import ApprovalStatus from '../Shared/Components/ApprovalStatus/ApprovalStatus';
import { SETTING_NAME } from '../Shared/Enums/SettingNames.enum';
import { Dialog } from '@uvgo-shared/dialog';
import { AlertStore } from '@uvgo-shared/alert';
import { ConfirmDialog, SidebarStore } from '@wings-shared/layout';
import { useLocation } from 'react-router';
import { sidebarMenus } from '../Shared/Components/SidebarMenu/SidebarMenu';

type Props = {
  vendorManagementStore?: VendorManagementStore;
  settingsStore?: SettingsStore;
  approvalsStore?: ApprovalsStore;
  classes?: IClasses;
};

const Approvals: FC<Props> = ({ settingsStore, vendorManagementStore, classes, approvalsStore }) => {
  const searchHeaderRef = useRef<ISearchHeaderRef>();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const agGrid = useAgGrid<APPROVALS_COMPARISON_FILTERS, ApprovalDataModel>(gridFilters, gridState);
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const isStatusFilter = Utilities.isEqual(
    searchHeaderRef.current?.getSelectedOption('defaultOption'),
    APPROVALS_COMPARISON_FILTERS.APPROVAL_STATUS
  );
  const isTopUsageAirportFilter = Utilities.isEqual(
    searchHeaderRef.current?.getSelectedOption('defaultOption'),
    APPROVALS_COMPARISON_FILTERS.TOPUSAGEAIRPORT
  );
  const [ rejectionComment, setRejectionComment ] = useState('');
  const location = useLocation();

  const handleCommentTextbox = event => {
    const newText = event.target.value;
    setRejectionComment(newText);
    const textLength = newText.length;
    approvalsStore.userCommentTextField = textLength >= 6 ? false : true;
  };

  useEffect(() => {
    loadApprovalStatus();
    settingsStore?.getTrueAndFalseOption();
    loadInitialData();
    SidebarStore.setNavLinks(sidebarMenus, 'vendor-management');
  }, [ ]);

  const loadApprovalStatus = () => {
    settingsStore?.getSettings(SETTING_ID.SETTING_APPROVAL_STATUS, SETTING_NAME.APPROVAL_STATUS).subscribe();
  };

  const loadInitialData = (pageRequest?: IAPIGridRequest) => {
    
    const request: IAPIGridRequest = {
      pageNumber: approvalsStore?.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...searchCollection(),
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    UIStore.setPageLoader(true);
    approvalsStore
      ?.getApprovals(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse<ApprovalModel>) => {
        const gridData = getGridData(response.results, [ 1 ], false);
        gridState.setGridData(gridData);
        gridState.setPagination(new GridPagination({ ...response }));
        approvalsStore.pageNumber = gridState.pagination.pageNumber;
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const searchCollection = (): IAPIGridRequest | null => {
    const vendorData = approvalsStore?.vendorVendorLocationData;
    const searchHeader = searchHeaderRef.current;
    const chip = searchHeader?.getFilters().chipValue?.valueOf();
    if (!searchHeader) {
      return null;
    }
    const property = gridFilters.find(({ uiFilterType }) =>
      Utilities.isEqual(uiFilterType, searchHeader.selectedOption || 'Vendor')
    );
    if(approvalsStore?.vendorVendorLocationData){      
      searchHeaderRef.current.setSearchValue(approvalsStore.vendorVendorLocationData.name)
    } 
    
    const propertyValue =
      chip?.length > 0
        ? chip[0]?.id
        : searchHeader.searchValue
          ? searchHeader.searchValue
          : vendorData?.name
            ? vendorData?.name
            : '';

    if (propertyValue === '') {
      return null;
    }

    const filters = [
      {
        propertyName: property?.apiPropertyName,
        propertyValue: propertyValue,
      },
    ];

    return {
      filterCollection: JSON.stringify(filters),
    };
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Vendor',
      field: 'vendor.name',
      editable: false,
      headerTooltip: 'Vendor',
    },
    {
      headerName: 'VendorLocation',
      field: 'vendorLocation',
      editable: false,
      headerTooltip: 'Vendor Location',
      valueFormatter: ({ value }) => value?.label,
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
    },
    {
      headerName: 'Old Value',
      field: 'oldValue',
      editable: false,
      headerTooltip: 'Old Value',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => viewRenderer(node.data?.oldValue),
      },
    },
    {
      headerName: 'New Value',
      field: 'newValue',
      editable: false,
      headerTooltip: 'New Value',
      cellRenderer: 'viewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => viewRenderer(node.data?.newValue),
      },
    },
    {
      headerName: 'Status',
      field: 'status.name',
      editable: false,
      headerTooltip: 'Status',
      cellRenderer: 'actionViewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, rowNode: RowNode) => statusViewRenderer(rowNode),
      },
    },
    {
      headerName: 'Is Top Usage Airport',
      field: 'isTopUsageAirport',
      editable: false,
      headerTooltip: 'Is Top Usage Airport',
    },
    {
      headerName: 'Rank At Airport',
      field: 'airportRank',
      editable: false,
      sortable: false,
      headerTooltip: 'Airport Rank',
    },
    {
      headerName: 'Vendor Level',
      field: 'vendorLevel.name',
      editable: false,
      headerTooltip: 'Vendor Level',
      cellRenderer: 'actionViewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, rowNode: RowNode) => viewRenderer(rowNode.data?.vendorLevel?.name),
      },
    },
    {
      headerName: 'Comment',
      field: 'comment',
      editable: false,
      headerTooltip: 'Comment',
      cellRenderer: 'actionViewRenderer',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) => viewRenderer(node.data?.comment),
      },
    },
    ...agGrid.auditFields(gridState.isRowEditing),
    {
      headerName: 'Actions',
      field: 'actionRenderer',
      cellRenderer: 'actionViewRenderer',
      cellEditor: 'actionRenderer',
      maxWidth: 250,
      minWidth: 250,
      sortable: false,
      filter: false,
      suppressSizeToFit: true,
      suppressNavigable: true,
      hide: !vmsModuleSecurityV2.isEditable,
    },
  ];

  const viewRenderer = (value: string): ReactNode => {
    return ApprovalDataModel.displayValueFormatter(value);
  };

  const statusViewRenderer = (rowNode: RowNode) => {
    return <ApprovalStatus {...rowNode} fieldKey="status.name" />;
  };

  const mergeData = (data: ApprovalDataModel[]) => {
    const filterdata: ApprovalDataModel[] = data[0].fieldName
      ? data
      : approvalsStore?.approvalData
          .filter(item => item.entityName === data[0].entityName && item.vendorId === data[0].vendorId)
          .map(item => item.approvalDatas.filter(approvalData => approvalData.status.id === 1))[0];
    const flattenedData = filterdata.flat();
    if (flattenedData.length === 0) {
      return;
    }
    UIStore.setPageLoader(true);
    gridState.setIsProcessing(true);
    approvalsStore
      ?.mergeApproval(flattenedData[0].serialize(flattenedData, 2))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: (response: ApprovalDataModel) => {
          response = ApprovalDataModel.deserialize(response);
          ApprovalDataModel.updateStatus(gridState, agGrid, flattenedData, 2, 'Approved');
          loadInitialData({ pageNumber: approvalsStore.pageNumber });
          ModalStore.close();
        },
        error: error => {
          BaseStore.showAlert(error.message, filterdata[0].id.toString());
        },
      });
  };

  const cancelData = (data: ApprovalDataModel[], userComment) => {
    const filterdata: ApprovalDataModel[] = data[0].fieldName
      ? data
      : approvalsStore?.approvalData
          .filter(item => item.entityName === data[0].entityName && item.vendorId === data[0].vendorId)
          .map(item => item.approvalDatas.filter(approvalData => approvalData.status.id === 1))[0];
    const flattenedData = filterdata.flat();
    if (flattenedData.length === 0) {
      return;
    }
    const updatedData = flattenedData.map(item => {
      const updatedItem = ApprovalDataModel.deserialize(item);
      updatedItem.comment = userComment;
      return updatedItem;
    });
    gridState.setIsProcessing(true);
    UIStore.setPageLoader(true);
    approvalsStore
      ?.rejectApproval(updatedData[0].serialize(flattenedData, APPROVAL_MERGE_STATUS.REJECTED_STATUS_ID))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe({
        next: (response: ApprovalDataModel) => {
          response = ApprovalDataModel.deserialize(response);
          ApprovalDataModel.updateStatus(
            gridState,
            agGrid,
            flattenedData,
            APPROVAL_MERGE_STATUS.REJECTED_STATUS_ID,
            'Rejected'
          );
          loadInitialData({ pageNumber: approvalsStore.pageNumber });
          ModalStore.close();
        },
        error: error => {
          BaseStore.showAlert(error.message, filterdata[0].id.toString());
        },
      });
  };
  const getConfirmation = (data: ApprovalDataModel, isDialog: boolean): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Changes"
        message={'Are you sure you want to reject the changes?'}
        yesButton="Confirm"
        noButton="Go Back"
        onNoClick={() => {
          ModalStore.close();
          if (isDialog) {
            getApprovalsData([ data ]);
          }
        }}
        onYesClick={() => {
          cancelData([ data ]);
          ModalStore.close();
        }}
      />
    );
  };

  const rejectionContent = () => {
    return (
      <>
        <Typography variant="h6" component="p" style={{ fontSize: '16px' }}>
          Why do you want to reject the changes? (comment will go to vendor)
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

  const dialogAction = (data: ApprovalDataModel, isApproval) => {
    return (
      <>
        <PrimaryButton
          variant="outlined"
          color="primary"
          onClick={() => {
            ModalStore.close();
            if (isApproval) {
              getApprovalsData([ data ]);
            }
          }}
        >
          Go Back
        </PrimaryButton>
        <PrimaryButton
          variant="contained"
          color="primary"
          disabled={approvalsStore.userCommentTextField}
          onClick={() => {
            const elem = document.getElementById('rejectionComment');
            ConfirmationModel(data);
            cancelData([ data ], elem.value);
            ModalStore.close();
          }}
        >
          Confirm
        </PrimaryButton>
      </>
    );
  };

  const ConfirmationModel = (data: ApprovalDataModel, isApproval: boolean): void => {
    ModalStore.open(
      <>
        {(approvalsStore.userCommentTextField = true)}
        <Dialog
          title={'Reason for rejection'}
          open={true}
          onClose={() => {
            ModalStore.close();
          }}
          dialogContent={() => rejectionContent()}
          closeBtn={true}
          dialogActions={() => dialogAction(data, isApproval)}
          disableBackdropClick={true}
        />
      </>
    );
  };

  const getApprovalsData = (data: ApprovalDataModel[]) => {
    UIStore.setPageLoader(true);
    approvalsStore
      ?.approvelGetInfo(data[0].id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: response => {
          ModalStore.open(
            <Dialog
              title={'Approval Workflow'}
              open={true}
              onClose={() => ModalStore.close()}
              dialogContent={() => dialogContent(response)}
              disableBackdropClick={true}
            />
          );
        },
        error: error => {
          AlertStore.info(`No records found ${error.message}`);
        },
      });
  };
  const viewApprovalWorkFlow = (data: ApprovalDataModel[]) => {
    getApprovalsData(data);
  };

  const dialogContent = data => {
    const newParsedData = JSON.parse(data.newValue);
    const oldParsedData = JSON.parse(data.oldValue);
    const hideButtons =
      data.statusId === APPROVAL_MERGE_STATUS.MERGED ||
      data.statusId === APPROVAL_MERGE_STATUS.REJECTED_STATUS_ID ||
      data.statusId === APPROVAL_MERGE_STATUS.COMPLETED
        ? true
        : false;
    return (
      <>
        <div className={classes.modalDetail}>
          <Grid container>
            <Grid item xs={6}>
              <strong>Old Value</strong>
            </Grid>
            <Grid item xs={6}>
              <strong>New Value</strong>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={6}>
              {oldParsedData.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </Grid>
            <Grid item xs={6}>
              {newParsedData.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </Grid>
          </Grid>

          <Grid container justify="flex-end">
            {
              <ViewPermission hasPermission={!hideButtons && vmsModuleSecurityV2.isEditable}>
                <PrimaryButton variant="outlined" color="primary" onClick={() => mergeData([ data ])}>
                  <Tooltip title="Merge">
                    <CheckOutlinedIcon className={classes.icons} />
                  </Tooltip>
                </PrimaryButton>

                <PrimaryButton variant="outlined" color="primary" onClick={() => ConfirmationModel(data, true)}>
                  <Tooltip title="Reject">
                    <CancelOutlined className={classes.icons} />
                  </Tooltip>
                </PrimaryButton>
              </ViewPermission>
            }
          </Grid>
        </div>
      </>
    );
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: {
        onDropDownChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
        onInputChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
        onOptionChange: (params: ICellEditorParams, value: string) => {
          gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
        },
      },
      columnDefs: columnDefs,
      isEditable: vmsModuleSecurityV2.isEditable,
      gridActionProps: {
        getDisabledState: () => gridState.hasError,
        getEditableState: () => gridState.isRowEditing,
        getViewRenderer: (rowIndex: number, { data }: RowNode) => {
          const hideButtons =
            (data.status.id === APPROVAL_MERGE_STATUS.MERGED ||
              data.status.id === APPROVAL_MERGE_STATUS.REJECTED_STATUS_ID ||
              data.status.id === APPROVAL_MERGE_STATUS.COMPLETED) &&
            !data.isListField
              ? true
              : false;
          return (
            <>
              {data.isListField ? (
                <ViewPermission hasPermission={data.isListField}>
                  <PrimaryButton variant="outlined" color="primary" onClick={() => viewApprovalWorkFlow([ data ])}>
                    <Tooltip title="Approval Workflow">
                      <RemoveRedEyeOutlined className={classes.icons} />
                    </Tooltip>
                  </PrimaryButton>
                </ViewPermission>
              ) : (
                <ViewPermission hasPermission={!hideButtons && vmsModuleSecurityV2.isEditable}>
                  <PrimaryButton variant="outlined" color="primary" onClick={() => mergeData([ data ])}>
                    <Tooltip title="Merge">
                      <CheckOutlinedIcon className={classes.icons} />
                    </Tooltip>
                  </PrimaryButton>

                  <PrimaryButton variant="outlined" color="primary" onClick={() => ConfirmationModel(data, false)}>
                    <Tooltip title="Reject">
                      <CancelOutlined className={classes.icons} />
                    </Tooltip>
                  </PrimaryButton>
                </ViewPermission>
              )}
            </>
          );
        },

        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          if (action === GRID_ACTIONS.SAVE) {
            gridState.gridApi.stopEditing();
            // const request = getEditRequestData(rowIndex);
            // callSaveChangesApi(request);
            return;
          }
          gridState.gridApi.stopEditing(true);
        },
      },
    });

    return {
      ...baseOptions,
      rowSelection: 'multiple',
      pagination: false,

      suppressClickEdit: true,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      suppressScrollOnNewData: true,
      rowHeight: 40,
      suppressScrollOnNewData: true,
      defaultColDef: {
        ...baseOptions.defaultColDef,
        suppressMovable: true,
        sortable: false,
        cellEditor: '',
      },
      frameworkComponents: {
        customHeader: AgGridGroupHeader,
        customAutoComplete: AgGridAutoComplete,
        actionViewRenderer: AgGridViewRenderer,
        viewRenderer: AgGridViewRenderer,
        actionRenderer: AgGridActions,
        customCellEditor: AgGridCellEditor,
        customSelect: AgGridSelectControl,
      },
      onRowEditingStarted: (params: RowEditingStartedEvent) => {
        agGrid.onRowEditingStarted(params);
      },
      onRowEditingStopped: event => {
        agGrid.onRowEditingStopped();
        agGrid.reloadColumnState();
      },
      onCellFocused: ({ rowIndex }) => gridState.setClickedRowIndex(rowIndex as number),

      groupDefaultExpanded: -1,
      getDataPath: data => data.path,
      treeData: true,
      autoGroupColumnDef: {
        headerName: 'Name (Table / Property)',
        field: 'entityAndFeildName',
        cellRenderer: 'agGroupCellRenderer',
        sortable: false,
        minWidth: 170,
        editable: false,
        headerTooltip: 'Name (Table / Property)',
        valueFormatter: ({ data }) => data?.entityAndFeildName || '',
        cellRendererParams: {
          suppressCount: true,
          checkbox: ({ data }) => false,
        },
      },
      onFilterChanged: () => loadInitialData({ pageNumber: 1 }),
      onSortChanged: e => {
        agGrid.filtersApi.onSortChanged(e);
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
            APPROVALS_COMPARISON_FILTERS,
            APPROVALS_COMPARISON_FILTERS.VENDOR,
            'defaultOption'
          ),
        ]}
        onClear={()=>{
          approvalsStore.vendorVendorLocationData = '';
          loadInitialData();
        }}
        onResetFilterClick={() => {
          agGrid.cancelEditing(0);
          agGrid.filtersApi.resetColumnFilters();
        }}
        onFilterChange={isInitEvent => {
          approvalsStore.vendorVendorLocationData = '';
          loadInitialData({ pageNumber: isInitEvent ? gridState.pagination.pageNumber : 1 });
          agGrid.cancelEditing(0);
          // loadInitialData({ pageNumber: 1 });
        }}
        isChipInputControl={isStatusFilter || isTopUsageAirportFilter}
        chipInputProps={{
          options: isStatusFilter
            ? settingsStore?.approvalStatus
            : isTopUsageAirportFilter
              ? settingsStore?.trueAndFalseOption
              : [],
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
      />
    </>
  );
};

export default inject(
  'vendorManagementStore',
  'settingsStore',
  'approvalsStore'
)(withStyles(styles)(observer(Approvals)));

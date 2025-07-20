import {
  GRID_ACTIONS,
  GridPagination,
  IAPIGridRequest,
  IAPIPageResponse,
  IClasses,
  SelectOption,
  UIStore,
  Utilities,
  cellStyle,
  regex,
} from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import {
  BaseStore,
  SettingsStore,
  VendorLocationStore,
  VendorManagementStore,
  VendorUserStore,
} from '../../../../Stores';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { Chip, Tooltip, withStyles } from '@material-ui/core';
import { VIEW_MODE } from '@wings/shared';
import { useStyles } from './VendorUser.style';
import { AgGridMasterDetails, CustomAgGridReact, useAgGrid, useGridState } from '@wings-shared/custom-ag-grid';
import {
  SETTING_ID,
  SettingBaseModel,
  StatusBaseModel,
  useVMSModuleSecurity,
  VENDOR_LOCATION_COMPARISON_FILTERS,
  VENDOR_USER_FILTERS,
  VendorLocationModel,
  VendorManagmentModel,
  
} from '../../../Shared';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { IAPIVMSVendorLocationComparison } from '../../../Shared/Interfaces';
import { ColDef, GridOptions, RowNode, ValueGetterParams, ICellEditorParams } from 'ag-grid-community';
import { ConfirmDialog, ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { VendorUserModel } from '../../../Shared/Models/VendorUser.model';
import { gridVendorUser } from '../../fields';
import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { UserGroupModel } from '@wings/user-management/src/Modules';
import { UserModel } from '../../../Shared/Models/User.model';

interface Props {
  classes: IClasses;
  settingsStore?: SettingsStore;
  vendorLocationStore?: VendorLocationStore;
  vendorManagementStore: VendorManagementStore;
  vendorUserStore: VendorUserStore;
  navigate: NavigateFunction;
  params?: { vendorId: number; vendorName: string; vendorCode: string };
  viewMode: VIEW_MODE;
  vendorData: VendorManagmentModel;
}

const env = new EnvironmentVarsStore();
const VendorUser: FC<Props> = ({
  settingsStore,
  vendorLocationStore,
  viewMode,
  vendorManagementStore,
  vendorData,
  vendorUserStore,
}) => {
  const params = useParams();
  const gridState = useGridState();
  const agGrid = useAgGrid<VENDOR_USER_FILTERS, VendorUserModel>(gridVendorUser, gridState);
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const [ selectedVendor, setSelectedVendor ] = useState(new VendorManagmentModel());
  const [ locationList, setLocationList ] = useState<VendorLocationModel[]>([]);

  const navigate = useNavigate();
  useEffect(() => {
    loadUplinkGroups();
    loadVendorData();
    loadVendorLocationData('');
  }, []);

  const classes = useStyles();

  function viewRenderer(
    vendorUserLocationChips: VendorLocationModel[],
    getTagProps?: AutocompleteGetTagProps,
    isReadMode?: boolean
  ): ReactNode {
    const numTags = vendorUserLocationChips.length;
    const limitTags = 1;
    const chipsList = isReadMode ? vendorUserLocationChips : [ ...vendorUserLocationChips ].slice(0, limitTags);
    return (
      <div>
        {Utilities.customArraySort(chipsList, 'label').map((vendorUserLocation: VendorLocationModel, index) => (
          <Tooltip title={vendorUserLocation ? vendorUserLocation.label : ''} key={index}>
            <Chip
              color="primary"
              key={vendorUserLocation?.id}
              label={vendorUserLocation ? vendorUserLocation.label : ''}
              {...(getTagProps instanceof Function ? getTagProps({ index }) : {})}
            />
          </Tooltip>
        ))}
        {numTags > limitTags && !isReadMode && ` +${numTags - limitTags} more`}
      </div>
    );
  }

  const loadUplinkGroups = () => {
    loadVendorUserData();
  };

  const userRoleOptions = [
    new SettingBaseModel({
      id: env.getVar(ENVIRONMENT_VARS.corporateauthorizedagent),
      name: 'Corporate Authorized Agent',
    }),
    new SettingBaseModel({
      id: env.getVar(ENVIRONMENT_VARS.informationambassador),
      name: 'Information Ambassador',
    }),
  ];

  const getFormattedRole = (name: string) => {
    if (name === 'app.uplink.corporateauthorizedagent') return 'Corporate Authorized Agent';
    else if (name === 'app.uplink.informationambassador') return 'Information Ambassador';
    return '';
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Email Address',
      minWidth: 200,
      field: 'email',
      headerTooltip: 'Email Address',
      cellEditorParams: {
        placeHolder: 'Email Address',
        rules: `required|regex:${regex.email}`,
        getDisableState: (node: RowNode) => true,
      },
    },
    {
      headerName: 'First Name',
      minWidth: 200,
      field: 'givenName',
      headerTooltip: 'First Name',
      cellEditorParams: {
        placeHolder: 'First Name',
        rules: 'required|string|between:0,200',
      },
    },
    {
      headerName: 'Last Name',
      minWidth: 200,
      field: 'surName',
      headerTooltip: 'Last Name',
      cellEditorParams: {
        placeHolder: 'Last Name',
        rules: 'required|string|between:0,200',
      },
    },
    {
      headerName: 'Phone',
      minWidth: 200,
      field: 'phoneNo',
      headerTooltip: 'Phone',
      cellEditorParams: {
        placeHolder: 'Phone',
        rules: `between:7,20|regex:${regex.phoneNumberWithHyphen}`,
      },
    },
    {
      headerName: 'SMS Opt In',
      minWidth: 100,
      field: 'isOptedSms',
      cellRenderer: 'checkBoxRenderer',
      cellEditor: 'checkBoxRenderer',
      headerTooltip: 'SMS Opt In',
      cellRendererParams: {
        readOnly: true,
      },
      cellEditorParams: {
        readOnly: true,
      }
    },
    {
      headerName: 'Status',
      minWidth: 200,
      field: 'status',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => value?.name || '',
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Status',
      cellEditorParams: {
        getAutoCompleteOptions: () => settingsStore?.status,
        valueGetter: (option: SelectOption) => option.value,
        placeHolder: 'Status',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'Role',
      minWidth: 200,
      field: 'userRole',
      cellEditor: 'customAutoComplete',
      valueFormatter: ({ value }) => groupValueFormatter(value),
      comparator: (current, next) => Utilities.customComparator(current, next, 'name'),
      headerTooltip: 'Role',
      cellEditorParams: {
        getAutoCompleteOptions: () => vendorUserStore.uplinkOktaGroups,
        valueGetter: (option: SelectOption) => option.name,
        placeHolder: 'Role',
        ignoreNumber: true,
        isRequired: true,
      },
    },
    {
      headerName: 'Location',
      minWidth: 330,
      field: 'vendorUserLocation',
      cellEditor: 'customAutoComplete',
      cellRenderer: 'viewRenderer',
      sortable: false,
      filter: false,
      filterValueGetter: ({ data }: ValueGetterParams) => data.vendorUserLocation,
      headerTooltip: 'User Location',
      cellRendererParams: {
        getViewRenderer: (rowIndex: number, node: RowNode, classes: IClasses) =>
          viewRenderer(node.data?.vendorUserLocation, null, true),
      },
      cellEditorParams: {
        placeHolder: 'User Location',
        multiSelect: true,
        multiple: true,
        disableCloseOnSelect: true,
        valueGetter: (selectedOptions: StatusBaseModel[]) => selectedOptions,
        // onSearch: (value: string) => loadVendorLocationData(value),
        renderTags: (values: StatusBaseModel[], getTagProps: AutocompleteGetTagProps) =>
          viewRenderer(values, getTagProps),
        getAutoCompleteOptions: () =>
          vendorLocationStore.getOperationalEssentialSettingOptions<VendorLocationModel>(
            vendorLocationStore?.vendorLocationList,
            'vendorLocation'
          ),
      },
    },
    {
      field: 'actionRenderer',
      suppressNavigable: true,
      headerName: '',
      cellRenderer: 'actionRenderer',
      cellEditor: 'actionRenderer',
      suppressMenu: true,
      suppressMovable: true,
      suppressSizeToFit: true,
      minWidth: 150,
      maxWidth: 150,
      cellStyle: { ...cellStyle() },
    },
  ];

  const groupValueFormatter = (group: UserGroupModel) => {
    if (group.name) return group?.name;
    else return '';
  };

  const addUserRow = (): void => {
    navigate(`/vendor-management/upsert/${params.vendorId}/${params.vendorCode}/edit/vendor-email/upsert/new/`);
  };

  const loadVendorUserData = (pageRequest?: IAPIGridRequest) => {
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
      ...agGrid.filtersApi.gridSortFilters(),
      ...pageRequest,
    };
    forkJoin([
      vendorUserStore.getVendorUser(request),
      settingsStore?.getVendorUserStatus(),
      vendorUserStore.loadUplinkOktaGroups(),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
          gridState.setIsProcessing(false);
        })
      )
      .subscribe((response: [IAPIPageResponse<IAPIVMSVendorLocationComparison>, StatusBaseModel[]]) => {
        gridState.setPagination(new GridPagination({ ...response[0] }));
        response[0]?.results.forEach(u => {
          u.userRole = u.userRole.mapExistingUserGroups(vendorUserStore.uplinkOktaGroups);
        });
        gridState.setGridData(response[0]?.results);
        const allowSelectAll = response[0]?.totalNumberOfRecords <= response[0].pageSize;
        gridState.setAllowSelectAll(allowSelectAll);
        agGrid.reloadColumnState();
        agGrid.refreshSelectionState();
      });
  };

  const loadVendorLocationData = (searchValue: string) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      ...searchCollection(searchValue),
      filterCollection: JSON.stringify([
        {
          propertyName: 'Vendor.Id',
          propertyValue: params.vendorId,
        },
      ]),
    };
    vendorLocationStore?.getVMSComparison(request).subscribe(response => {
      setLocationList(VendorLocationModel.deserializeList(response.results));
    });
  };

  const loadVendorData = () => {
    UIStore.setPageLoader(true);
    vendorManagementStore
      ?.getVendorById(parseInt(params.vendorId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorManagmentModel) => {
        setSelectedVendor(response);
      });
  };

  const onInputChange = (colDef: ICellEditorParams, value): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.setHasError(Utilities.hasInvalidRowData(gridState.gridApi));
  };

  const onDropDownChange = (colDef: ICellEditorParams, value): void => {
    gridState.setIsAllRowsSelected(true);
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const saveRowData = (rowIndex: number) => {
    findExistingEmail(rowIndex);
    // updateOktaGroup(rowIndex);
  };

  const removeUnsavedRow = (rowIndex: number) => {
    agGrid.cancelEditing(rowIndex);
    agGrid.filtersApi.resetColumnFilters();
  };

  const searchCollection = (propertyValue: string): IAPIGridRequest | null => {
    if (propertyValue === '') {
      return null;
    }
    const filters = [
      {
        propertyName: 'Name',
        propertyValue: propertyValue,
      },
      {
        propertyName: 'AirportReference.AirportName',
        propertyValue: propertyValue,
        filterType: 'string',
        operator: 'or',
      },
      {
        propertyName: 'AirportReference.ICAOCode',
        propertyValue: propertyValue,
        filterType: 'string',
        operator: 'or',
      },
      {
        propertyName: 'AirportReference.IATACode',
        propertyValue: propertyValue,
        filterType: 'string',
        operator: 'or',
      },
      {
        propertyName: 'AirportReference.FAACode',
        propertyValue: propertyValue,
        filterType: 'string',
        operator: 'or',
      },
      {
        propertyName: 'AirportReference.RegionalCode',
        propertyValue: propertyValue,
        filterType: 'string',
        operator: 'or',
      },
      {
        propertyName: 'AirportReference.DisplayCode',
        propertyValue: propertyValue,
        filterType: 'string',
        operator: 'or',
      },
      {
        propertyName: 'AirportReference.UWACode',
        propertyValue: propertyValue,
        filterType: 'string',
        operator: 'or',
      },
    ];
    return {
      searchCollection: JSON.stringify(filters),
    };
  };

  const gridOptions = (): GridOptions => {
    const baseOptions: Partial<GridOptions> = agGrid.gridOptionsBase({
      context: { onInputChange, onDropDownChange },
      columnDefs,
      isEditable: true,
      gridActionProps: {
        isActionMenu: vmsModuleSecurityV2.isEditable,
        showDeleteButton: false,
        getEditableState: ({ data }: RowNode) => {
          return !Boolean(data.id);
        },
        actionMenus: () => [
          {
            title: 'Edit',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.EDIT,
          },
          {
            title: 'Send Email',
            isHidden: !vmsModuleSecurityV2.isEditable,
            action: GRID_ACTIONS.SENDVERIFICATIONEMAIL,
          },
        ],
        getDisabledState: () => gridState.hasError,
        onAction: (action: GRID_ACTIONS, rowIndex: number) => {
          switch (action) {
            case GRID_ACTIONS.EDIT:
              const data = agGrid._getTableItem(rowIndex);
              gridState.gridApi.updateRowData({
                addIndex: rowIndex,
                update: [ data ],
              });
              agGrid._startEditingCell(rowIndex, 'givenName');
              break;
            case GRID_ACTIONS.SAVE:
              saveRowData(rowIndex);
              break;
            case GRID_ACTIONS.SENDVERIFICATIONEMAIL:
              generateTempPass(rowIndex);
              break;
            case GRID_ACTIONS.CANCEL:
              getConfirmation(rowIndex);
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
      onFilterChanged: () => loadVendorUserData({ pageNumber: 1 }),
    };
  };

  const findExistingEmail = (rowIndex: number): void => {
    const model = agGrid._getTableItem(rowIndex);
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      searchCollection: JSON.stringify([
        {
          propertyName: 'email',
          propertyValue: model.email,
        },
      ]),
    };
    UIStore.setPageLoader(true);
    vendorUserStore
      .getOktaUserData(request, model.email)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        (response: any) => {
          if (response.results.length > 0) {
            updateOktaGroup(rowIndex, response.results[0].userId);
          }
        },
        error => {
          if (error.response?.data.IsSuccess === false) {
            return BaseStore.showAlert(error.response?.data.Summary, '0');
          } else BaseStore.showAlert(error.message, '0');
        }
      );
  };

  const updateOktaGroup = (rowIndex, oktaUserId) => {
    const model = agGrid._getTableItem(rowIndex);
    const selectedUserGroup: UserGroupModel = model.userRole;
    const ids: string[] = [ selectedUserGroup.id ];

    UIStore.setPageLoader(true);
    const request = new UserModel();
    vendorUserStore
      .updateOktaGroup(request.serialize(model, ids, oktaUserId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        () => {
          updateUser(rowIndex, oktaUserId);
        },
        error => {
          if (error.response?.data.IsSuccess === false) {
            return BaseStore.showAlert(error.response?.data.Summary, model.id);
          } else BaseStore.showAlert(error.message, model.id);
        }
      );
  };

  const updateUser = (rowIndex, oktaUserId) => {
    gridState.gridApi.stopEditing();
    const model = agGrid._getTableItem(rowIndex);
    const selectedUserGroup: UserGroupModel = model.userRole;
    const ids: string[] = [ selectedUserGroup.id ];
    UIStore.setPageLoader(true);
    const request = new UserModel();
    forkJoin([
      vendorManagementStore.updateOktaUser(request.serialize(model, ids, oktaUserId)),
      vendorUserStore?.upsertVendorUser(
        model.serialize(model.id, params.vendorId, model.userRole.name, model.oktaUserId)
      ),
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        response => {
          response[1].userRole = response[1].userRole.mapExistingUserGroups(vendorUserStore.uplinkOktaGroups);
          agGrid._updateTableItem(rowIndex, response[1]);
        },
        error => {
          if (error.response?.data.IsSuccess === false) {
            return BaseStore.showAlert(error.response?.data.Summary, model.id);
          } else {
            agGrid._startEditingCell(rowIndex, 'givenName');
            BaseStore.showAlert(error.message, model.id);
          }
        }
      );
  };

  const generateTempPass = rowIndex => {
    const model = agGrid._getTableItem(rowIndex);
    UIStore.setPageLoader(true);
    vendorUserStore
      .generateTempPassword(model.oktaUserId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {})
      )
      .subscribe(
        response => {
          sendNewEmail(rowIndex, response);
        },
        error => {
          UIStore.setPageLoader(false);
          if (error.response?.data.IsSuccess === false) {
            return BaseStore.showAlert(error.response?.data.Summary, model.id);
          } else BaseStore.showAlert(error.message, model.id);
        }
      );
  };

  const sendNewEmail = (rowIndex, tempPassword): void => {
    const model = agGrid._getTableItem(rowIndex);
    vendorManagementStore
      .sendNewEmail(model, tempPassword, params?.vendorId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        () => {
          AlertStore.info(`Email link has been sent successfully to ${model.email}.`);
        },
        error => {
          if (error.response?.data.IsSuccess === false) {
            return BaseStore.showAlert(error.response?.data.Summary, model.id);
          } else BaseStore.showAlert(error.message, model.id);
        }
      );
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={selectedVendor?.label} />}
        backNavTitle="Vendors"
        hideActionButtons={false}
        backNavLink="/vendor-management"
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
            removeUnsavedRow(rowIndex);
          }}
        />
      );
    } else {
      removeUnsavedRow(rowIndex);
    }
  };

  return (
    <ConfirmNavigate isBlocker={gridState.isRowEditing}>
      <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
        <div className={classes.editorWrapperContainer}>
          <AgGridMasterDetails
            addButtonTitle="Add User"
            onAddButtonClick={() => addUserRow()}
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
              onPaginationChange={loadVendorUserData}
              classes={{ customHeight: classes.customHeight }}
              disablePagination={gridState.isRowEditing || gridState.isProcessing}
            />
          </AgGridMasterDetails>
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'settingsStore',
  'vendorLocationStore',
  'vendorManagementStore',
  'vendorUserStore'
)(observer(VendorUser));

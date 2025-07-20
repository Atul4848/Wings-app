import {
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPISearchFiltersDictionary,
  IOptionValue,
  UIStore,
  Utilities,
} from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { SettingsStore, VendorLocationStore, VendorManagementStore, VendorUserStore } from '../../../../Stores';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { useStyles } from '../UpsertVendor.styles';
import { VENDOR_USER_TYPE_ENUM, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useGridState } from '@wings-shared/custom-ag-grid';
import {
  SettingBaseModel,
  StatusBaseModel,
  useVMSModuleSecurity,
  VendorLocationModel,
  VendorManagmentModel,
  
} from '../../../Shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { addUserFields } from './Fields';
import ViewInputControls from '../../../Shared/Components/ViewInputControls/ViewInputControls';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmNavigate, ConfirmDialog } from '@wings-shared/layout';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { VendorUserModel, OperationInfoSettingOptionModel, UserModel } from '../../../Shared/Models';
import { UserGroupModel } from '@wings/user-management/src/Modules';
import UserEmailType from './Components/UserEmailType';
import UserGroupNameType from './Components/UserGroupNameType';
import { VENDOR_USER_DATA } from '../../../Shared/Constants';

interface Props {
  settingsStore: SettingsStore;
  vendorManagementStore: VendorManagementStore;
  searchFilters: IAPISearchFiltersDictionary;
  vendorLocationStore: VendorLocationStore;
  vendorUserStore: VendorUserStore;
  navigate: NavigateFunction;
  setSelectedVendor: React.Dispatch<React.SetStateAction<VendorManagmentModel>>;
  params?: { vendorId: string; vendorName: string; vendorUserId: number };
}

const UpsertVendorUser: FC<Props> = ({
  settingsStore,
  vendorManagementStore,
  vendorLocationStore,
  vendorUserStore,
  searchFilters,
  setSelectedVendor,
}) => {
  const params = useParams();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const classes = useStyles();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const useUpsert = useBaseUpsertComponent<VendorUserModel>(params, addUserFields, searchFilters);
  const formRef = useUpsert.form;
  const navigate = useNavigate();
  const isEditable = useUpsert.isEditable && vmsModuleSecurityV2.isEditable;
  const [ vendorUserRole, setVendorUserRole ] = useState<UserGroupModel[]>([]);
  const [ userStatus, setUserStatus ] = useState<SettingBaseModel[]>([]);

  useEffect(() => {
    useUpsert.setViewMode((params?.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    loadLocationData();
    loadUplinkGroups();
    vendorUserStore.vendorUserData.emailType = VENDOR_USER_TYPE_ENUM.INDIVIDUAL;
  }, []);

  useEffect(() => {
    populateVendorUserData();
  }, [ vendorUserStore.vendorOktaUser, vendorUserStore.vendorUserData.email, vendorUserStore.vendorUserData.phoneNo ]);

  const populateVendorUserData = () => {
    const vendorUser = vendorUserStore.vendorOktaUser?.[0];
    vendorUser
      ? setFormValue(vendorUser)
      : useUpsert.clearFormFields([
        'givenName', 
        'surName', 
        'email', 
        'username', 
        'phoneNo'
      ]);
    useUpsert.getField('email').set(vendorUserStore.vendorUserData.email || '');
    useUpsert.getField('phoneNo').set(vendorUserStore.vendorUserData.phoneNo || '');
    useUpsert.getField('username').set(vendorUserStore.vendorUserData.username || '');
  };

  const loadLocationData = (pageRequest?: IAPIGridRequest) => {
    const request: IAPIGridRequest = {
      pageNumber: gridState.pagination.pageNumber,
      pageSize: gridState.pagination.pageSize,
      filterCollection: JSON.stringify([
        {
          propertyName: 'Vendor.Id',
          propertyValue: params.vendorId,
        },
      ]),
    };
    vendorLocationStore?.getVMSComparison(request).subscribe();
  };

  const loadUplinkGroups = () => {
    vendorUserStore.loadUplinkOktaGroups().subscribe(response => {
      setVendorUserRole(response.results);
    });
    settingsStore.getVendorUserStatus().subscribe(response => {
      setUserStatus(response);
    });
  };
  const title = (): string => {
    return 'Add New User';
  };

  const groupInputControlsUser = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'id',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'username',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
            isHidden: vendorUserStore.vendorUserData.emailType == VENDOR_USER_TYPE_ENUM.INDIVIDUAL,
          },
          {
            fieldKey: 'phoneNo',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
            isHidden: vendorUserStore.vendorUserData.emailType == VENDOR_USER_TYPE_ENUM.INDIVIDUAL,
          },
          {
            fieldKey: 'email',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
          },
          {
            fieldKey: 'givenName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'surName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'userRole',
            type: EDITOR_TYPES.DROPDOWN,
            options: vendorUserRole,
          },
          {
            fieldKey: 'vendorUserLocation',
            type: EDITOR_TYPES.DROPDOWN,
            options: vendorLocationStore.getOperationalEssentialSettingOptions<VendorLocationModel>(
              vendorLocationStore.vendorLocationList,
              'vendorLocation'
            ),
            multiple: true,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: StatusBaseModel.deserializeList(userStatus),
          },
          {
            fieldKey: 'userId',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
        ],
      },
    ];
  };

  const setFormValue = response => {
    response = VendorUserModel.deserialize(response);
    useUpsert.setFormValues(response);
    useUpsert.getField('givenName').set(response.firstName);
    useUpsert.getField('surName').set(response.lastName);
    useUpsert.getField('userId').set(response.userId);
    response?.phoneNo && useUpsert.getField('phoneNo').set(response?.phoneNo);
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={title()} />}
        backNavTitle="Vendors"
        hideActionButtons={false}
        disableActions={!formRef.changed || !formRef.isValid || formRef.hasError}
        backNavLink="/vendor-management"
        isEditMode={isEditable}
        hasEditPermission={vmsModuleSecurityV2.isEditable}
        onAction={action => onAction(action)}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'userRole':
        const filteredList = vendorUserStore.uplinkOktaGroups.filter(item => {
          return item?.name.toLowerCase().includes(searchValue.toLowerCase());
        });
        setVendorUserRole(filteredList);
        break;
      case 'vendorUserLocation':
        const locationRequest: IAPIGridRequest = {
          searchCollection: JSON.stringify(Utilities.getFilter('Name', searchValue)),
          filterCollection: JSON.stringify(Utilities.getFilter('Vendor.Id', params.vendorId)),
        };
        vendorLocationStore?.getVMSComparison(locationRequest).subscribe();
        break;
      case 'status':
        const filteredUserStatus = settingsStore?.status.filter(item => {
          return item.name?.toLowerCase().includes(searchValue.toLowerCase());
        });
        setUserStatus(filteredUserStatus);
        break;
      default:
        break;
    }
    return;
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        navigate(`/vendor-management/upsert/${params.vendorId}/${params.vendorCode}/edit/vendor-email/upsert/new/`);
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        saveUserData();
        break;
      default:
        getConfirmation();
        break;
    }
  };

  const saveUserData = () => {
    if (vendorUserStore.vendorOktaUser?.length) {
      generateTempPass();
    } else {
      upsertOktaUser();
    }
  };

  const upsertOktaUser = () => {
    const selectedUserGroup: UserGroupModel = useUpsert.getField('userRole').value;
    const userId: string = useUpsert.getField('userId').value;
    UIStore.setPageLoader(true);
    const request = new UserModel();
    vendorManagementStore
      .createNewUser(request.serialize(useUpsert.form.values(), selectedUserGroup.id, userId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        response => {
          upsertNewVendorUser(response?.TempPassword);
        },
        error => {
          if (error.response?.data.IsSuccess === false) {
            return useUpsert.showAlert(error.response?.data.Summary, '0');
          } else useUpsert.showAlert(error.message, '0');
        }
      );
  };

  const generateTempPass = () => {
    UIStore.setPageLoader(true);
    vendorUserStore
      .generateTempPassword(useUpsert.form.values().userId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {})
      )
      .subscribe(
        response => {
          updateOktaGroup(response);
        },
        error => {
          updateOktaGroup();
          UIStore.setPageLoader(false);
          if (error.response?.data.IsSuccess === false) {
            return useUpsert.showAlert(error.response?.data.Summary, '0');
          } else useUpsert.showAlert(error.message, '0');
        }
      );
  };

  const updateOktaGroup = (tempPassword?: string) => {
    const selectedUserGroup: UserGroupModel = useUpsert.getField('userRole').value;
    const ids: string[] = [ selectedUserGroup.id ];
    const userId: string = useUpsert.getField('userId').value;

    UIStore.setPageLoader(true);
    const request = new UserModel();
    vendorUserStore
      .updateOktaGroup(request.serialize(useUpsert.form.values(), ids, userId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(
        () => {
          upsertNewVendorUser(tempPassword);
        },
        error => {
          if (error.response?.data.IsSuccess === false) {
            return useUpsert.showAlert(error.response?.data.Summary, '0');
          } else useUpsert.showAlert(error.message, '0');
        }
      );
  };

  const upsertNewVendorUser = (tempPassword?: string) => {
    UIStore.setPageLoader(true);
    const selectedUserGroup: UserGroupModel = useUpsert.getField('userRole').value;
    const userId: string = useUpsert.getField('userId').value;
    const request = new VendorUserModel({ ...useUpsert.form.values() });
    request.vendorUserLocation = OperationInfoSettingOptionModel.deserializeList(
      useUpsert.getField('vendorUserLocation').value
    );
    vendorUserStore
      ?.upsertVendorUser(request.serialize(0, params.vendorId, selectedUserGroup.name, userId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: (response: VendorUserModel) => {
          if (tempPassword) {
            AlertStore.info(`Invitation has been sent successfully to ${response.phoneNo?response.phoneNo:response.email}.`);
            vendorManagementStore.sendNewEmail(response, tempPassword, params.vendorId);
          }
          resetStoreData();
          navigate(
            `/vendor-management/upsert/${params.vendorId}/${params.vendorCode}/${useUpsert.viewMode}/vendor-user`
          );
        },
        error: error => {
          useUpsert.showAlert(error.message, request.id);
        },
      });
  };
  const resetStoreData = () => {
    vendorUserStore.vendorUserData = VENDOR_USER_DATA;
    vendorUserStore.vendorOktaUser = [];
  };

  const getConfirmation = (): void => {
    ModalStore.open(
      <ConfirmDialog
        title="Confirm Changes"
        message={'Cancelling will lost your changes. Are you sure you want to cancel?'}
        yesButton="Confirm"
        onNoClick={() => ModalStore.close()}
        onYesClick={() => {
          ModalStore.close();
          resetStoreData();
          navigate(
            `/vendor-management/upsert/${params.vendorId}/${
              params.vendorCode
            }/${useUpsert.viewMode.toLocaleLowerCase()}/vendor-user`
          );
        }}
      />
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    vendorUserStore.vendorUserData.emailType = Number(event.target.value);
  };

  return (
    <ConfirmNavigate isBlocker={false}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={isEditable}
        classes={{ headerActions: classes.headerActions }}
      >
        <div className={classes.editorWrapperContainer}>
          {!vendorUserStore.vendorUserData.isDataAvailable && (
            <FormControl>
              <div className={`${classes.RadioButton}`}>
                <RadioGroup row value={vendorUserStore.vendorUserData.emailType} onChange={handleChange}>
                  <FormControlLabel value={1} control={<Radio />} label="Individual Email" />
                  <FormControlLabel value={2} control={<Radio />} label="Shared Email" />
                </RadioGroup>
              </div>
            </FormControl>
          )}
          {!vendorUserStore.vendorUserData.isDataAvailable ? (
            vendorUserStore.vendorUserData.emailType == VENDOR_USER_TYPE_ENUM.INDIVIDUAL ? (
              <UserEmailType />
            ) : (
              <UserGroupNameType />
            )
          ) : (
            <ViewInputControls
              isEditable={isEditable}
              groupInputControls={groupInputControlsUser()}
              onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
              onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
              field={fieldKey => useUpsert.getField(fieldKey)}
              onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
            />
          )}
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
)(observer(UpsertVendorUser));

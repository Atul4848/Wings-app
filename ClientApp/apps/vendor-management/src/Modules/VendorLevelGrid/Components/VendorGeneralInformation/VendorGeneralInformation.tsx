import {
  GRID_ACTIONS,
  IAPIGridRequest,
  IAPISearchFiltersDictionary,
  IClasses,
  IOptionValue,
  SEARCH_ENTITY_TYPE,
  UIStore,
  Utilities,
} from '@wings-shared/core';
import { AlertStore } from '@uvgo-shared/alert';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import {
  SettingsStore, VendorLocationStore, VendorManagementStore, VendorUserStore, ApprovalsStore
} from '../../../../Stores';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { useStyles } from '../UpsertVendor.styles';
import { CityModel, CountryModel, StateModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { SETTING_ID, StatusBaseModel, useVMSModuleSecurity, VendorManagmentModel } from '../../../Shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { fields } from './Fields';
import ViewInputControls from '../../../Shared/Components/ViewInputControls/ViewInputControls';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorAddressModel } from '../../../Shared/Models/VendorAddress.model';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmNavigate } from '@wings-shared/layout';
import { SettingNamesMapper } from '../../../../Stores/SettingsMapper';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { UserModel } from '../../../Shared/Models/User.model';
import { PrimaryButton } from '@uvgo-shared/buttons';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { VALIDATION_REGEX } from '../../../Shared/Enums/Spacing.enum';
import { forkJoin } from 'rxjs';
import { ApprovalDataModel } from '../../../Shared/Models/ApprovalData.model';
import ApprovalNotification from '../../../Shared/Components/ApprovalNotification/ApprovalNotification';

interface Props {
  settingsStore: SettingsStore;
  vendorManagementStore: VendorManagementStore;
  searchFilters: IAPISearchFiltersDictionary;
  vendorLocationStore: VendorLocationStore;
  approvalsStore: ApprovalsStore;
  navigate: NavigateFunction;
  vendorUserStore: VendorUserStore;
  setSelectedVendor: React.Dispatch<React.SetStateAction<VendorManagmentModel>>;
  params?: { vendorId: string; vendorName: string };
}

const VendorGeneralInformation: FC<Props> = ({
  settingsStore,
  vendorManagementStore,
  approvalsStore,
  searchFilters,
  setSelectedVendor,
  vendorUserStore,
}) => {
  const params = useParams();
  const gridState = useGridState();
  const unsubscribe = useUnsubscribe();
  const vmsModuleSecurityV2 = useVMSModuleSecurity();
  const useUpsert = useBaseUpsertComponent<VendorManagmentModel>(params, fields, searchFilters);
  const formRef = useUpsert.form;
  const navigate = useNavigate();
  const classes = useStyles();
  const [ countryList, setCountryList ] = useState([]);
  const [ statesList, setStatesList ] = useState([]);
  const [ statusList, setStatusList ] = useState([]);
  const [ isSaved, setIsSaved ] = useState(false);
  const isEditable = useUpsert.isEditable && vmsModuleSecurityV2.isEditable;
  const [ isApprovalRequired, setIsApprovalRequired ] = useState(false);
  const [ approvalResponseData, setApprovalResponseData ] = useState(null);

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
    settingsStore
      .getSettings(SETTING_ID.SETTINGS_VENDOR_STATUS, SettingNamesMapper[SETTING_ID.SETTINGS_VENDOR_STATUS])
      .subscribe(response => {
        setStatusList(response.results);
      });
    if (params.vendorId) {
      loadInitialData();
    }
    vendorManagementStore.getVmsCountryCode().subscribe(response => {
      setCountryList(response.results);
    });
  }, []);

  const isFieldDisabled = () => {
    return useUpsert.getField('addressTypeId').value === 1;
  };

  const title = (): string => {
    return `${useUpsert.getField('name').value} (${useUpsert.getField('code').value})`;
  };

  const isVendorStatusHidden = () => {
    const vendorStatus = useUpsert.getField('vendorStatus').value;
    if (!vendorStatus) {
      return true;
    }
    if (vendorStatus?.id === 5) {
      return true;
    } else {
      return false;
    }
  }

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General Information:',
        inputControls: [
          {
            fieldKey: 'id',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'name',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'code',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'vendorStatus',
            type: EDITOR_TYPES.DROPDOWN,
            options: statusList,
          },
          {
            fieldKey: 'legalCompanyName',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'addressTypeId',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: true,
          },
          {
            fieldKey: 'vendorAddressId',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: true,
          },
          {
            fieldKey: 'addressLine1',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isFieldDisabled(),
            customErrorMessage:
              useUpsert.getField('addressLine1').value && useUpsert.getField('addressLine1').value?.length < 1
                ? 'The Address Line 1* field must be between 1 and 200 characters.'
                : '',
          },
          {
            fieldKey: 'addressLine2',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isFieldDisabled(),
          },
          {
            fieldKey: 'hqAddressCountry',
            type: EDITOR_TYPES.DROPDOWN,
            options: countryList,
            searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
            isDisabled: isFieldDisabled(),
          },
          {
            fieldKey: 'hqAddressState',
            type: EDITOR_TYPES.DROPDOWN,
            options: statesList,
            isDisabled: !isCountrySelected() || isFieldDisabled(),
            searchEntityType: SEARCH_ENTITY_TYPE.STATE,
            getOptionLabel: state => (state as StateModel)?.label,
          },
          {
            fieldKey: 'hqAddressCity',
            type: EDITOR_TYPES.DROPDOWN,
            options: vendorManagementStore.cities,
            isDisabled: !isCountrySelected() || isFieldDisabled(),
          },
          {
            fieldKey: 'hqAddressZipCode',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isFieldDisabled(),
          },
          {
            fieldKey: 'is3rdPartyLocation',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'vendorStatusDetails',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isVendorStatusHidden()
          },
          {
            fieldKey: 'isInvitationPacketSend',
            type: EDITOR_TYPES.CHECKBOX,
            isDisabled: true,
            isHidden: true,
          },
        ],
      },
    ];
  };

  const setFormRequiredFields = () => {
    useUpsert.getField('hqAddressCity').set('label', 'HQ Address City*');
    useUpsert.getField('hqAddressCity').set('rules', 'required');

    useUpsert.getField('hqAddressCountry').set('label', 'HQ Address Country*');
    useUpsert.getField('hqAddressCountry').set('rules', 'required');

    useUpsert.getField('addressLine1').set('label', 'Address Line 1*');
    useUpsert.getField('addressLine1').set('rules', 'required|string|between:1,200');

    useUpsert.getField('hqAddressZipCode').set('label', 'HQ Address Zip Code*');
    useUpsert.getField('hqAddressZipCode').set('rules', 'string|between:1,10');
  };

  const removeFormRequiredFields = () => {
    useUpsert.getField('hqAddressCity').set('label', 'HQ Address City');
    useUpsert.getField('hqAddressCity').set('rules', '');

    useUpsert.getField('hqAddressCountry').set('label', 'HQ Address Country');
    useUpsert.getField('hqAddressCountry').set('rules', '');

    useUpsert.getField('addressLine1').set('label', 'Address Line 1');
    useUpsert.getField('addressLine1').set('rules', '');

    useUpsert.getField('hqAddressZipCode').set('label', 'HQ Address Zip Code');
    useUpsert.getField('hqAddressZipCode').set('rules', '');
    useUpsert.resetFormValidations(useUpsert.form.values(), () => { });
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    const addressLine1 = useUpsert.getField('addressLine1').value;
    const addressLine2 = useUpsert.getField('addressLine2').value;
    const country = useUpsert.getField('hqAddressCountry').value;
    const zipCode = useUpsert.getField('hqAddressZipCode').value;

    if (addressLine1 || addressLine2 || country || zipCode) {
      setFormRequiredFields();
    }

    switch (fieldKey) {
      case 'hqAddressCountry':
        if (!value) {
          useUpsert.getField('hqAddressCity').set('rules', '');
          useUpsert.getField('hqAddressCity').set('label', 'HQ Address City');
          removeFormRequiredFields();
        } else {
          setFormRequiredFields();
        }
        vendorManagementStore.cities = [];
        vendorManagementStore.states = [];
        useUpsert.getField('hqAddressState').clear();
        useUpsert.getField('hqAddressCity').clear();
        filterStateByCountry(value);
        setCountryList(vendorManagementStore.countries);
        loadCities('');
        break;
      case 'hqAddressState':
        vendorManagementStore.cities = [];
        useUpsert.getField('hqAddressCity').clear();
        break;
      case 'addressLine1':
      case 'addressLine2':
      case 'hqAddressZipCode':
        if (!value) {
          useUpsert.getField('hqAddressCountry').set('rules', '');
          useUpsert.getField('hqAddressCountry').set('label', 'HQ Address Country');
          useUpsert.getField('hqAddressCountry').clear();
          useUpsert.getField('hqAddressState').clear();
          useUpsert.getField('hqAddressCity').clear();
          removeFormRequiredFields();
        }
        break;
      case 'vendorStatus':
        if (!value) {
          vendorManagementStore.isVendorStatusFieldRequired = false;
          useUpsert.getField('vendorStatusDetails').set('label', 'Vendor Status Details')
          useUpsert.getField('vendorStatusDetails').set('rules', '');
          useUpsert.getField('vendorStatusDetails').clear();
          return;
        }
        if (value?.id !== 5) {
          vendorManagementStore.isVendorStatusFieldRequired = true;
          useUpsert.getField('vendorStatusDetails').set('label', 'Vendor Status Details*')
          useUpsert.getField('vendorStatusDetails').set('rules', 'string|required|between:1,500');
          useUpsert.getField('vendorStatusDetails').set(null);
        } else {
          useUpsert.getField('vendorStatusDetails').set('label', 'Vendor Status Details');
          useUpsert.getField('vendorStatusDetails').set('rules', 'string|between:1,500');
          useUpsert.getField('vendorStatusDetails').clear();
          vendorManagementStore.isVendorStatusFieldRequired = false;
        }
        break;
      default:
        break;
    }
    gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const filterStateByCountry = (value?: any) => {
    const filter = value
      ? JSON.stringify([
        {
          propertyName: 'Country.CountryId',
          propertyValue: value.id,
        },
      ])
      : '';

    const request: IAPIGridRequest = {
      filterCollection: filter,
    };
    vendorManagementStore.getVmsStates(request, undefined).subscribe(response => {
      setStatesList(response.results);
    });
  };

  const loadCities = (searchValue: string): void => {
    const countryId: number = useUpsert.getField('hqAddressCountry').value?.id;
    if (!countryId || !searchValue) {
      vendorManagementStore.cities = [];
      return;
    }
    const stateId: number = useUpsert.getField('hqAddressState').value?.id;
    const filters = stateId
      ? Utilities.getFilter('State.StateId', stateId)
      : Utilities.getFilter('Country.CountryId', countryId);

    const searchCityFilter = searchValue
      ? [
        {
          propertyName: 'CommonName',
          propertyValue: searchValue,
        },
        {
          propertyName: 'OfficialName',
          operator: 'or',
          propertyValue: searchValue,
        },
      ]
      : [];

    const filterCollection = [ filters ];
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify(filterCollection),
      searchCollection: JSON.stringify(searchCityFilter),
    };
    vendorManagementStore.getVmsCities(request).subscribe();
  };

  const isCountrySelected = (): boolean => {
    const { value } = useUpsert.getField('hqAddressCountry');
    return Boolean((value as CountryModel)?.id);
  };

  const onSearch = (searchValue: string, fieldKey: string): void => {
    switch (fieldKey) {
      case 'hqAddressCountry':
        const filteredList = vendorManagementStore.countries.filter(country => {
          return (
            country.commonName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            country.isO2Code?.toLowerCase().includes(searchValue.toLowerCase())
          );
        });
        setCountryList(filteredList);
        break;
      case 'hqAddressCity':
        loadCities(searchValue);
        break;
      case 'hqAddressState':
        const filteredStates = vendorManagementStore.states.filter(data => {
          return (
            data.commonName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            data.cappsName?.toLowerCase().includes(searchValue.toLowerCase())
          );
        });
        setStatesList(filteredStates);
        break;
      case 'vendorStatus':
        setStatusList(
          settingsStore.vendorSettings.filter(data => {
            return data.label?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase());
          })
        );
        break;
      default:
        break;
    }
    return;
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'hqAddressState':
        const { value } = useUpsert.getField('hqAddressCountry');
        filterStateByCountry(value);
        break;
      case 'hqAddressCountry':
        vendorManagementStore.getVmsCountryCode().subscribe(response => {
          setCountryList(response.results);
        });
        break;
      default:
        break;
    }
  };

  const loadInitialData = () => {
    const vendorId = params.vendorId;
    UIStore.setPageLoader(true);
    const request: IAPIGridRequest = {
      pageNumber: approvalsStore?.pageNumber,
      pageSize: 500,
    };
    forkJoin([
      vendorManagementStore
        ?.getVendorById(parseInt(`${vendorId}`)),
      approvalsStore
        ?.getApprovals(request)
    ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ response, approvalsResponse ]: [VendorManagmentModel, ApprovalDataModel]) => {
        setSelectedVendor(response);
        setFormValues(response);
        const matchedResponse = approvalsResponse.results.find(approvalResponse => {
          return approvalResponse.vendor.id === response.id;
        });
        if (matchedResponse) {
          setApprovalResponseData(matchedResponse?.vendor);
          const showConfirmation = matchedResponse.approvalDatas?.some(item => {
            return item.status.id === 1;
          });
          setIsApprovalRequired(showConfirmation);
        } else {
          setApprovalResponseData(null);
          setIsApprovalRequired(false);
        }
      });
  };

  const setFormValues = response => {
    useUpsert.setFormValues(response);
    vendorManagementStore.isVendorStatusFieldRequired = false;
    Object.keys(response).forEach(data => {
      if (data === 'vendorStatus') {
        const statusModel = new StatusBaseModel({
          id: response['vendorStatus'].id,
          name: response['vendorStatus'].name,
          userId: response['vendorStatus'].userId,
        });
        useUpsert.getField('vendorStatus').set(statusModel);
        if (useUpsert.getField('vendorStatus').value !== 5) {
          vendorManagementStore.isVendorStatusFieldRequired = true;
          useUpsert.getField('vendorStatusDetails').set('label', 'Vendor Status Details*');
          useUpsert.getField('vendorStatusDetails').set('rules', 'string|required|between:1,500');
        } else {
          vendorManagementStore.isVendorStatusFieldRequired = false;
          useUpsert.getField('vendorStatusDetails').set('label', 'Vendor Status Details');
          useUpsert.getField('vendorStatusDetails').set('rules', 'string|between:1,500');
        }
      }
      if (data === 'vendorAddress' && response[data].vendorAddressId !== 0) {
        const vendorAddress: VendorAddressModel = VendorAddressModel.deserialize(response[data]);
        if (vendorAddress) {
          const hqAddress = vendorAddress;
          if (hqAddress) {
            const countryModel = new CountryModel({
              id: hqAddress?.countryId,
              commonName: hqAddress?.countryName,
              isO2Code: hqAddress?.countryCode,
            });
            const stateModel = new StateModel({
              id: hqAddress?.stateId,
              commonName: hqAddress?.stateName,
              code: hqAddress?.stateCode,
            });
            const cityModel = new CityModel({
              id: hqAddress?.cityId,
              cappsCode: hqAddress?.cityCode,
              commonName: hqAddress?.cityName,
            });
            useUpsert.getField('addressTypeId').set(vendorAddress.addressTypeId);
            useUpsert.getField('vendorAddressId').set(vendorAddress.vendorAddressId);
            useUpsert.getField('hqAddressCountry').set(countryModel);
            useUpsert.getField('hqAddressState').set(stateModel);
            useUpsert.getField('hqAddressCity').set(cityModel);
            useUpsert.getField('hqAddressZipCode').set(hqAddress?.zipCode);
            useUpsert.getField('addressLine1').set(hqAddress?.addressLine1);
            useUpsert.getField('addressLine2').set(hqAddress?.addressLine2);
          }
        }
      }
      if (response.vendorAddress?.addressType?.id === 1) {
        removeFormRequiredFields();
      }
    });
  };

  const dialogHeader = (): ReactNode => {
    return useUpsert.viewMode === VIEW_MODE.NEW ? 'Add Vendor' : title();
  };

  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={dialogHeader()} />}
        backNavTitle="Vendors"
        hideActionButtons={false}
        disableActions={
          !formRef.changed ||
            !formRef.isValid ||
            (useUpsert.getField('addressLine1').value &&
              (
                !useUpsert.getField('hqAddressCountry').value ||
                !useUpsert.getField('hqAddressCity').value
              )
            ) ||
            vendorManagementStore.isVendorStatusFieldRequired ? 
            !Boolean(useUpsert.getField('vendorStatusDetails').value) : 
            false
        }
        backNavLink="/vendor-management"
        isEditMode={isEditable}
        hasEditPermission={vmsModuleSecurityV2.isEditable}
        onAction={action => onAction(action)}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  const errorHandler = (errors: object): void => {
    Object.values(errors)?.forEach(errorMessage => AlertStore.info(errorMessage[0]));
  };

  const upsertVendor = (isInvitationPacketSend?: boolean): void => {
    if (!isSaved) {
      UIStore.setPageLoader(true);
      const request = new VendorManagmentModel({ ...useUpsert.form.values() });
      setIsSaved(true);
      vendorManagementStore
        ?.upsertVendor(request.serialize(isInvitationPacketSend || null), isInvitationPacketSend)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: VendorManagmentModel) => {
            setIsSaved(false);
            vendorManagementStore.selectedVendor = response;
            vendorManagementStore.countries = [];
            vendorManagementStore.states = [];
            vendorManagementStore.cities = [];
            useUpsert.form.reset();
            setFormValues(response);
            if (isInvitationPacketSend) findExistingEmail();
            if (!request.id) {
              useUpsert.resetFormValidations(response, () => {
                navigate(
                  `/vendor-management/upsert/${response.id}/${response.code}/${VIEW_MODE.EDIT.toLocaleLowerCase()}`
                );
                useUpsert.setViewMode(VIEW_MODE.EDIT);
                setFormValues(response);
                if (isInvitationPacketSend) findExistingEmail();
              });
            }
          },
          error: error => {
            setIsSaved(false);
            if (error.response.data.errors) {
              errorHandler(error.response.data.errors, request.id.toString());
              return;
            }
            useUpsert.showAlert(error.message, request.id);
          },
        });
    }
  };

  const onAction = (action: GRID_ACTIONS, rowIndex: number): void => {
    switch (action) {
      case GRID_ACTIONS.EDIT:
        navigate(`/vendor-management/upsert/${params.vendorId}/${params.vendorCode}/edit`);
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertVendor();
        break;
      default:
        if (Utilities.isEqual(params, VIEW_MODE.DETAILS)) {
          formRef.reset();
          useUpsert.setViewMode(VIEW_MODE.DETAILS);
          return;
        }
        navigate('/vendor-management');
        break;
    }
  };

  return (
    <ConfirmNavigate isBlocker={formRef.changed}>
      <>
        {
          isApprovalRequired ?
            <ApprovalNotification
              responseData={approvalResponseData}
              text='Vendor'
            />
            : ''
        }
        <DetailsEditorWrapper
          headerActions={headerActions()}
          isEditMode={isEditable}
          classes={{ headerActions: classes.headerActions }}
        >
          <div className={classes.editorWrapperContainer}>
            <ViewInputControls
              isEditable={isEditable}
              groupInputControls={groupInputControls()}
              onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
              onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
              field={fieldKey => useUpsert.getField(fieldKey)}
              onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
              onFocus={fieldKey => onFocus(fieldKey)}
            />
          </div>
        </DetailsEditorWrapper>
      </>
    </ConfirmNavigate>
  );
};

export default inject(
  'settingsStore',
  'vendorLocationStore',
  'vendorManagementStore',
  'approvalsStore',
  'vendorUserStore'
)(observer(VendorGeneralInformation));

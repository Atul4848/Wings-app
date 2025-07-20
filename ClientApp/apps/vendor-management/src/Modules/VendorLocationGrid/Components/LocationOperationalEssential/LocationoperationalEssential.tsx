import React, { FC, ReactNode, useEffect, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import {
  Airports,
  SETTING_ID,
  SettingBaseModel,
  useVMSModuleSecurity,
  VendorLocationModel,
  VendorManagmentModel,
  
} from '../../../Shared';
import { SettingsStore, VendorManagementStore, VendorLocationStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './LocationOperationalEssential.styles';
import { inject, observer } from 'mobx-react';
import { ViewInputControls } from '../../../Shared/Components/ViewInputControls/ViewInputControls';
import { fields } from './Fields';
import {
  IAPISearchFiltersDictionary,
  IClasses,
  IOptionValue,
  UIStore,
  GRID_ACTIONS,
  IAPIGridRequest,
  DATE_FORMAT,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmNavigate, ConfirmDialog } from '@wings-shared/layout';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { LocationOperationalEssentialModel } from '../../../Shared/Models/LocationOperationalEssential.model';
import { forkJoin } from 'rxjs';
import { CustomersModel } from '../../../Shared/Models/Customers.model';
import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';

interface Props {
  vendorLocationStore: VendorLocationStore;
  vendorManagementStore: VendorManagementStore;
  settingsStore: SettingsStore;
  params?: { id: number; vendorId: number };
  searchFilters: IAPISearchFiltersDictionary;
}

const LocationOperationalEssential: FC<Props> = observer(
  ({ settingsStore, vendorLocationStore, vendorManagementStore, searchFilters }) => {
    const classes = useStyles();
    const unsubscribe = useUnsubscribe();
    const params = useParams();
    const vmsModuleSecurityV2 = useVMSModuleSecurity();
    const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());
    const useUpsert = useBaseUpsertComponent<LocationOperationalEssentialModel>(params, fields, searchFilters);

    const formRef = useUpsert.form;
    const navigate = useNavigate();

    useEffect(() => {
      useUpsert.setViewMode((params.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
      if (params.id) {
        loadVendorLocationData();
      }
      loadInitialData();
    }, []);

    const isEditable = useUpsert.isEditable && vmsModuleSecurityV2.isEditable;

    const loadVendorLocationData = () => {
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.getVendorLocationById(params.id)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: VendorLocationModel) => {
          setSelectedVendorLocation(response);
        });
    };

    const loadInitialData = () => {
      UIStore.setPageLoader(true);
      forkJoin([
        vendorLocationStore.getLocationOperationalEssentialById(parseInt(params.id)),
        vendorLocationStore.getVMSComparison(),
        vendorLocationStore.getVmsIcaoCode(),
        settingsStore.getSettings(SETTING_ID.SETTINGS_OPERATON_TYPE, 'AppliedOperationType'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_VENDOR_LEVEL, 'VendorLevel'),
        settingsStore.getSettings(
          SETTING_ID.SETTINGS_CERTIFIED_MEMBER_FEE_SCHEDULE,
          'CertifiedMemberFeeSchedule'
        ),
        settingsStore.getSettings(SETTING_ID.SETTINGS_PAYMENTS_OPTIONS, 'PaymentsOptions'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_CREDIT_AVAILABLE, 'CreditAvailable'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_MAIN_SERVICE_OFFERED, 'MainServiceOffered'),
        settingsStore.getSettings(SETTING_ID.SETTINGS_PAYMENTS_OPTIONS, 'PaymentsOptions'),
        settingsStore.getSettings(
          SETTING_ID.SETTINGS_CERTIFIED_MEMBER_FEE_SCHEDULE,
          'CertifiedMemberFeeSchedule'
        ),
        vendorLocationStore.getCustomers(),
      ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(
          (
            response: [
              LocationOperationalEssentialModel,
              VendorLocationModel,
              Airports,
              SettingBaseModel,
              CustomersModel
            ]
          ) => {
            if (response[0].success === false) {
              useUpsert.setFormValues(new LocationOperationalEssentialModel());
            } else {
              useUpsert.setFormValues(response[0]);
            }
            isProprietary();
          }
        );
    };

    const errorHandler = (errors: object, id): void => {
      Object.values(errors)?.forEach(errorMessage => useUpsert.showAlert(errorMessage[0], id));
    }

    const upsertVendorLocationOperationalEssential = (): void => {
      const request = new LocationOperationalEssentialModel({ ...useUpsert.form.values() });
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.upsertVendorLocationOperationalEssential(request.serialize(parseInt(params.id)))
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: LocationOperationalEssentialModel) => {
            useUpsert.form.reset();
            useUpsert.setFormValues(response);
            if (!request.id) {
              useUpsert.resetFormValidations(response, () => {
                navigate(
                  params.operationCode === 'upsert'
                    ? `/vendor-management/vendor-location/upsert/${params.vendorId}/${response.vendorLocation.vendorLocationId
                    }/${VIEW_MODE.EDIT.toLocaleLowerCase()}/vendor-location-operational-essential`
                    : `/vendor-management/vendor-location/${params.operationCode}/${params.vendorId}/${response.vendorLocation.vendorLocationId
                    }/${VIEW_MODE.EDIT.toLocaleLowerCase()}/vendor-location-operational-essential`
                );
              });
            }
          },
          error: error => {
            errorHandler(error.response?.data?.errors, request.id.toString());
          },
        });
    };


    const onValueChange = (value: IOptionValue, fieldKey: string): void => {
      useUpsert.getField(fieldKey).set(value);
      switch (fieldKey) {
        case 'isProprietary':
          isProprietary();
          useUpsert.getField('customers').clear();
          break;
        case 'customers':
          isProprietary();
          break;
        case 'appliedCreditAvailable':
          vendorLocationStore.isCreditFieldValid = true;
          const appliedCreditAvailable = useUpsert.getField('appliedCreditAvailable')?.value;
          if (appliedCreditAvailable && appliedCreditAvailable.find(data => data.creditAvailable.id === 4)) {
            if (appliedCreditAvailable && appliedCreditAvailable.find(data => data.creditAvailable.id !== 4)) {
              vendorLocationStore.isCreditFieldValid = false;
              getConfirmation();
            }
          }
          break;
        default:
          useUpsert.getField(fieldKey).set(value);
      }
    };

    const getConfirmation = (): void => {
      ModalStore.open(
        <Dialog
          title="Choose either the None option or select an option other than None."
          open={true}
          onClose={() => ModalStore.close()}
          dialogContent={() => dialogContent()}
          disableBackdropClick={true}
        />
      );
    };

    const dialogContent = () => {
      return (
        <div>
          <PrimaryButton variant="contained" color="primary" onClick={() => ModalStore.close()}>
            OK
          </PrimaryButton>
        </div>
      );
    };

    const isProprietary = (): boolean => {
      const isProprietaryValue = useUpsert.getField('isProprietary')?.value;
      if (Boolean(isProprietaryValue)) {
        useUpsert.setFormRules('customers', true);
      } else {
        useUpsert.setFormRules('customers', false);
      }
      return !isProprietaryValue;
    };

    const onSearch = (searchValue: string, fieldKey: string): void => {
      const airportRequest: IAPIGridRequest = {
        searchCollection: JSON.stringify([
          { propertyName: 'Name', propertyValue: searchValue },
          { propertyName: 'ICAOCode.Code', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'UWACode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'FAACode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'IATACode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'RegionalCode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'DisplayCode', propertyValue: searchValue, operator: 'or' }
        ]),
      };
     
      const locationRequest: IAPIGridRequest = {
        searchCollection: JSON.stringify([
          { propertyName: 'Name', propertyValue: searchValue },
          { propertyName: 'AirportReference.ICAOCode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'AirportReference.UWACode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'AirportReference.FAACode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'AirportReference.IATACode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'AirportReference.RegionalCode', propertyValue: searchValue, operator: 'or' },
          { propertyName: 'AirportReference.DisplayCode', propertyValue: searchValue, operator: 'or' }
        ]),
      };
     
      switch (fieldKey) {
        case 'coordinatingOffice':
          vendorLocationStore.getVMSComparison(locationRequest).subscribe();
          break;
        case 'agentDispatchedFrom':
          vendorLocationStore.getVmsIcaoCode(airportRequest).subscribe();
          break;
        case 'provideCoordinationFor':
          vendorLocationStore.getVMSComparison(locationRequest).subscribe();
          break;
        case 'commsCopyFor':
          vendorLocationStore.getVMSComparison(locationRequest).subscribe();
          break;
        case 'creditProvidedBy':
          vendorLocationStore.getVMSComparison(locationRequest).subscribe();
          break;
        case 'creditProvidedFor':
          vendorLocationStore.getVMSComparison(locationRequest).subscribe();
          break;
        case 'customers':
          const customerRequest: IAPIGridRequest = {
            searchCollection: JSON.stringify([{ propertyName: 'Name', propertyValue: searchValue }]),
          };
          vendorLocationStore.getCustomers(customerRequest).subscribe();
          break;

        default:
          break;
      }
      return;
    };

    const groupInputControls = (): IGroupInputControls[] => {
      return [
        {
          title: 'Operational Essential:',
          inputControls: [
            {
              fieldKey: 'id',
              type: EDITOR_TYPES.TEXT_FIELD,
              isHidden: true,
            },
            {
              fieldKey: 'appliedOperationType',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.getOperationalEssentialSettingOptions<SettingBaseModel>(
                settingsStore?.operationType,
                'operationType'
              ),
            },
            {
              fieldKey: 'coordinatingOffice',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore?.vendorLocationList,
            },
            {
              fieldKey: 'provideCoordinationFor',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.getOperationalEssentialSettingOptions<VendorLocationModel>(
                vendorLocationStore?.vendorLocationList,
                'vendorLocation'
              ),
              multiple: true,
            },
            {
              fieldKey: 'commsCopyFor',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.getOperationalEssentialSettingOptions<VendorLocationModel>(
                vendorLocationStore?.vendorLocationList,
                'vendorLocation'
              ),
              multiple: true,
            },
            {
              fieldKey: 'isSupervisoryAgentAvailable',
              type: EDITOR_TYPES.SELECT_CONTROL,
              showLabel: true,
              isBoolean: true,
              excludeEmptyOption: false,
            },
            {
              fieldKey: 'agentDispatchedFrom',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore?.airportList,
            },
            {
              fieldKey: 'vendorLevel',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore?.vendorLevel,
            },
            {
              fieldKey: 'startDate',
              type: EDITOR_TYPES.DATE,
              maxDate: useUpsert.getField('endDate')?.value || null,
              dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
              allowKeyboardInput: true,
            },
            {
              fieldKey: 'endDate',
              type: EDITOR_TYPES.DATE,
              minDate: useUpsert.getField('startDate')?.value || null,
              dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
              allowKeyboardInput: true,
            },
            {
              fieldKey: 'complianceDiligenceDueDate',
              type: EDITOR_TYPES.DATE,
              dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
              allowKeyboardInput: true,
            },
            {
              fieldKey: 'certifiedMemberFeeSchedule',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore?.certifiedMemberFeeSchedule,
            },
            {
              fieldKey: 'certifiedMemberFee',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'contractRenewalDate',
              type: EDITOR_TYPES.DATE,
              dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
              allowKeyboardInput: true,
            },
            {
              fieldKey: 'appliedPaymentOptions',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.getOperationalEssentialSettingOptions<SettingBaseModel>(
                settingsStore?.paymentOptions,
                'paymentOptions'
              ),
              multiple: true,
            },
            {
              fieldKey: 'appliedCreditAvailable',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.getOperationalEssentialSettingOptions<SettingBaseModel>(
                settingsStore?.creditAvailable,
                'creditAvailable'
              ),
              multiple: true,
            },
            {
              fieldKey: 'creditProvidedBy',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore?.vendorLocationList,
              getOptionLabel: option => (option as VendorLocationModel)?.label,
            },
            {
              fieldKey: 'creditProvidedFor',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.getOperationalEssentialSettingOptions<VendorLocationModel>(
                vendorLocationStore?.vendorLocationList,
                'vendorLocation'
              ),
              multiple: true,
            },
            {
              fieldKey: 'isPrincipleOffice',
              type: EDITOR_TYPES.SELECT_CONTROL,
              showLabel: true,
              isBoolean: true,
              excludeEmptyOption: false,
            },
            {
              fieldKey: 'isProprietary',
              type: EDITOR_TYPES.SELECT_CONTROL,
              showLabel: true,
              isBoolean: true,
              excludeEmptyOption: false,
            },
            {
              fieldKey: 'customers',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore?.customersList,
              multiple: true,
              isDisabled: isProprietary(),
            },
            {
              fieldKey: 'locationAirfield',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'airToGroundFrequency',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'netSuitId',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'managerName',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'asstManagerName',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'appliedMainServicesOffered',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.getOperationalEssentialSettingOptions<SettingBaseModel>(
                settingsStore?.mainServicesOffered,
                'mainServicesOffered'
              ),
              multiple: true,
            },
          ],
        },
      ];
    };

    const headerActions = (): ReactNode => {
      return (
        <DetailsEditorHeaderSection
          title={<CustomTooltip title={selectedVendorLocation?.label} />}
          backNavTitle="Vendor Location"
          hideActionButtons={false}
          backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
          disableActions={
            !formRef.isValid || !formRef.changed ||
            formRef.hasError
          }
          isEditMode={isEditable}
          hasEditPermission={vmsModuleSecurityV2.isEditable}
          onAction={action => onAction(action)}
          showStatusButton={false}
          isActive={true}
        />
      );
    };

    const onAction = (action: GRID_ACTIONS): void => {
      switch (action) {
        case GRID_ACTIONS.EDIT:
          const redirectUrl =
            params.operationCode === 'upsert'
              ? `/vendor-management/vendor-location/upsert/${params.vendorId}/${params.id}/edit/vendor-location-operational-essential`
              : `/vendor-management/vendor-location/${params.operationCode}/${params.vendorId}/${params.id}/edit`;
          navigate(redirectUrl);
          useUpsert.setViewMode(VIEW_MODE.EDIT);
          break;
        case GRID_ACTIONS.SAVE:
          upsertVendorLocationOperationalEssential();
          break;
        default:
          navigate(
            params.operationCode === 'upsert'
              ? '/vendor-management/vendor-location'
              : `/vendor-management/upsert/${params.vendorId}/${params.operationCode}/edit/vendor-location`
          );
          break;
      }
    };

    const onFocus = (fieldKey: string): void => {
      switch (fieldKey) {
        case 'customers':
          vendorLocationStore.getCustomers().subscribe();
          break;
        case 'coordinatingOffice':
          vendorLocationStore.getVMSComparison().subscribe();
          break;
        case 'commsCopyFor':
          vendorLocationStore.getVMSComparison().subscribe();
          break;
        case 'creditProvidedBy':
          vendorLocationStore.getVMSComparison().subscribe();
          break;
        case 'creditProvidedFor':
          vendorLocationStore.getVMSComparison().subscribe();
          break;
        case 'provideCoordinationFor':
          vendorLocationStore.getVMSComparison().subscribe();
          break;
      }
    };

    return (
      <ConfirmNavigate isBlocker={formRef.changed}>
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
      </ConfirmNavigate>
    );
  }
);
export default inject('settingsStore', 'vendorLocationStore', 'vendorManagementStore')(LocationOperationalEssential);

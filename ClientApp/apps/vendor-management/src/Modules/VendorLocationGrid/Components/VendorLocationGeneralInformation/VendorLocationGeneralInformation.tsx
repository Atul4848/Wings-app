import React, { FC, ReactNode, useEffect, useState } from 'react';
import { CityModel, CountryModel, StateModel, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { SETTING_ID, useVMSModuleSecurity, VendorLocationModel, VendorManagmentModel } from '../../../Shared';
import { SettingsStore, VendorManagementStore, VendorLocationStore, ApprovalsStore } from '../../../../Stores';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useStyles } from './VendorLocationGeneralInformation.styles';
import { inject, observer } from 'mobx-react';
import { ViewInputControls } from '../../../Shared/Components/ViewInputControls/ViewInputControls';
import { fields } from './Fields';
import {
  IAPISearchFiltersDictionary,
  IClasses,
  IOptionValue,
  UIStore,
  GRID_ACTIONS,
  SEARCH_ENTITY_TYPE,
  IAPIGridRequest,
  Utilities,
} from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { DetailsEditorHeaderSection, DetailsEditorWrapper, ConfirmNavigate } from '@wings-shared/layout';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';
import { forkJoin } from 'rxjs';
import { ApprovalDataModel } from '../../../Shared/Models/ApprovalData.model';
import ApprovalNotification from '../../../Shared/Components/ApprovalNotification/ApprovalNotification';

interface Props {
  settingsStore: SettingsStore;
  vendorLocationStore: VendorLocationStore;
  vendorManagementStore: VendorManagementStore;
  approvalsStore: ApprovalsStore;
  params?: { viewMode: VIEW_MODE; id: Number };
  classes?: IClasses;
  searchFilters: IAPISearchFiltersDictionary;
}

const VendorLocationGeneralInformation: FC<Props> = observer(
  ({ settingsStore, vendorLocationStore, vendorManagementStore, approvalsStore, searchFilters }) => {
    const classes = useStyles();
    const unsubscribe = useUnsubscribe();
    const params = useParams();
    const vmsModuleSecurityV2 = useVMSModuleSecurity();
    const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());

    const useUpsert = useBaseUpsertComponent<VendorLocationModel>(params, fields, searchFilters);
    const [ isApprovalRequired, setIsApprovalRequired ] = useState(false);
    const [ approvalResponseData, setApprovalResponseData ] = useState(null);

    const formRef = useUpsert.form;
    const navigate = useNavigate();

    useEffect(() => {
      useUpsert.setViewMode((params.viewMode.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
      if (params.id) {
        loadInitialData();
      } else {
        useUpsert.getField('airportReference').set('rules', 'required');
        useUpsert.getField('airportReference').set('label', 'Airport*');
        useUpsert.getField('rankAtAirport').set('rules', 'required|numeric|between:1,99');
        useUpsert.getField('rankAtAirport').set('label', 'Rank at Airport*');
      }
      if (params.operationCode !== 'upsert') {
        loadVendorData();
      }
      vendorLocationStore.isAirportRequired = true;
      vendorManagementStore.getVmsCountryCode().subscribe();
    }, []);

    const isEditable = useUpsert.isEditable && vmsModuleSecurityV2.isEditable;

    const loadInitialData = () => {
      UIStore.setPageLoader(true);

      const request: IAPIGridRequest = {
        pageNumber: approvalsStore?.pageNumber,
        pageSize: 500,
      };

      forkJoin([
        vendorLocationStore
          ?.getVendorLocationById(params.id),
        approvalsStore
          ?.getApprovals(request)
      ])
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe(([ vendorLocationResponse, approvalsResponse ]: [VendorLocationModel, ApprovalDataModel]) => {
          setFormValues(vendorLocationResponse);
          if (vendorLocationResponse.vendorLocationStatus?.name === 'Suspect') {
            useUpsert.getField('automationNoteForStatusDetails')
              .set('rules', 'required|string|between:1,200');
            useUpsert.getField('automationNoteForStatusDetails')
              .set('label', 'Automation note for vendor location status*');
          } else {
            useUpsert.getField('automationNoteForStatusDetails').set('rules', 'string|between:1,200');
            useUpsert.getField('automationNoteForStatusDetails')
              .set('label', 'Automation note for vendor location status');
          }
          vendorLocationStatusRules(vendorLocationResponse.vendorLocationStatus, 'locationStatusDetails');
          if (vendorLocationResponse.vendorLocationStatus?.id === 6
            && !vendorLocationResponse.automationNoteForStatusDetails) {
            useUpsert.getField('automationNoteForStatusDetails').set('label', 'Automation Note For Status Details*');
            useUpsert.getField('automationNoteForStatusDetails').set('rules', 'string|required|between:1,200');
          }
          else {
            useUpsert.getField('automationNoteForStatusDetails').set('label', 'Automation Note For Status Details');
            useUpsert.getField('automationNoteForStatusDetails').set('rules', 'string|between:1,200');
          }
          setSelectedVendorLocation(vendorLocationResponse);
          const matchedResponse = approvalsResponse.results.filter(approvalResponse => {
            return approvalResponse.vendor.id === vendorLocationResponse.vendor.id;
          })[0];
          const showFilteredData = matchedResponse?.approvalDatas
            .filter(item => {
              return item.vendorLocationId === vendorLocationResponse.id;
            })
            ?.some(item => {
              setApprovalResponseData(item.vendor);
              return item.status.id === 1;
            });
          setIsApprovalRequired(showFilteredData);
        });
    };

    const loadVendorData = () => {
      UIStore.setPageLoader(true);
      vendorManagementStore
        ?.getVendorById(params.vendorId)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe((response: VendorManagmentModel) => {
          useUpsert.getField('vendor').set(response);
        });
    };

    const setFormValues = (response: VendorLocationModel) => {
      useUpsert.setFormValues(response);
      useUpsert.getField('automationNoteForStatusDetails').set('disabled', true);
      if (response.airportReference !== null) {
        vendorLocationStore.isAirportRequired = true;
        useUpsert.getField('radio').set('airport');
        useUpsert.getField('airportReference').set('rules', 'required');
        useUpsert.getField('airportReference').set('label', 'Airport*');
        useUpsert.getField('rankAtAirport').set('rules', 'required|numeric|between:1,99');
        useUpsert.getField('rankAtAirport').set('label', 'Rank at Airport*');
      } else {
        vendorLocationStore.isAirportRequired = false;
        useUpsert.getField('radio').set('city');
        const countryModel = new CountryModel({
          id: response.vendorLocationCityReference?.countryId,
          commonName: response.vendorLocationCityReference?.countryName,
          isO2Code: response.vendorLocationCityReference?.countryCode,
        });
        const stateModel = new StateModel({
          id: response.vendorLocationCityReference?.stateId,
          commonName: response.vendorLocationCityReference?.stateName,
          code: response.vendorLocationCityReference?.stateCode,
        });
        const cityModel = new CityModel({
          id: response.vendorLocationCityReference?.cityId,
          cappsCode: response.vendorLocationCityReference?.cityCode,
          commonName: response.vendorLocationCityReference?.cityName,
        });
        useUpsert.getField('hqAddressCountry').set(countryModel);
        useUpsert.getField('hqAddressState').set(stateModel);
        useUpsert.getField('hqAddressCity').set(cityModel);
        useUpsert.getField('hqAddressCountry').set('label', 'Country*');
        useUpsert.getField('hqAddressCity').set('label', 'City*');
        useUpsert.getField('hqAddressCountry').set('rules', 'required');
        useUpsert.getField('hqAddressCity').set('rules', 'required');
      }
    };

    const upsertVendorLocation = (): void => {
      const request = new VendorLocationModel({ ...useUpsert.form.values() });
      UIStore.setPageLoader(true);
      vendorLocationStore
        ?.upsertVendorLocation(request.serialize(vendorLocationStore.isAirportRequired))
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe({
          next: (response: VendorLocationModel) => {
            useUpsert.form.reset();
            setFormValues(response);
            vendorLocationStore.selectedVendorLocation = response;
            setSelectedVendorLocation(response);
            if (!request.id) {
              useUpsert.resetFormValidations(response, () => {
                navigate(
                  params.operationCode === 'upsert'
                    ? `/vendor-management/vendor-location/upsert/${response.vendor.id}/${response.id
                    }/${VIEW_MODE.EDIT.toLocaleLowerCase()}`
                    : `/vendor-management/vendor-location/${params.operationCode}/${response.vendor.id}/${response.id
                    }/${VIEW_MODE.EDIT.toLocaleLowerCase()}`
                );
              });
              setFormValues(response);
            }
          },
          error: error => {
            useUpsert.showAlert(error.message, request.id.toString());
          },
        });
    };

    const vendorLocationStatusRules = (value, fieldKey): void => {
      if (value?.name === 'Suspect' || value?.name === 'Sanctioned' || value?.name === 'UWA Deactivated') {
        useUpsert.getField(fieldKey).set('rules', 'required|string|between:2,200');
      } else {
        useUpsert.setFormRules(fieldKey, false);
      }
    };

    const onValueChange = (value: IOptionValue, fieldKey: string): void => {
      switch (fieldKey) {
        case 'airportReference':
          vendorLocationStore.getVmsIcaoCode().subscribe();
          break;
        case 'vendorLocationStatus':
          vendorLocationStatusRules(value, 'locationStatusDetails');
          if(value?.name !== 'Suspect'){
            useUpsert.getField('automationNoteForStatusDetails').set(null);
          }
          break;
        case 'locationStatusDetails':
          useUpsert.getField('automationNoteForStatusDetails').set(null);
          break;
        case 'countryDataManagement':
          useUpsert.getField('countryDataManagement').set(value);
          break;
        case 'permitDataManagement':
          useUpsert.getField('permitDataManagement').set(value);
          break;
        case 'radio':
          if (value.toString().toLocaleLowerCase() === 'airport') {
            vendorLocationStore.isAirportRequired = true;
            useUpsert.getField('airportReference').set('rules', 'required');
            useUpsert.getField('airportReference').set('label', 'Airport*');
            useUpsert.getField('hqAddressCountry').set('rules', '');
            useUpsert.getField('rankAtAirport').set('rules', 'required|numeric|between:1,99');
            useUpsert.getField('hqAddressCity').set('rules', '');
          } else {
            vendorLocationStore.isAirportRequired = false;
            useUpsert.getField('airportReference').set('rules', '');
            useUpsert.getField('airportReference').set('label', 'Airport');
            useUpsert.getField('hqAddressCountry').set('rules', 'required');
            useUpsert.getField('hqAddressCity').set('rules', 'required');
            useUpsert.getField('hqAddressCountry').set('label', 'Country*');
            useUpsert.getField('hqAddressCity').set('label', 'City*');
            useUpsert.getField('rankAtAirport').set('rules', '');
          }
          break;
        case 'hqAddressCountry':
          if (value === null) {
            vendorManagementStore.isCellDisable = true;
            useUpsert.getField('hqAddressState').set('');
            useUpsert.getField('hqAddressCity').set('');
            return;
          }
          vendorManagementStore.states = [];
          vendorManagementStore.cities = [];
          filterStateByCountry(value);
          useUpsert.getField('hqAddressState').set('');
          useUpsert.getField('hqAddressCity').set('');
          vendorManagementStore.isCellDisable = false;
          break;
        case 'hqAddressState':
          if (value) {
            vendorManagementStore.cities = [];
            useUpsert.getField('hqAddressCity').set('');
          }
          break;
        default:
          break;
      }
      useUpsert.getField(fieldKey).set(value);
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
      vendorManagementStore.getVmsStates(request, undefined).subscribe();
    };

    const onSearch = (searchValue: string, fieldKey: string): void => {
      switch (fieldKey) {
        case 'airportReference':
          vendorLocationStore.searchAirport(searchValue);
          break;
        case 'vendor':
          vendorManagementStore.searchVendor(searchValue);
          break;
        case 'hqAddressCity':
          loadCities(searchValue);
          break;
        default:
          break;
      }
      return;
    };

    const isDisabled = () => {
      return params.id ? true : false;
    };

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
              fieldKey: 'vendor',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorManagementStore.vendorList,
              showTooltip: true,
              showChipTooltip: true
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
              fieldKey: 'radio',
              type: EDITOR_TYPES.RADIO,
              showLabel: false,
              selectControlOptions: [
                { id: 1, label: 'Airport', name: 'Airport', value: 'airport' },
                { id: 2, label: 'City', name: 'City', value: 'City' },
              ],
              isDisabled: isDisabled(),
              defaultValue: vendorLocationStore.isAirportRequired ? 'airport' : 'city',
            },
            {
              fieldKey: 'airportReference',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorLocationStore.airportList,
              searchEntityType: SEARCH_ENTITY_TYPE.AIRPORT,
              isHidden: !Boolean(vendorLocationStore.isAirportRequired),
              isDisabled: isDisabled(),
            },
            {
              fieldKey: 'hqAddressCountry',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorManagementStore.countries,
              searchEntityType: SEARCH_ENTITY_TYPE.COUNTRY,
              isHidden: Boolean(vendorLocationStore.isAirportRequired),
              isDisabled: isDisabled(),
            },
            {
              fieldKey: 'hqAddressState',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorManagementStore.states,
              searchEntityType: SEARCH_ENTITY_TYPE.STATE,
              isHidden: Boolean(vendorLocationStore.isAirportRequired),
              isDisabled: isDisabled(),
            },
            {
              fieldKey: 'hqAddressCity',
              type: EDITOR_TYPES.DROPDOWN,
              options: vendorManagementStore.cities,
              searchEntityType: SEARCH_ENTITY_TYPE.CITY,
              isHidden: Boolean(vendorLocationStore.isAirportRequired),
              isDisabled: isDisabled(),
            },
            {
              fieldKey: 'vendorLocationStatus',
              type: EDITOR_TYPES.DROPDOWN,
              options: settingsStore.vendorLocationSettings,
            },
            {
              fieldKey: 'locationLegalName',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'rankAtAirport',
              type: EDITOR_TYPES.TEXT_FIELD,
              isHidden: !Boolean(vendorLocationStore.isAirportRequired),
            },
            {
              fieldKey: 'locationStatusDetails',
              type: EDITOR_TYPES.TEXT_FIELD,
            },
            {
              fieldKey: 'cappsLocationCode',
              type: EDITOR_TYPES.TEXT_FIELD
            },
            {
              fieldKey: 'countryDataManagement',
              type: EDITOR_TYPES.CHECKBOX,
            },
            {
              fieldKey: 'permitDataManagement',
              type: EDITOR_TYPES.CHECKBOX,
            },
            {
              fieldKey: 'airportDataManagement',
              type: EDITOR_TYPES.CHECKBOX,
            },
            {
              fieldKey: 'automationNoteForStatusDetails',
              type: EDITOR_TYPES.TEXT_FIELD,
              isHalfFlex: true,
              isDisabled: true,
            },
          ],
        },
      ];
    };

    const dialogHeader = (): ReactNode => {
      return useUpsert.viewMode === VIEW_MODE.NEW ? 'Add Vendor Location' : selectedVendorLocation.label;
    };

    const headerActions = (): ReactNode => {
      return (
        <DetailsEditorHeaderSection
          title={<CustomTooltip title={dialogHeader()} />}
          backNavTitle="Vendor Location"
          hideActionButtons={false}
          backNavLink={vendorLocationStore.getVendorLocationBackNavLink(params)}
          disableActions={!formRef.isValid || !formRef.changed}
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
              ? `/vendor-management/vendor-location/upsert/${params.vendorId}/${params.id}/edit`
              : `/vendor-management/vendor-location/${params.operationCode}/${params.vendorId}/${params.id}/edit`;
          navigate(redirectUrl);
          useUpsert.setViewMode(VIEW_MODE.EDIT);
          break;
        case GRID_ACTIONS.SAVE:
          upsertVendorLocation();
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
        case 'vendorLocationStatus':
          settingsStore.getSettings(SETTING_ID.LOCATION_STATUS, 'LocationStatus').subscribe();
          break;
        case 'airportReference':
          vendorLocationStore.getVmsIcaoCode().subscribe();
          break;
        case 'vendor':
          vendorManagementStore.getVMSComparison().subscribe();
          break;
        case 'hqAddressState':
          const countryValue = useUpsert.getField('hqAddressCountry')?.value;
          if (countryValue) {
            filterStateByCountry(countryValue);
          }
          break;
        default:
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
                text='Vendor Location'
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
  }
);
export default inject(
  'settingsStore',
  'vendorLocationStore',
  'approvalsStore',
  'vendorManagementStore'
)(VendorLocationGeneralInformation);

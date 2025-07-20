import { baseApiPath, HttpClient, SettingsBaseStore } from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { SETTING_ID, StatusBaseModel } from '../Modules/Shared';
import { vendorManagementHeaders } from './Base.store';
import { Logger } from '@wings-shared/security';
import { apiUrls } from './API.url';
import { IAPIGridRequest, IAPIPageResponse, ISelectOption, tapWithAction, Utilities } from '@wings-shared/core';
import { ServiceItemModel } from '../Modules/Shared/Models/ServiceItem.model';
import { CurrencyModel } from '../Modules/Shared/Models/Currency.model';
import { SettingBaseModel } from '../Modules/Shared/Models';
import { SettingsUrlMapper } from './SettingsMapper';

export class SettingsStore extends SettingsBaseStore {
  @observable public vendorSettings: StatusBaseModel[] = [];
  @observable public vendorLocationSettings: StatusBaseModel[] = [];
  @observable public vendorSettingsParameters: SettingBaseModel[] = [];
  @observable public vendorSettingsUnits: SettingBaseModel[] = [];
  @observable public vendorSettingsHandlingFee: SettingBaseModel[] = [];
  @observable public vendorSettingsCurrency: CurrencyModel[] = [];
  @observable public vendorSettingsServiceCategory: SettingBaseModel[] = [];
  @observable public vendorSettingsServiceItemName: ServiceItemModel[] = [];
  @observable public vendorSettingsStatus: StatusBaseModel[] = [];
  @observable public vendorContactMethod: SettingBaseModel[] = [];
  @observable public vendorContactType: SettingBaseModel[] = [];
  @observable public vendorContactStatus: SettingBaseModel[] = [];
  @observable public vendorAccessLevel: SettingBaseModel[] = [];
  @observable public vendorContactCommunicationService: SettingBaseModel[] = [];
  @observable public vendorContactUsageType: SettingBaseModel[] = [];
  @observable public vendorAddressType: SettingBaseModel[] = [];
  @observable public vendorDocumentName: SettingBaseModel[] = [];
  @observable public vendorDocumentStatus: SettingBaseModel[] = [];
  @observable public vendorLevel: SettingBaseModel[] = [];
  @observable public certifiedMemberFeeSchedule: SettingBaseModel[] = [];
  @observable public paymentOptions: SettingBaseModel[] = [];
  @observable public creditAvailable: SettingBaseModel[] = [];
  @observable public mainServicesOffered: SettingBaseModel[] = [];
  @observable public operationType: SettingBaseModel[] = [];
  @observable public hoursType: SettingBaseModel[] = [];
  @observable public hoursScheduleType: SettingBaseModel[] = [];
  @observable public status: SettingBaseModel[] = [];
  @observable public a2GLocationType: SettingBaseModel[] = [];
  @observable public approvalStatus: SettingBaseModel[] = [];
  @observable public pickupLocationCrew: SettingBaseModel[] = [];
  @observable public pickupLocationPax: SettingBaseModel[] = [];
  @observable public amenities: SettingBaseModel[] = [];
  @observable public aircraftParkingOptions: SettingBaseModel[] = [];
  @observable public aircraftParkingDistanceFBO: SettingBaseModel[] = [];
  @observable public aircraftSpotAccommodation: SettingBaseModel[] = [];
  @observable public towbarScenarios: SettingBaseModel[] = [];
  @observable public internationalDepartureProcedures: SettingBaseModel[] = [];
  @observable public internationalArrivalProcedures: SettingBaseModel[] = [];
  @observable public availableFacilities: SettingBaseModel[] = [];
  @observable public luggageHandling: SettingBaseModel[] = [];
  @observable public arrivalCrewPaxPassportHandling: SettingBaseModel[] = [];
  @observable public disabilityAccommodations: SettingBaseModel[] = [];
  @observable public hangerAvailableUom: SettingBaseModel[] = [];
  @observable public orderManagementSoftware: SettingBaseModel[] = [];
  @observable public trueAndFalseOption: ISelectOption[] = [];

  /* istanbul ignore next */
  public searchServiceCategory = (searchKey: string): void => {
    const pageRequest: IAPIGridRequest = {
      searchCollection: JSON.stringify([{ propertyName: 'Name', propertyValue: searchKey }]),
    };
    this.getVendorSettingsServiceCategory(pageRequest).subscribe();
  };

  public upsertVendorSettingsServiceItemName(payload: ServiceItemModel): Observable<ServiceItemModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const isNewRequest: boolean = !Boolean(payload.id);
    const upsertRequest: Observable<ServiceItemModel> = isNewRequest
      ? http.post<ServiceItemModel>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorSettingsServiceItemName}`,
        payload
      )
      : http.put<ServiceItemModel>(
        `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorSettingsServiceItemName}/${payload.id}`,
        payload
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Service Item saved successfully!'))
    );
  }

  public getVendorSettingsServiceCategory(
    pageRequest?: IAPIGridRequest,
    forceRefresh?: boolean
  ): Observable<IAPIPageResponse<SettingBaseModel>> {
    const http: HttpClient = new HttpClient({ headers: vendorManagementHeaders });
    const params: string = Utilities.buildParamString({
      CollectionName: 'Service Category',
      ...pageRequest,
    });
    return http
      .get<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorSetingsServiceCategory}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => {
          this.vendorSettingsServiceCategory = SettingBaseModel.deserializeList(response.results);
          return { ...response, results: this.vendorSettingsServiceCategory };
        })
      );
  }
  public getVendorSettingsStatus(forceRefresh?: boolean): Observable<StatusBaseModel[]> {
    const http: HttpClient = new HttpClient({ headers: vendorManagementHeaders });
    return http
      .get<any>(
        `
      ${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorSettingsStatus}`
      )
      .pipe(map(res => res.results))
      .pipe(
        tapWithAction(
          vendorSettingsStatus =>
            (this.vendorSettingsStatus = vendorSettingsStatus.map(
              item => new StatusBaseModel({ id: item.id, name: item.name })
            ))
        )
      );
  }

  public searchSettings(searchKey: string, settingId?: SETTING_ID, collectionName?: string) {
    const pageRequest: IAPIGridRequest = {
      filterCollection: JSON.stringify([{ Name: searchKey }]),
    };
    return this.getPricingSettings(pageRequest, settingId, collectionName).subscribe();
  }

  public getDeserializeList(results: any[], settingId?: SETTING_ID): any {
    switch (settingId) {
      case SETTING_ID.SETTINGS_VENDOR_STATUS:
        this.vendorSettings = StatusBaseModel.deserializeList(results);
        return this.vendorSettings;
      case SETTING_ID.LOCATION_STATUS:
        this.vendorLocationSettings = StatusBaseModel.deserializeList(results);
        return this.vendorLocationSettings;
      case SETTING_ID.SETTINGS_PARAMETERS:
        this.vendorSettingsParameters = SettingBaseModel.deserializeList(results);
        return this.vendorSettingsParameters;
      case SETTING_ID.SETTINGS_UNITS:
        this.vendorSettingsUnits = SettingBaseModel.deserializeList(results);
        return this.vendorSettingsUnits;
      case SETTING_ID.SETTINGS_HANDLING_FEES:
        this.vendorSettingsHandlingFee = SettingBaseModel.deserializeList(results);
        return this.vendorSettingsHandlingFee;
      case SETTING_ID.SETTINGS_CURRENCY:
        this.vendorSettingsCurrency = CurrencyModel.deserializeList(results);
        return this.vendorSettingsCurrency;
      case SETTING_ID.SETTINGS_SERVICE_ITEM_NAME:
        this.vendorSettingsServiceItemName = ServiceItemModel.deserializeList(results);
        return this.vendorSettingsServiceItemName;
      case SETTING_ID.SETTINGS_SERVICE_CATEGORY:
        this.vendorSettingsServiceCategory = SettingBaseModel.deserializeList(results);
        return this.vendorSettingsServiceCategory;
      case SETTING_ID.SETTINGS_PRICING_STATUS:
        this.vendorSettingsStatus = StatusBaseModel.deserializeList(results);
        return this.vendorSettingsStatus;
      case SETTING_ID.SETTING_CONTACT_METHOD:
        this.vendorContactMethod = SettingBaseModel.deserializeList(results);
        return this.vendorContactMethod;
      case SETTING_ID.SETTING_CONTACT_TYPE:
        this.vendorContactType = SettingBaseModel.deserializeList(results);
        return this.vendorContactType;
      case SETTING_ID.SETTINGS_CONTACT_STATUS:
        this.vendorContactStatus = SettingBaseModel.deserializeList(results);
        return this.vendorContactStatus;
      case SETTING_ID.SETTING_ACCESS_LEVEL:
        this.vendorAccessLevel = SettingBaseModel.deserializeList(results);
        return this.vendorAccessLevel;
      case SETTING_ID.SETTING_COMMUNICATION_SERVICE:
        this.vendorContactCommunicationService = SettingBaseModel.deserializeList(results);
        return this.vendorContactCommunicationService;
      case SETTING_ID.SETTING_USAGES_TYPE:
        this.vendorContactUsageType = SettingBaseModel.deserializeList(results);
        return this.vendorContactUsageType;
      case SETTING_ID.SETTING_ADDRESS_TYPE:
        this.vendorAddressType = SettingBaseModel.deserializeList(results);
        return this.vendorAddressType;
      case SETTING_ID.SETTING_DOCUMENT_NAME:
        this.vendorDocumentName = SettingBaseModel.deserializeList(results);
        const otherOption = this.vendorDocumentName.find(option => option.name.toLowerCase() === 'other');
        const filteredOptions = this.vendorDocumentName.filter(option => option.name.toLowerCase() !== 'other');
        this.vendorDocumentName = SettingBaseModel.deserializeList([ ...filteredOptions, otherOption ])
        return this.vendorDocumentName.filter(option => option.id !== undefined);        
      case SETTING_ID.SETTING_DOCUMENT_STATUS:
        this.vendorDocumentStatus = SettingBaseModel.deserializeList(results);
        return this.vendorDocumentStatus;
      case SETTING_ID.SETTINGS_VENDOR_LEVEL:
        this.vendorLevel = SettingBaseModel.deserializeList(results);
        return this.vendorLevel;
      case SETTING_ID.SETTINGS_CERTIFIED_MEMBER_FEE_SCHEDULE:
        this.certifiedMemberFeeSchedule = SettingBaseModel.deserializeList(results);
        return this.certifiedMemberFeeSchedule;
      case SETTING_ID.SETTINGS_PAYMENTS_OPTIONS:
        this.paymentOptions = SettingBaseModel.deserializeList(results);
        return this.paymentOptions;
      case SETTING_ID.SETTINGS_CREDIT_AVAILABLE:
        this.creditAvailable = SettingBaseModel.deserializeList(results);
        return this.creditAvailable;
      case SETTING_ID.SETTINGS_MAIN_SERVICE_OFFERED:
        this.mainServicesOffered = SettingBaseModel.deserializeList(results);
        return this.mainServicesOffered;
      case SETTING_ID.SETTINGS_OPERATON_TYPE:
        this.operationType = SettingBaseModel.deserializeList(results);
        return this.operationType;
      case SETTING_ID.SETTINGS_HOURS_TYPE:
        this.hoursType = SettingBaseModel.deserializeList(results);
        return this.hoursType;
      case SETTING_ID.SETTINGS_HOURS_SCHEDULE_TYPE:
        this.hoursScheduleType = SettingBaseModel.deserializeList(results);
        return this.hoursScheduleType;
      case SETTING_ID.SETTINGS_HOURS_STATUS:
        this.status = SettingBaseModel.deserializeList(results);
        return this.status;
      case SETTING_ID.SETTING_A2G_LOCATION_TYPE:
        this.a2GLocationType = SettingBaseModel.deserializeList(results);
        return this.a2GLocationType;
      case SETTING_ID.SETTING_APPROVAL_STATUS:
        this.approvalStatus = SettingBaseModel.deserializeList(results);
        return this.approvalStatus;
      case SETTING_ID.SETTING_DRIVER_LOCATION_CREW:
        this.pickupLocationCrew = SettingBaseModel.deserializeList(results);
        return this.pickupLocationCrew;
      case SETTING_ID.SETTING_DRIVER_LOCATION_PAX:
        this.pickupLocationPax = SettingBaseModel.deserializeList(results);
        return this.pickupLocationPax;
      case SETTING_ID.SETTING_AMENITIES:
        this.amenities = SettingBaseModel.deserializeList(results);
        return this.amenities;
      case SETTING_ID.SETTING_AIRCRAFT_PARKING_OPTIONS:
        this.aircraftParkingOptions = SettingBaseModel.deserializeList(results);
        return this.aircraftParkingOptions;
      case SETTING_ID.SETTING_AIRCRAFT_PARKING_DISTANCE_FBO:
        this.aircraftParkingDistanceFBO = SettingBaseModel.deserializeList(results);
        return this.aircraftParkingDistanceFBO;
      case SETTING_ID.SETTING_AIRCRAFT_SPOT_ACCOMMODATION:
        this.aircraftSpotAccommodation = SettingBaseModel.deserializeList(results);
        return this.aircraftSpotAccommodation;
      case SETTING_ID.SETTING_TOWBAR_SCENARIOS:
        this.towbarScenarios = SettingBaseModel.deserializeList(results);
        return this.towbarScenarios;
      case SETTING_ID.SETTING_INTERNATIONAL_DEPARTURE_PROCEDURES:
        this.internationalDepartureProcedures = SettingBaseModel.deserializeList(results);
        return this.internationalDepartureProcedures;
      case SETTING_ID.SETTING_INTERNATIONAL_ARRIVAL_PROCEDURES:
        this.internationalArrivalProcedures = SettingBaseModel.deserializeList(results);
        return this.internationalArrivalProcedures;
      case SETTING_ID.SETTING_AVAILABLE_FACILITIES:
        this.availableFacilities = SettingBaseModel.deserializeList(results);
        return this.availableFacilities;
      case SETTING_ID.SETTING_LUGGAGE_HANDLING:
        this.luggageHandling = SettingBaseModel.deserializeList(results);
        return this.luggageHandling;
      case SETTING_ID.SETTING_ARRIVAL_CREW_PAX_PASSPORT_HANDLING:
        this.arrivalCrewPaxPassportHandling = SettingBaseModel.deserializeList(results);
        return this.arrivalCrewPaxPassportHandling;
      case SETTING_ID.SETTING_DISABILITY_ACCOMMODATIONS:
        this.disabilityAccommodations = SettingBaseModel.deserializeList(results);
        return this.disabilityAccommodations;
      case SETTING_ID.SETTING_HANGER_AVAILABLE_UOM:
        this.hangerAvailableUom = SettingBaseModel.deserializeList(results);
        return this.hangerAvailableUom;
      case SETTING_ID.SETTING_ORDER_MANAGEMENT_SOFTWARE:
        this.orderManagementSoftware = SettingBaseModel.deserializeList(results);
        return this.orderManagementSoftware;
    }
  }

  public getSettings(
    settingId?: SETTING_ID,
    collectionName?: string,
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<SettingBaseModel>> {
    const http: HttpClient = new HttpClient({ headers: vendorManagementHeaders });
    const params: string = Utilities.buildParamString({
      // CollectionName: collectionName,
      pageNumber: 1,
      pageSize: 1000,
      ...pageRequest,
    });
    const settingEndPoint = SettingsUrlMapper[settingId];

    return http.get<SettingBaseModel>(`${baseApiPath.vendorManagementCoreUrl}/${settingEndPoint}?${params}`).pipe(
      map(response => {
        const parsedRes = this.getDeserializeList(response.results, settingId);
        return { ...response, results: parsedRes };
      })
    );
  }

  public upsertSetting<T>(payload: T, url: string, settingName: string): Observable<T> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const isNewRequest: boolean = !Boolean(payload.id);
    const upsertRequest: Observable<SettingBaseModel> = isNewRequest
      ? http.post<T>(`${baseApiPath.vendorManagementCoreUrl}/${url}`, payload)
      : http.put<T>(`${baseApiPath.vendorManagementCoreUrl}/${url}/${payload.id}`, payload);

    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info(`${settingName} saved successfully!`))
    );
  }

  public getVendorUserStatus(): Observable<SettingBaseModel[]> {
    const http: HttpClient = new HttpClient({ headers: vendorManagementHeaders });
    return http
      .get<any>(
        `
      ${baseApiPath.vendorManagementCoreUrl}/${apiUrls.status}`
      )
      .pipe(map(res => res.results))
      .pipe(tapWithAction(data => (this.status = SettingBaseModel.deserializeList(data))));
  }

  public getTrueAndFalseOption(){
    const options=SettingBaseModel.deserializeList([
      { id:'true',name:'True' },
      { id:'false',name:'False' }
    ]);
    this.trueAndFalseOption = options;
  }
}

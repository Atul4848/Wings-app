import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';
import { Logger } from '@wings-shared/security';
import { Airports, SettingBaseModel, VendorLocationModel, VendorManagmentModel } from '../Modules/Shared/Models';
import { IAPIAirport, IAPIVMSComparison, IAPIVMSVendorLocationComparison } from '../Modules/Shared/Interfaces';
import { AlertStore } from '@uvgo-shared/alert';
import { vendorManagementHeaders, refDataHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { ServiceItemPricingLocationModel } from '../Modules/Shared/Models/ServiceItemPricingLocation.model';
import { IAPIResponseVendorAddress } from '../Modules/Shared/Interfaces/Response/API-Response-VendorAddress';
import { VendorAddressModel } from '../Modules/Shared/Models/VendorAddress.model';
import { COLLECTION_NAMES } from '../Modules/Shared/Enums/CollectionName.enum';
import { VendorLocationAddressModel } from '../Modules/Shared/Models/VendorLocationAddress.model';
import { LocationOperationalEssentialModel } from '../Modules/Shared/Models/LocationOperationalEssential.model';
import { CustomersModel } from '../Modules/Shared/Models/Customers.model';
import { OperationInfoSettingOptionModel } from '../Modules/Shared/Models/OperationInfoSettingOptionModel.model';
import { LocationHoursModel } from '../Modules/Shared/Models/LocationHours.model';
import { LocationA2GModel } from '../Modules/Shared/Models/LocationA2G.model';
import {
  IAPIA2GFile,
  IAPIResponseGroundServiceProvider,
} from '../Modules/Shared/Interfaces/Response/API-Response-VendorLocation';
import { IAPIA2GAgentFile } from '../Modules/Shared/Interfaces/Request/API-Request-VendorLocationA2G.interface';
import { GroundServiceProviderModel } from '../Modules/Shared/Models/GroundServiceProvider.model';
import { RankAtAirportModel } from '../Modules/Shared/Models/RankAtAirport.model';
import { RankAtAirportMappingsModel } from '../Modules/Shared/Models/RankAtAirportMappings.model';

export class VendorLocationStore {
  @observable public airportList: Airports[] = [];
  @observable public selectedVendorLocation: VendorLocationModel;
  @observable public serviceItemPricingLocationList: ServiceItemPricingLocationModel[] = [];
  @observable public vendorLocationList: VendorLocationModel[] = [];
  @observable public vendorLocationRankingList: VendorLocationModel[] = [];
  @observable public groundServiceProvider: GroundServiceProviderModel[] = [];
  @observable public vendorLocationAddressesList: VendorLocationAddressModel[] = [];
  @observable public customersList: CustomersModel[] = [];
  @observable public isCreditFieldValid: boolean = true;
  @observable public agentDispatchedFromRequired: boolean = false;
  @observable public isCoordinatingOfficeRequired: boolean = false;
  @observable public isErroragentDispatchedAlertShowed: boolean = false;
  @observable public isErrorCoordinatingAlertShowed: boolean = false;
  @observable public locationHoursList: LocationHoursModel[] = [];
  @observable public is24Hours: boolean = false;
  @observable public isStartDateRequired: boolean = false;
  @observable public isEndDateRequired: boolean = false;
  @observable public isRecurrence: boolean = false;
  @observable public a2gFileUri: string = null;
  @observable public a2gAgentFileUri: string = null;
  @observable public file: File | null = null;
  @observable public documentUpdated: boolean = false;
  @observable public index: number;
  @observable public isOtherName: boolean = false;
  @observable public isAirportRequired: boolean = true;
  @observable public airportId: number | null = null;
  @observable public initialListData: RankAtAirportMappingsModel[] = [];
  @observable public isEditRank: boolean = false;
  @observable public isLeadOvertimeRequired: boolean = false;
  @observable public leadOvertimeValidate: string = '';

  @action public setAirportId(value: number) {
    this.airportId = value;
  }

  @action public setInitialListData(value: RankAtAirportMappingsModel[]) {
    this.initialListData = value;
  }

  @action public setIsEditRank(value: boolean) {
    this.isEditRank = value;
  }

  @action
  public getVMSComparison(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<VendorLocationModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorLocation',
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIVMSVendorLocationComparison>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,

      map(response => {
        this.vendorLocationList = VendorLocationModel.deserializeList(response.results);
        this.serviceItemPricingLocationList = this.vendorLocationList.map((item, index) => {
          return new ServiceItemPricingLocationModel({
            id: 0,
            vendorLocationId: item.id,
            vendorLocationName: `${item.name} 
              (${item.airportReference?.getDisplayCode()})`,
          });
        });
        return { ...response, results: this.vendorLocationList };
      })
    );
  }

  @action
  public getVMSRankingComparison(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<VendorLocationModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorLocation',
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIVMSVendorLocationComparison>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,

      map(response => {
        this.vendorLocationRankingList = VendorLocationModel.deserializeList(response.results);
        return { ...response, results: this.vendorLocationList };
      })
    );
  }

  @action
  public getVmsIcaoCode(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<IAPIAirport>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData, headers: refDataHeaders });
    const params: string = Utilities.buildParamString({
      CollectionName: 'Airport',
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<IAPIAirport>>(`/${apiUrls.refData}?${params}`).pipe(
      tapWithAction(response => (this.airportList = response.results.map((item, index) => Airports.deserialize(item)))),
      map(response => VendorLocationModel.deserialize(response))
    );
  }

  @action
  public getVendorLocationHours(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<VendorLocationModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'VendorLocation',
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => {
        this.locationHoursList = LocationHoursModel.deserializeList(response.results[0].vendorLocationHours);
        return { ...response, results: this.locationHoursList };
      })
    );
  }

  @action
  public getVendorLocationA2GById(id?: number): Observable<IAPIVMSComparison> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`/${apiUrls.vendorLocationA2G}/${id}`).pipe(
      Logger.observableCatchError,
      map(response => LocationA2GModel.deserialize(response))
    );
  }

  @action
  public getVendorLocationById(id?: number): Observable<IAPIVMSComparison> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });

    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`${apiUrls.vendorLocation}/${id}`).pipe(
      Logger.observableCatchError,
      map(response => VendorLocationModel.deserialize(response))
    );
  }

  @action
  public upsertVendorLocation(payload: VendorLocationModel): Observable<VendorLocationModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<VendorLocationModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocation}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocation}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor Location data saved successfully!')),
      map(response => VendorLocationModel.deserialize(response))
    );
  }

  @action
  public upsertVendorLocationA2G(payload: LocationA2GModel): Observable<LocationA2GModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<LocationA2GModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationA2G}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationA2G}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor Location A2G data saved successfully!')),
      map(response => LocationA2GModel.deserialize(response))
    );
  }

  @action
  public downloadA2GAgentFile(
    vendorLocationId: number,
    a2GAgentId: number,
    documentUri: number
  ): Observable<IAPIA2GAgentFile> {
    const data = {
      vendorLocationId,
      a2GAgentId,
      documentUri,
    };
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<IAPIA2GAgentFile>(`${apiUrls.vendorLocationA2G}/DownloadAgentPDF`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response.results }))
    );
  }

  @action
  public downloadA2GLocationFile(
    vendorLocationId: number,
    documentId: number,
    documentUri: number
  ): Observable<IAPIA2GAgentFile> {
    const data = {
      vendorLocationId,
      documentId,
      documentUri,
    };
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<IAPIA2GAgentFile>(`${apiUrls.vendorLocationA2G}/Download`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response.results }))
    );
  }

  @action
  public upsertVendorLocationHour(payload: LocationHoursModel): Observable<LocationHoursModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<LocationHoursModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationHours}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationHours}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor Location Hour saved successfully!')),
      map(response => LocationHoursModel.deserialize(response))
    );
  }

  public searchAirport = (searchKey: string): void => {
    const pageRequest: IAPIGridRequest = {
      searchCollection: JSON.stringify([
        { propertyName: 'Name', propertyValue: searchKey },
        { propertyName: 'ICAOCode.Code', propertyValue: searchKey, operator: 'or' },
        { propertyName: 'UWACode', propertyValue: searchKey, operator: 'or' },
        { propertyName: 'FAACode', propertyValue: searchKey, operator: 'or' },
        { propertyName: 'IATACode', propertyValue: searchKey, operator: 'or' },
        { propertyName: 'RegionalCode', propertyValue: searchKey, operator: 'or' },
        { propertyName: 'DisplayCode', propertyValue: searchKey, operator: 'or' },
      ]),
    };
    this.getVmsIcaoCode(pageRequest).subscribe();
  };

  @action
  public getVMSLocationAddresses(
    pageRequest?: IAPIGridRequest,
    collectionName?: COLLECTION_NAMES
  ): Observable<IAPIPageResponse<VendorAddressModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: collectionName,
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIResponseVendorAddress>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,

      map(response => {
        this.vendorLocationAddressesList = VendorLocationAddressModel.deserializeList(response.results);
        return { ...response, results: this.vendorLocationAddressesList };
      })
    );
  }

  @action
  public upsertVendorLocationAddress(payload: VendorLocationAddressModel): Observable<VendorLocationAddressModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<VendorLocationAddressModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationAddress}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationAddress}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor Location Address data saved successfully!')),
      map(response => VendorLocationAddressModel.deserialize(response))
    );
  }

  @action
  public removVendorLocationAddress(vendorLocationAddressId: number): Observable<string> {
    const payload = {
      userId: 'string',
      vendorLocationAddressId,
    };
    const http = new HttpClient({ headers: vendorManagementHeaders });
    return http.delete<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationAddress}`, payload).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Vendor Address data deleted successfully!'))
    );
  }

  @action
  public getOperationalEssentialSettingOptions<T>(models: T[], settingName: string) {
    const settingOptions: OperationInfoSettingOptionModel[] = [];
    models.forEach(model => {
      const settingOption: OperationInfoSettingOptionModel = new OperationInfoSettingOptionModel();
      settingOption.id = 0;
      settingOption.operationalEssentialId = 0;
      settingOption[settingName] = model;
      settingOptions.push(settingOption);
    });
    return settingOptions;
  }

  @action
  public getLocationOperationalEssentialById(id?: number): Observable<IAPIVMSComparison> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    return http.get<IAPIPageResponse<IAPIVMSComparison>>(`/${apiUrls.operationalEssential}/${id}`).pipe(
      Logger.observableCatchError,
      map(response => LocationOperationalEssentialModel.deserialize(response))
    );
  }

  @action
  public upsertVendorLocationOperationalEssential(
    payload: LocationOperationalEssentialModel
  ): Observable<LocationOperationalEssentialModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<LocationOperationalEssentialModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.operationalEssential}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.operationalEssential}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Operational Essential data saved successfully!')),
      map(response => LocationOperationalEssentialModel.deserialize(response))
    );
  }
  
  @action
  public upsertRankAtAirport(payload: RankAtAirportModel): Observable<RankAtAirportModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    const upsertRequest: Observable<RankAtAirportModel> = http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationUpsertRankAtAirport}`, payload)
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Airport rank data updated successfully!')),
      map(response => RankAtAirportModel.deserialize(response))
    );
  }

  @action
  public getCustomers(pageRequest?: IAPIGridRequest): Observable<IAPIPageResponse<CustomersModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData, headers: refDataHeaders });
    const params: string = Utilities.buildParamString({
      CollectionName: 'Customer',
      ...pageRequest,
    });
    return http.get<IAPIPageResponse<CustomersModel>>(`/${apiUrls.refData}?${params}`).pipe(
      tapWithAction(
        response => (this.customersList = response.results.map((item, index) => CustomersModel.deserialize(item)))
      ),
      map(response => CustomersModel.deserialize(response))
    );
  }

  @action
  public deleteVendorLocationHour(vendorLocationHoursId: number): Observable<string> {
    const payload = {
      userId: 'string',
      vendorLocationHoursId,
    };
    const http = new HttpClient({ headers: vendorManagementHeaders });
    return http.delete<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocationHours}`, payload).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Vendor Location Hour deleted successfully!'))
    );
  }

  @action
  public deleteVendorLocation(vendorLocationId: number): Observable<string> { 
    const http = new HttpClient({ headers: vendorManagementHeaders });
    return http.delete<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.vendorLocation}/${vendorLocationId}`).pipe(
      Logger.observableCatchError,
      map((response: any) => response),
      tap(() => AlertStore.info('Vendor Location deleted successfully!'))
    );
  }

  @action
  public imporA2GFile(file: File, id: string): Observable<IAPIA2GFile> {
    const data: FormData = new FormData();
    data.append('vendorLocationId', id);
    data.append('document', file);
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<IAPIA2GFile>(`${apiUrls.vendorLocationA2G}/upload`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response })),
      tapWithAction(response => (this.a2gFileUri = response))
    );
  }

  @action
  public imporA2GAgentFile(file: File, id: string): Observable<IAPIA2GFile> {
    const data: FormData = new FormData();
    data.append('vendorLocationId', id);
    data.append('document', file);
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementCoreUrl,
      headers: vendorManagementHeaders,
    });
    return http.post<IAPIA2GFile>(`${apiUrls.vendorLocationA2G}/uploadAgentPDF`, data).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: response })),
      tapWithAction(response => (this.a2gAgentFileUri = response))
    );
  }

  @action
  public getVMSGroundServiceProvider(
    pageRequest?: IAPIGridRequest
  ): Observable<IAPIPageResponse<GroundServiceProviderModel>> {
    const http: HttpClient = new HttpClient({
      baseURL: baseApiPath.vendorManagementNoSqlUrl,
      headers: vendorManagementHeaders,
    });
    const params: string = Utilities.buildParamString({
      CollectionName: 'GroundServiceProvider',
      ...pageRequest,
    });

    return http.get<IAPIPageResponse<IAPIResponseGroundServiceProvider>>(`${apiUrls.vendorManagement}?${params}`).pipe(
      Logger.observableCatchError,

      map(response => {
        this.groundServiceProvider = GroundServiceProviderModel.deserializeList(response.results);
        return { ...response, results: this.groundServiceProvider };
      })
    );
  }

  @action
  public upsertVendorLocationGroundServiceProvider(
    payload: GroundServiceProviderModel
  ): Observable<GroundServiceProviderModel> {
    const http = new HttpClient({ headers: vendorManagementHeaders });
    payload.id = payload.id === null ? 0 : payload.id;
    const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
    const upsertRequest: Observable<GroundServiceProviderModel> = isNewRequest
      ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.groundServiceProvider}`, payload)
      : http.put<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.groundServiceProvider}/${payload.id}`, payload);
    return upsertRequest.pipe(
      Logger.observableCatchError,
      tap(() => AlertStore.info('Vendor Location Ground Service Provider saved successfully!')),
      map(response => GroundServiceProviderModel.deserialize(response))
    );
  }

  @action
  public getVendorLocationBackNavLink = params =>
    params.operationCode === 'upsert'
      ? '/vendor-management/vendor-location'
      : `/vendor-management/upsert/${params.vendorId}/${params.operationCode}/edit/vendor-location`;
}


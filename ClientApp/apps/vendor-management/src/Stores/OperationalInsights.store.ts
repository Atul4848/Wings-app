import { HttpClient, baseApiPath } from '@wings/shared';
import { observable, action } from 'mobx';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIPageResponse } from '@wings-shared/core';
import { vendorManagementHeaders } from './Base.store';
import { apiUrls } from './API.url';
import { 
  OperationInsightsSettingOptionModel 
} from '../Modules/Shared/Models/OperationInsightsSettingOptionModel.model';
import { IAPIVMSComparison } from '../Modules/Shared/Interfaces';
import { LocationOperationalInsightsModel } from '../Modules/Shared';

export class OperationalInsightsStore {
    @observable isCountryReferenceRequired:boolean=false;

    @action
    public getLocationOperationalInsightsById(id?: number): Observable<IAPIVMSComparison> {
      const http: HttpClient = new HttpClient({
        baseURL: baseApiPath.vendorManagementNoSqlUrl,
        headers: vendorManagementHeaders,
      });
      return http.get<IAPIPageResponse<IAPIVMSComparison>>(`/${apiUrls.operationalInformation}/${id}`).pipe(
        Logger.observableCatchError,
        map(response => LocationOperationalInsightsModel.deserialize(response))
      );
    }
    
    @action
    public getOperationalInsightsSettingOptions<T>(models: T[], settingName: string) {
      const settingOptions: OperationInsightsSettingOptionModel[] = [];
      models.forEach(model => {
        const settingOption: OperationInsightsSettingOptionModel = new OperationInsightsSettingOptionModel();
        settingOption.id = 0;
        settingOption.operationalInsightId = 0;
        settingOption[settingName] = model;
        settingOptions.push(settingOption);
      });
      return settingOptions;
    }

    @action
    public upsertVendorLocationOperationalInsights(
      payload: LocationOperationalInsightsModel
    ): Observable<LocationOperationalInsightsModel> {
      const http = new HttpClient({ headers: vendorManagementHeaders });
      payload.id = payload.id === null ? 0 : payload.id;
      const isNewRequest: boolean = !(payload.id != null && payload.id !== 0);
      const upsertRequest: Observable<LocationOperationalInsightsModel> = isNewRequest
        ? http.post<any>(`${baseApiPath.vendorManagementCoreUrl}/${apiUrls.operationalInsight}`, payload)
        : http.put<any>(
          `${baseApiPath.vendorManagementCoreUrl}/${apiUrls.operationalInsight}/${payload.id}`,
          payload
        );
      return upsertRequest.pipe(
        Logger.observableCatchError,
        tap(() => AlertStore.info('Operational Insight data saved successfully!')),
        map(response => LocationOperationalInsightsModel.deserialize(response))
      );
    }

}

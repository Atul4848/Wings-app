import { baseApiPath, HttpClient, SettingsBaseStore } from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AircraftRegistryModel, RegistrySequenceBaseModel } from '../Models';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';
import { tapWithAction, Utilities } from '@wings-shared/core';

export class AircraftRegistryStore extends SettingsBaseStore {
  @observable public equipments: RegistrySequenceBaseModel[] = [];

  constructor() {
    super(baseApiPath.aircraft);
  }

  /* istanbul ignore next */
  public getAircraftRegistries(): Observable<AircraftRegistryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get(`${apiUrls.aircraftRegistry}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AircraftRegistryModel.deserializeList(response?.results))
    );
  }

  /* istanbul ignore next */
  public getAircraftRegistryById(id: number): Observable<AircraftRegistryModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const params: string = Utilities.buildParamString({
      pageSize: 0,
    });
    return http.get<AircraftRegistryModel>(`${apiUrls.aircraftRegistryById(id)}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AircraftRegistryModel.deserialize(response))
    );
  }

  /* istanbul ignore next */
  public getEquipments(forceRefresh?: boolean): Observable<RegistrySequenceBaseModel[]> {
    return this.getResult(
      apiUrls.equipment,
      this.equipments,
      forceRefresh,
      RegistrySequenceBaseModel.deserializeList
    ).pipe(tapWithAction(equipments => (this.equipments = equipments)));
  }
}

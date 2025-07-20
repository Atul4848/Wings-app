import {
  HttpClient,
  IAPIRegion,
  RegionModel,
  baseApiPath,
  BaseStore,
} from '@wings/shared';
import { apiUrls } from './API.url';
import { AssociatedRegionModel } from '../Models';
import { tap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AlertStore } from '@uvgo-shared/alert';
import { IAPIAssociatedRegion, IAPIAssociatedRegionRequest } from '../Interfaces';
import { observable } from 'mobx';
import { Logger } from '@wings-shared/security';
import { IAPIPageResponse, Utilities } from '@wings-shared/core';

export class RegionStore extends BaseStore {
  @observable public regions: RegionModel[] = [];

  /* istanbul ignore next */
  public getRegions(regionTypeId?: number | null, forceRefresh?: boolean): Observable<RegionModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    if (this.regions.length && !forceRefresh) {
      return of(this.regions);
    }

    const filterCollection = regionTypeId ? { filterCollection: JSON.stringify([{ regionTypeId }]) } : null;
    const params = Utilities.buildParamString({
      pageSize: 0,
      ...filterCollection,
    });

    return http.get<IAPIPageResponse<IAPIRegion>>(`${apiUrls.region}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => Utilities.customArraySort<RegionModel>(RegionModel.deserializeList(response.results), 'name')),
      tap(response => (this.regions = response))
    );
  }

  /* istanbul ignore next */
  public upsertRegion(region: RegionModel): Observable<RegionModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const isAddRegion: boolean = region.id === 0;
    const upsertRequest: Observable<IAPIRegion> = isAddRegion
      ? http.post<IAPIRegion>(apiUrls.region, region.serialize())
      : http.put<IAPIRegion>(`${apiUrls.region}/${region.id}`, region.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIRegion) => RegionModel.deserialize(response)),
      tap(() => AlertStore.info(`Region ${isAddRegion ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getAssociatedRegions(regionId?: number | null, countryId?: number): Observable<AssociatedRegionModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const params = Utilities.buildParamString({
      pageSize: 0,
      ...Utilities.filters({ regionId, countryId }),
    });
    return http.get<IAPIPageResponse<IAPIAssociatedRegion>>(`${apiUrls.associatedRegion}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AssociatedRegionModel.deserializeList(response.results))
    );
  }
  /* istanbul ignore next */
  public upsertAssociatedRegion(associatedRegion: AssociatedRegionModel): Observable<AssociatedRegionModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.countries });
    const isAddAssociatedRegion: boolean = associatedRegion.id === 0;
    const upsertRequest: Observable<IAPIAssociatedRegion> = isAddAssociatedRegion
      ? http.post<IAPIAssociatedRegion>(apiUrls.associatedRegion, associatedRegion.serialize())
      : http.put<IAPIAssociatedRegion>(`${apiUrls.associatedRegion}/${associatedRegion.id}`, associatedRegion.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIAssociatedRegion) => AssociatedRegionModel.deserialize(response)),
      tap(() => AlertStore.info(`Associated Region ${isAddAssociatedRegion ? 'created' : 'updated'} successfully!`))
    );
  }
}

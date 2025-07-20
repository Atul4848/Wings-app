import { Observable, of } from 'rxjs';
import { IAPIUpsertUVGOBannerRequest } from '../Interfaces';
import { UVGOBannerModel, UVGOBannerTypeModel, UVGOBannerServicesModel } from '../Models';
import { UVGOBannerStore } from '../Stores';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class UVGOBannerStoreMock extends UVGOBannerStore {
  public uvgoBanners(request?: IAPIGridRequest): Observable<IAPIPageResponse<UVGOBannerModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 1,
      results: [ new UVGOBannerModel(), new UVGOBannerModel() ],
    })
  }

  public upsertUVGOBanner(request: IAPIUpsertUVGOBannerRequest): Observable<UVGOBannerModel> {
    return of(new UVGOBannerModel());
  }

  public deleteUVGOBanner(Id: string): Observable<boolean> {
    return of(true);
  }

  public uvgoBannerType(): Observable<UVGOBannerTypeModel[]> {
    return of([ new UVGOBannerTypeModel({ name: 'test' }), new UVGOBannerTypeModel() ])
  }

  public upsertUVGOBannerType(request: UVGOBannerTypeModel): Observable<UVGOBannerTypeModel> {
    return of(new UVGOBannerTypeModel());
  }

  public deleteUVGOBannerType(Id: number): Observable<boolean> {
    return of(true);
  }

  public uvgoBannerServices(): Observable<UVGOBannerServicesModel[]> {
    return of([ new UVGOBannerServicesModel({ name: 'test' }), new UVGOBannerServicesModel() ])
  }

  public upsertUVGOBannerServices(request: UVGOBannerServicesModel): Observable<UVGOBannerServicesModel> {
    return of(new UVGOBannerServicesModel());
  }

  public deleteUVGOBannerServices(Id: number): Observable<boolean> {
    return of(true);
  }
}
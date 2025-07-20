import { baseApiPath, HttpClient, NO_SQL_COLLECTIONS, BaseStore } from '@wings/shared';
import { observable } from 'mobx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IAPIAircraftVariation, IAPIAircraftVariationPicture } from '../Interfaces';
import { AircraftVariationModel, AircraftVariationPictureModel } from '../Models';
import { apiUrls } from './API.url';
import { AlertStore } from '@uvgo-shared/alert';
import { Logger } from '@wings-shared/security';
import { IAPIGridRequest, IAPIPageResponse, Utilities, tapWithAction } from '@wings-shared/core';

export class AircraftVariationStore extends BaseStore {
  @observable public aircraftVariations: AircraftVariationModel[] = [];

  /* istanbul ignore next */
  public getAircraftVariations(request?: IAPIGridRequest): Observable<IAPIPageResponse<AircraftVariationModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.AIRCRAFT_VARIATION,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIAircraftVariation>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: AircraftVariationModel.deserializeList(response.results) })),
      tap(response => (this.aircraftVariations = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertAircraftVariation(request: AircraftVariationModel): Observable<AircraftVariationModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    const isNewRequest: boolean = request.id === 0;
    const upsertRequest: Observable<IAPIAircraftVariation> = isNewRequest
      ? http.post<IAPIAircraftVariation>(apiUrls.aircraftVariation, request.serialize())
      : http.put<IAPIAircraftVariation>(`${apiUrls.aircraftVariation}/${request.id}`, request.serialize());

    return upsertRequest.pipe(
      map((response: IAPIAircraftVariation) => AircraftVariationModel.deserialize(response)),
      tap(() => AlertStore.info(`Aircraft Variation ${isNewRequest ? 'created' : 'updated'} successfully!`))
    );
  }

  /* istanbul ignore next */
  public getAircraftVariationById(request?: IAPIGridRequest): Observable<AircraftVariationModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 0,
      collectionName: NO_SQL_COLLECTIONS.AIRCRAFT_VARIATION,
      ...request,
    });
    return http.get<IAPIPageResponse<IAPIAircraftVariation>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => AircraftVariationModel.deserialize(response.results[0]))
    );
  }

  /* istanbul ignore next */
  public uploadAircraftVariationPicture(file: File, id: number): Observable<AircraftVariationPictureModel> {
    const data: FormData = new FormData();
    data.append('picture', file);
    data.append('aircraftVariationId', id.toString());
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft, headers: { HasFile: true } });
    return http.post<IAPIAircraftVariationPicture>(apiUrls.aircraftVariationPicture, data).pipe(
      Logger.observableCatchError,
      map(response => {
        const result = AircraftVariationPictureModel.deserialize({ id: 0, url: response });
        return result;
      })
    );
  }

  /* istanbul ignore next */
  public validateUnique(request: AircraftVariationModel): Observable<{ isValid: boolean }> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http.post(apiUrls.aircraftVariationValidate, request.serialize());
  }

  /* istanbul ignore next */
  public deleteAircraftVariationRecord(id: number): Observable<string> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.aircraft });
    return http.delete<string>(`${apiUrls.aircraftVariation}/${id}`).pipe(
      Logger.observableCatchError,
      map(() => 'Aircraft Variation Record deleted successfully!'),
      tap(response => AlertStore.info(response))
    );
  }
}

import { Observable, of } from 'rxjs';
import { AUTHORIZATION_LEVEL } from '../Enums';
import { HealthVendorModel } from '../Models';
import { HealthVendorStore } from '../Stores';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, SettingsTypeModel } from '@wings-shared/core';

export class HealthVendorStoreMock extends HealthVendorStore {

  public getHealthVendors(forceRefresh?: boolean): Observable<IAPIPageResponse<HealthVendorModel>> {
    const results: HealthVendorModel[] = [
      new HealthVendorModel({
        id: 2,
        authorizationLevel: new SettingsTypeModel({ id: 1 }),
        name: 'test',
      }),
    ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results }).pipe(
      tapWithAction(response => (this.healthVendors = response.results))
    );
  }

  public upsertHealthVendor(request: HealthVendorModel): Observable < HealthVendorModel > {
    return of(new HealthVendorModel());
  }

  public getHealthVendorById(request?: IAPIGridRequest): Observable<IAPIPageResponse<HealthVendorModel>> {
    const authorizationLevel = new SettingsTypeModel({ name: AUTHORIZATION_LEVEL.COUNTRY });
    const results: HealthVendorModel[] = [ new HealthVendorModel({ authorizationLevel }) ];
    return of({ pageNumber: 1, pageSize: 30, totalNumberOfRecords: 2, results })
  }

  /* istanbul ignore next */
  public getContactLevels(forceRefresh ?: boolean): Observable < SettingsTypeModel[] > {
    return of([ new SettingsTypeModel() ])
  }

  public upsertContactLevels(request: SettingsTypeModel): Observable<SettingsTypeModel> {
    return of(new SettingsTypeModel());
  }
}

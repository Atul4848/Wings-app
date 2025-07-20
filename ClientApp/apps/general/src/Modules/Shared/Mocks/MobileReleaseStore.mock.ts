import { Observable, of } from 'rxjs';
import { IAPIUpsertMobileReleaseRequest } from '../Interfaces';
import { MobileReleaseModel } from '../Models';
import { MobileReleaseStore } from '../Stores';

export class MobileReleaseStoreMock extends MobileReleaseStore {
  public getMobileRelease(): Observable<MobileReleaseModel[]> {
    return of([ new MobileReleaseModel(), new MobileReleaseModel() ])
  }

  public upsertRelease(mobileRelease: IAPIUpsertMobileReleaseRequest): Observable<MobileReleaseModel> {
    return of(new MobileReleaseModel());
  }

  public deleteRelease(mobileReleaseId: number): Observable<boolean> {
    return of(true);
  }
}
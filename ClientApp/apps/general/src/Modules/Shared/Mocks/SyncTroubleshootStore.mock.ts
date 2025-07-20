import { Observable, of } from 'rxjs';
import { SyncTroubleshootStore } from '../Stores';

export class SyncTroubleshootStoreMock extends SyncTroubleshootStore {
  triggerCachedCustomerNumber(customerNumber: string): Observable<string> {
    return of('');
  }

  triggerCachedTripNumber(tripNumber: number): Observable<any> {
    return of('');
  }

  triggerCachedTripId(tripId: number): Observable<any> {
    return of('');
  }

  triggerCacheReload(): Observable<any> {
    return of('');
  }

  triggerSyncInformation(tripNumber: number): Observable<any> {
    return of('');
  }

  triggerLoadHistoryJob(): Observable<any> {
    return of('');
  }

  clearCacheTrips(customerNumber: string): Observable<any> {
    return of('');
  }

  triggerArchiveLoadTripsJob(): Observable<any> {
    return of('');
  }

  clearAirportsCache(): Observable<any> {
    return of('');
  }

  triggerCompletedTripsReload(): Observable<any> {
    return of('');
  }

  triggerCsdLookupJob(): Observable<any> {
    return of('');
  }

  triggerAPGRegistriesJob(): Observable<any> {
    return of('');
  }

  triggerSyncTrip(tripNumber: number, username: string): Observable<any> {
    return of('');
  }
  
  refreshUserTripsByUsername(username: string): Observable<any> {
    return of('');
  }
}

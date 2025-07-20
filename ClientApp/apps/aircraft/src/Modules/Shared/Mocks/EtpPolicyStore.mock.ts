import { EtpPolicyStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { EtpPolicyModel } from '../Models';
import { tap } from 'rxjs/operators';

export class EtpPolicyStoreMock extends EtpPolicyStore {
  public getEtpPolicies(): Observable<EtpPolicyModel[]> {
    return of([ new EtpPolicyModel() ]).pipe(tap(etpPolicies => (this.etpPolicies = etpPolicies)));
  }

  public upsertEtpPolicy(request: EtpPolicyModel): Observable<EtpPolicyModel> {
    return of(new EtpPolicyModel());
  }

  public getEtpPolicyById(): Observable<EtpPolicyModel> {
    return of(new EtpPolicyModel({ etpScenarios: [] }));
  }
}

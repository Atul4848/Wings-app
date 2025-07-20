import { EtpScenarioStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { EtpPenaltyModel, EtpScenarioDetailModel, EtpScenarioModel } from '../Models';
import { SettingsTypeModel } from '@wings-shared/core';
import { tap } from 'rxjs/operators';

export class EtpScenarioStoreMock extends EtpScenarioStore {
  public getEtpScenarios(): Observable<EtpScenarioModel[]> {
    return of([ new EtpScenarioModel(), new EtpScenarioModel() ]).pipe(
      tap(etpScenarios => (this.etpScenarios = etpScenarios))
    );
  }

  public getEtpScenarioById(id: number): Observable<EtpScenarioDetailModel> {
    return of(
      new EtpScenarioDetailModel({
        id: 1,
        etpPenalties: [ new EtpPenaltyModel({ etpPenaltyCategory: new SettingsTypeModel({ id: 1 }) }) ],
      })
    );
  }

  public upsertEtpScenarioDetail(request: EtpScenarioDetailModel): Observable<EtpScenarioDetailModel> {
    return of(new EtpScenarioDetailModel());
  }
}

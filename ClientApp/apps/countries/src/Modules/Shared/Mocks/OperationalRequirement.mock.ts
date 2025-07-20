import { OperationalRequirementStore } from '../Stores';
import { Observable, of } from 'rxjs';
import {
  CabotageModel,
  FlightPlanningModel,
  GeneralModel,
  IAPICabotage,
  IAPIFlightPlanning,
  IAPIGeneral,
} from '@wings/shared';

export class OperationalRequirementStoreMock extends OperationalRequirementStore {
  public getCabotage(request?: IAPICabotage): Observable<CabotageModel> {
    return of(new CabotageModel());
  }

  public getGeneral(request?: IAPIGeneral): Observable<GeneralModel> {
    return of(new GeneralModel());
  }

  public getFlightPlanning(request?: IAPIFlightPlanning): Observable<FlightPlanningModel> {
    return of(new FlightPlanningModel());
  }

  public upsertRequirement(request): Observable<any> {
    return of({});
  }
  
}

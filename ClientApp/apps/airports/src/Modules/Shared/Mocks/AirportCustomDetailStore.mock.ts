import { Observable, of } from 'rxjs';
import { IAPIAirportCustomGeneralRequest } from '../Interfaces';
import { AirportCustomDetailStore } from '../Stores';
import { AirportCustomGeneralModel, CustomsContactModel, IntlCustomsDetailsModel } from '../Models';

export class AirportCustomDetailStoreMock extends AirportCustomDetailStore {
  public upsertGeneral(request: IAPIAirportCustomGeneralRequest): Observable<AirportCustomGeneralModel> {
    return of(new AirportCustomGeneralModel());
  }

  public upsertIntlCustomsInfo(request: IntlCustomsDetailsModel): Observable<IntlCustomsDetailsModel> {
    return of(new IntlCustomsDetailsModel());
  }

  public upsertCustomsContact(request: CustomsContactModel): Observable<CustomsContactModel> {
    return of(new CustomsContactModel());
  }
}

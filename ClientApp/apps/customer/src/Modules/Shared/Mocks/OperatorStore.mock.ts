import { OperatorStore } from '../Stores';
import { Observable, of } from 'rxjs';
import { AssociatedOperatorsModel, OperatorModel } from '../Models';
import { NO_SQL_COLLECTIONS } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class OperatorStoreMock extends OperatorStore {
  public getOperatorsNoSql(request?: IAPIGridRequest): Observable<IAPIPageResponse<OperatorModel>> {
    return of({
      collectionName: NO_SQL_COLLECTIONS.OPERATOR,
      pageNumber: 1,
      pageSize: 30,
      totalNumberOfRecords: 2,
      results: [ new OperatorModel(), new OperatorModel() ],
    });
  }

  public getOperators(): Observable<OperatorModel[]> {
    return of([ new OperatorModel(), new OperatorModel() ]);
  }

  public upsertOperator(operator: OperatorModel): Observable<OperatorModel> {
    return of(new OperatorModel());
  }

  public getOperatorById(operatorId: number): Observable<OperatorModel> {
    return of(new OperatorModel());
  }

  public getAssociatedOperators(
    customerNumber: string,
    request: IAPIGridRequest
  ): Observable<AssociatedOperatorsModel[]> {
    return of([ new AssociatedOperatorsModel(), new AssociatedOperatorsModel() ]);
  }

  public upsertAssociatedOperator(
    associatedOperator: AssociatedOperatorsModel,
    partyId: number
  ): Observable<AssociatedOperatorsModel> {
    return of(new AssociatedOperatorsModel());
  }
}

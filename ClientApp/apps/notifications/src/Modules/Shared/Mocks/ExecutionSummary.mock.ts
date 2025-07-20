import { Observable, of } from 'rxjs';
import { ExecutionSummaryModel } from '../Models';
import { ExecutionSummaryStore } from '../Stores';

export class ExecutionSummaryStoreMock extends ExecutionSummaryStore {
  public getExecutionSummary(): Observable<ExecutionSummaryModel[]> {
    return of([ new ExecutionSummaryModel(), new ExecutionSummaryModel() ])
  }

  public getExecutionSummaryByEventId(eventId: number): Observable<ExecutionSummaryModel> {
    return of(new ExecutionSummaryModel())
  }
}
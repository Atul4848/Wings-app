import { Observable, of } from 'rxjs';
import { ReportSummaryModel } from '../Models';
import { ReportSummaryStore } from '../Stores';

export class ReportSummaryStoreMock extends ReportSummaryStore {
  public getReportSummary(): Observable<ReportSummaryModel[]> {
    return of([ new ReportSummaryModel(), new ReportSummaryModel() ])
  }
}
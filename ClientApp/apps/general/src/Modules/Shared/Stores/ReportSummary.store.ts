import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { IAPIReportSummary } from '../Interfaces';
import { ReportSummaryModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';
import { Utilities } from '@wings-shared/core';

export class ReportSummaryStore extends BaseStore {

  /* istanbul ignore next */
  public getReportSummary(): Observable<ReportSummaryModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIReportSummary[]>>(apiUrls.reportSummary).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIReportSummary[]>) =>
        Utilities.customArraySort<ReportSummaryModel>
        (ReportSummaryModel.deserializeList(response.Data), 'appName'))
    )
  }
}
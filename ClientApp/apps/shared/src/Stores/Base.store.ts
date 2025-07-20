import { Observable, Subject } from 'rxjs';
import { action } from 'mobx';
import { HttpClient } from '../Tools';
import { PROGRESS_TYPES } from '@uvgo-shared/progress';
import { AlertStore, ALERT_TYPES, IAlert } from '@uvgo-shared/alert';
import { apiUrls } from './ApiUrls';
import { map } from 'rxjs/operators';
import { AuditHistoryModel, IAPIAuditHistory, IAPIPageResponse, Utilities, Loader } from '@wings-shared/core';

export class BaseStore {
  // TODO: ADD PROTECTED
  readonly reset$: Subject<boolean> = new Subject();
  public loader: Loader = new Loader(false, { type: PROGRESS_TYPES.LINEAR });

  @action
  public reset(): void {
    this.reset$.next(true);
  }

  protected showAlertCritical(message: string, id: string): void {
    const alert: IAlert = {
      id,
      message,
      type: ALERT_TYPES.CRITICAL,
      hideAfter: 5000,
    };
    AlertStore.removeAlert(id);
    AlertStore.showAlert(alert);
  }

  /* istanbul ignore next */
  public loadAuditHistory(id: number, entityName: string, baseURL
  : string, schemaName: string, headers: { [key: string]: string })
  : Observable<AuditHistoryModel[]> {
    const params: string = Utilities.buildParamString({
      pageSize: 0,
      FilterCollection: JSON.stringify([{ id, entityName, schemaName }]),
    });

    const http: HttpClient = new HttpClient({ 
      baseURL: baseURL,
      headers: headers
    });
    return http
      .get<IAPIPageResponse<IAPIAuditHistory>>(`${apiUrls.audit}?${params}`)
      .pipe(
        map(response => Utilities.getAuditHistoryData(
          AuditHistoryModel.deserializeList(response.results),
          [ 1 ],
          false)
        )
      );
  }
}

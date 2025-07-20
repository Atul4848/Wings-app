import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemMessageModel, SystemMessageTypeModel } from '../Models';
import { SystemMessageStore } from '../Stores';

export class SystemMessageStoreMock extends SystemMessageStore {
  public getSystemMessageTypes(): Observable<SystemMessageTypeModel[]> {
    return of([ new SystemMessageTypeModel(), new SystemMessageTypeModel() ]).pipe(
      tap(systemMessageTypes => (this.systemMessageTypes = systemMessageTypes))
    );
  }

  public getSystemMessages(): Observable<SystemMessageModel[]> {
    return of([ new SystemMessageModel(), new SystemMessageModel() ]).pipe(
      tap(systemMessages => (this.systemMessages = systemMessages))
    );
  }

  public removeSystemMessage({ id }: SystemMessageModel): Observable<boolean> {
    return of(true);
  }

  public upsertSystemMessage(systemMessage: SystemMessageModel): Observable<SystemMessageModel> {
    return of(new SystemMessageModel());
  }
}

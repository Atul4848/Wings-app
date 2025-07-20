import { baseApiPath, BaseStore, HttpClient } from '@wings/shared';
import { Observable } from 'rxjs';
import { apiUrls } from './API.url';
import { map } from 'rxjs/operators';
import { IAPIActiveUserMapping } from '../Interfaces';
import { ActiveUserModel } from '../Models';
import { IAPIResponse } from '@wings/airport-logistics/src/Modules/Shared';
import { Logger } from '@wings-shared/security';

export class ActiveUsersStore extends BaseStore {

  /* istanbul ignore next */
  public getActiveUsers(): Observable<ActiveUserModel[]> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.publicApi });
    return http.get<IAPIResponse<IAPIActiveUserMapping>>(`${apiUrls.activeUsers}`).pipe(
      Logger.observableCatchError,
      map((response: IAPIResponse<IAPIActiveUserMapping>) => {
        const { Data } = response;
        const result: ActiveUserModel[] = [];
        Object.keys(Data).forEach(x => {
          result.push(ActiveUserModel.deserialize(Data[x]))
        });
        return result;
      }
      ))
  }
}
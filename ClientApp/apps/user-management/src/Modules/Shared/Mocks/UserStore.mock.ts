import { UserStore } from '../Stores';
import { Observable, of } from 'rxjs';
import {
  IAPIPagedUserRequest,
  IAPIAssignGroupResponse,
  IAPIRemoveGroupResponse,
  IAPIUserDataResponse,
  IAPIMigrateUserResponse,
  IAPIUpdateUserEndDateRequest,
  IAPIImportJobResponse,
} from '../Interfaces';
import { UserGroupModel, UserResponseModel, CSDUserModel, UserModel } from '../Models';
import { tap } from 'rxjs/operators';
import { IAPIResponse } from '../../../../../airport-logistics/src/Modules/Shared';
import { IAPIGridRequest, IAPIPageResponse } from '@wings-shared/core';

export class UserStoreMock extends UserStore {
  public getUsers(request?: IAPIGridRequest): Observable<IAPIPageResponse<UserModel>> {
    return of({
      pageNumber: 1,
      pageSize: 1,
      totalNumberOfRecords: 1,
      results: [ new UserModel(), new UserModel() ],
    })
  }

  public loadUsers(request?: IAPIPagedUserRequest): Observable<IAPIUserDataResponse> {
    return of({ results: [ new UserResponseModel() ], after: '' });
  }

  public loadUserGroups(id: string): Observable<UserGroupModel[]> {
    return of([ new UserGroupModel(), new UserGroupModel() ]).pipe(
      tap((userGroups: UserGroupModel[]) => (this.userGroups = userGroups))
    );
  }

  public assignGroup(id: string, groupId: string): Observable<IAPIAssignGroupResponse> {
    return of({ Data: { isSuccess: true } });
  }

  public removeGroup(id: string, groupId: string): Observable<IAPIRemoveGroupResponse> {
    return of({ Data: { isSuccess: true } });
  }

  public migrateUser(username: string): Observable<IAPIResponse<IAPIMigrateUserResponse>> {
    return of({
      HttpStatusCode: 'ok',
      Data: { Message: 'Successful migration' },
      Errors: null,
      Meta: null,
      Warnings: null,
    });
  }

  public loadCsdUsers(search: string, userIds: number[]): Observable<CSDUserModel[]> {
    return of([ new CSDUserModel(), new CSDUserModel() ]);
  }

  public addRemoveCsdUser(CSDUserId: string, OktaUserId: string): Observable<boolean> {
    return of(true);
  }

  public toggleActivation(userId: string, status: string): Observable<IAPIResponse> {
    return of({
      HttpStatusCode: 'ok',
      Data: 'User Activated Successfully!',
      Errors: null,
      Meta: null,
      Warnings: null,
    });
  }

  public updateEndDate(request: IAPIUpdateUserEndDateRequest): Observable<IAPIResponse> {
    return of({
      HttpStatusCode: 'ok',
      Data: true,
      Errors: null,
      Meta: null,
      Warnings: null,
    });
  }

  public enqueueImportJob(): Observable<IAPIResponse<IAPIImportJobResponse>> {
    return of({
      HttpStatusCode: 'ok',
      Data: { message: 'Job Enqueued Successfully', jobId: '23456' },
      Errors: null,
      Meta: null,
      Warnings: null,
    });
  }

  public updateEmail(userId: number, email: string): Observable<IAPIResponse<boolean>> {
    return of({
      HttpStatusCode: 'ok',
      Data: true,
      Errors: null,
      Meta: null,
      Warnings: null,
    });
  }

  public resetUser(id: number): Observable<IAPIResponse<boolean>> {
    return of({
      HttpStatusCode: 'ok',
      Data: true,
      Errors: null,
      Meta: null,
      Warnings: null,
    });
  }

  public sendVerificationEmail(email: string): Observable<IAPIResponse<string>> {
    return of({
      HttpStatusCode: 'ok',
      Data: 'Activation code sent Successfully!',
      Errors: null,
      Meta: null,
      Warnings: null,
    });
  }

  public updateUser(user: UserResponseModel, isAdded: boolean): Observable<boolean> {
    return of(true);
  }

  public assignUserToGroup(groupId: string, userId: string): Observable<boolean> {
    return of(true);
  }

  public removeUserFromGroup(userId: string, groupId: string): Observable<boolean> {
    return of(true);
  }
}

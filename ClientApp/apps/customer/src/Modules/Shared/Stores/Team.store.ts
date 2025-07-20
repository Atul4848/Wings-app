import { observable } from 'mobx';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { baseApiPath, HttpClient, NO_SQL_COLLECTIONS, SettingsBaseStore } from '@wings/shared';
import { IAPIGridRequest, IAPIPageResponse, tapWithAction, Utilities } from '@wings-shared/core';
import { InternalUserAssignmentModel, TeamMemberModel, TeamModel } from '../Models';
import { apiUrls } from './API.url';
import { Logger } from '@wings-shared/security';
import {
  IAPIInternalUserAssignment,
  IAPIInternalUserAssignmentRequest,
  IAPITeam,
  IAPITeamMember,
  IAPITeamMemberRequest,
} from '../Interfaces';
import { AlertStore } from '@uvgo-shared/alert';

export class TeamStore extends SettingsBaseStore {
  @observable public teams: TeamModel[] = [];
  @observable public selectedTeam: TeamModel = new TeamModel();
  @observable public teamMembers: TeamMemberModel[] = [];
  @observable public associatedTeamMembers: InternalUserAssignmentModel[] = [];

  constructor(baseUrl?: string) {
    super(baseUrl || '');
  }

  /* istanbul ignore next */
  public getTeams(request?: IAPIGridRequest): Observable<IAPIPageResponse<TeamModel[]>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params: string = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.TEAM,
      sortCollection: JSON.stringify([{ propertyName: 'Name', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPITeam>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: TeamModel.deserializeList(response.results) })),
      tap(response => (this.teams = response.results))
    );
  }

  /* istanbul ignore next */
  public getTeamById(teamId: number): Observable<TeamModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    return http.get<IAPITeam>(`${apiUrls.team}/${teamId}`).pipe(map(response => TeamModel.deserialize(response)));
  }

  /* istanbul ignore next */
  public upsertTeam(team: TeamModel): Observable<TeamModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddTeam: boolean = team.id === null;
    const upsertRequest: Observable<IAPITeam> = isAddTeam
      ? http.post<IAPITeam>(apiUrls.team, team.serialize())
      : http.put<IAPITeam>(`${apiUrls.team}/${team.id}`, team.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPITeam) => TeamModel.deserialize(response)),
      tapWithAction((team: TeamModel) => {
        this.teams = Utilities.updateArray<TeamModel>(this.teams, team, {
          replace: !isAddTeam,
          predicate: t => t.id === team.id,
        });
        return AlertStore.info(`Team ${isAddTeam ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getTeamMembers(request?: IAPIGridRequest): Observable<IAPIPageResponse<TeamMemberModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.noSqlData });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      collectionName: NO_SQL_COLLECTIONS.TEAM_MEMBER,
      sortCollection: JSON.stringify([{ propertyName: 'Person.FirstName', isAscending: true }]),
      ...request,
    });
    return http.get<IAPIPageResponse<IAPITeamMember>>(`${apiUrls.referenceData}?${params}`).pipe(
      Logger.observableCatchError,
      map(response => ({ ...response, results: TeamMemberModel.deserializeList(response.results) })),
      tap(response => (this.teamMembers = response.results))
    );
  }

  /* istanbul ignore next */
  public upsertTeamMember(member: TeamMemberModel): Observable<TeamMemberModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddMember: boolean = member.id === 0;
    const upsertRequest: Observable<IAPITeamMemberRequest> = isAddMember
      ? http.post<IAPITeamMemberRequest>(apiUrls.teamMember, member.serialize())
      : http.put<IAPITeamMemberRequest>(`${apiUrls.teamMember}/${member.id}`, member.serialize());

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPITeamMember) => TeamMemberModel.deserialize(response)),
      tapWithAction((member: TeamMemberModel) => {
        this.teamMembers = Utilities.updateArray<TeamMemberModel>(this.teamMembers, member, {
          replace: !isAddMember,
          predicate: t => t.id === member.id,
        });
        return AlertStore.info(`Team Member ${isAddMember ? 'created' : 'updated'} successfully!`);
      })
    );
  }

  /* istanbul ignore next */
  public getAssociatedTeamMembers(
    teamId: number,
    request?: IAPIGridRequest
  ): Observable<IAPIPageResponse<InternalUserAssignmentModel>> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const params = Utilities.buildParamString({
      pageNumber: 1,
      pageSize: 30,
      ...request,
    });
    return http
      .get<IAPIPageResponse<IAPIInternalUserAssignment>>(`${apiUrls.associatedTeamMember(teamId)}?${params}`)
      .pipe(
        Logger.observableCatchError,
        map(response => ({ ...response, results: InternalUserAssignmentModel.deserializeList(response.results) })),
        tap(response => (this.associatedTeamMembers = response.results))
      );
  }

  /* istanbul ignore next */
  public upsertAssociatedTeamMember(
    teamId: number,
    member: InternalUserAssignmentModel
  ): Observable<InternalUserAssignmentModel> {
    const http: HttpClient = new HttpClient({ baseURL: baseApiPath.customer });
    const isAddMember: boolean = member.id === 0;
    const upsertRequest: Observable<IAPIInternalUserAssignmentRequest> = isAddMember
      ? http.post<IAPIInternalUserAssignmentRequest>(apiUrls.associatedTeamMember(teamId), member.serialize(teamId))
      : http.put<IAPIInternalUserAssignmentRequest>(
        `${apiUrls.associatedTeamMember(teamId)}/${member.id}`,
        member.serialize(teamId)
      );

    return upsertRequest.pipe(
      Logger.observableCatchError,
      map((response: IAPIInternalUserAssignment) => InternalUserAssignmentModel.deserialize(response)),
      tapWithAction((member: InternalUserAssignmentModel) => {
        this.associatedTeamMembers = Utilities.updateArray<InternalUserAssignmentModel>(
          this.associatedTeamMembers,
          member,
          {
            replace: !isAddMember,
            predicate: t => t.id === member.id,
          }
        );
        return AlertStore.info(`Internal User ${isAddMember ? 'added' : 'updated'} successfully!`);
      })
    );
  }
}

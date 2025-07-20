import { IAPIUserRoleResponse } from './API-user-role-response.interface';

export interface IAPIUMUserRoleResponse {
    UserGuid: string;
    Roles: IAPIUserRoleResponse[];
}

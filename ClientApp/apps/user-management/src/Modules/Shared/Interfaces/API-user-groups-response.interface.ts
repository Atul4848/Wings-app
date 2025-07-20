export interface IAPIUserGroupsResponse {
  Data: IAPIUserGroup[];
}

export interface IAPIUserGroup {
  Id: string;
  Name: string;
  Description: string;
  Unlocked: boolean;
  IdleTimeout: number;
}

export interface IAPIGroupsUsersResponse {
  Data: IAPIGroupsUsers[];
}

export interface IAPIGroupsUsers {
  Id?: number;
  UserId: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Username: string;
  Role: string;
  CsdUserId: number;
  Status: string;
  Provider: string;
}

export interface IAPIMigrateUserRequest {
  Username: string,
  OverrideAutoMapping: boolean,
  IsFederated: boolean,
  CSDUserId: number,
}
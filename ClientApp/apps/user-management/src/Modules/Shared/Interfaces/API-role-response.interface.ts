export interface IAPIRoleResponse {
  RoleId: string;
  Type: string;
  Name: string;
  DisplayName: string;
  Description: string;
  Permissions: string[];
  Enabled: boolean;
  isUvgoRole?: boolean;
}

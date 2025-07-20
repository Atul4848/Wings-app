export interface IAPIBaseUpdateUserRequest {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  isInternal: boolean;
  csdUserId: number;
  status: string;
}

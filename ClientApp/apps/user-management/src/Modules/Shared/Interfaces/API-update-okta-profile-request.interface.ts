export interface IAPIUpdateOktaProfileRequest {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    isInternal: boolean;
    csdUserId: number;
    status: string;
    endDate: string;
    assumedIdentity: number;
}

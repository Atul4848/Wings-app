export interface IAPICSDUserResponse {
  UserId: number;
  FirstName: string;
  LastName: string;
  Username: string;
  CustomerNumber: string;
  Email: string;
  StagedEmail: string;
  ServicesNProducts: IUserServiceNProductResponse[];
  CsdUserId: number;
  OktaImportDate: string;
}

export interface IUserServiceNProductResponse {
  Service: string;
  Product: string;
}
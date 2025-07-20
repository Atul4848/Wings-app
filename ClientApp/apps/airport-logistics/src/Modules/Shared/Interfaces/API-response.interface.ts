export interface IAPIResponse<T = any> {
  HttpStatusCode: string;
  Errors: T;
  Meta: T;
  Warnings: T;
  Data: T;
  results:T;
}

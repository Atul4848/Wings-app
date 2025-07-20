export interface IAPILogResponse {
  Id?: string;
  Actor: IActor;
  Target: IActor;
  Message: string;
  Event: string;
  Source: string;
  Status: string;
  Timestamp: string;
  Context: any;
}

export interface IActor{
  Id: string;
  Username: string;
}
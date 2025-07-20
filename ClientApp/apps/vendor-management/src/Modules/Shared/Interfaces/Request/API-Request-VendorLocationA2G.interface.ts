export interface IAPIRequestLocationA2G {
  userId: string;
  id: number;
  vendorLocationId: number;
  a2GLocationTypeId: number;
  isA2GCommCopy: boolean;
  locationDocUri: string;
  arrivalLogistic: string;
  departureLogistic: string;
  a2GAgentRequest: IAPIRequestLocationA2GAgent
}

export interface IAPIRequestLocationA2GAgent {
  id: number;
  userId: string;
  name: string;
  phone: string;
  phoneExt: string;
  email: string;
  profilePdfUri: string;
}

export interface IAPIDownloadA2GALocationFile {
  vendorLocationId: number;
  documentId: number;
  documentUri: string;
  accessTokenUrl: string;
}

export interface IAPIDownloadA2GAgentFile {
  vendorLocationId: number;
  a2GAgentId: number;
  documentUri: string;
  accessTokenUrl: string;
}

export interface IAPIA2GAgentFile {
  documentUri: string;
  a2GAgentId: number;
  vendorLocationId: number;
}
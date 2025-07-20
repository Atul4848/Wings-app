export interface IAPIRequestDocumentUpload {
  id: number;
  name: string;
  vendorLocationId: number;
  otherName: string;
  documentUri: string;
  vendorId: number;
  statusId: number;
  userId: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  comment?: string;
  lastUpdated: string;
}

export interface IAPIDocumentFile {
  document: File;
  vendorId: number;
  vendorLocationId: number;
}

export interface IAPIDownloadDocumentFile {
  vendorId: number;
  vendorLocationId: number;
  documentNameId: number;
  documentUri: string;
  accessTokenUrl: string;
}

export interface IAPIPhotoFile {
  photos: File;
  vendorLocationId: number;
}

export interface IAPIDownloadPhotoFile {
  vendorLocationId: number;
  photoId: number;
  photoUri: string;
}

export interface IAPIFeatureNote {
  Id: string;
  StartDate: string;
  Title: string;
  Category: String,
  Message: string;
  ReleaseVersion: string;
  IsInternal: boolean;
  IsPublished: boolean;
  IsArchived: boolean;
  CreatedBy?: string;
  UpdatedBy?: string;
  CreatedOn?: string;
  UpdatedOn?: string;
  BlobUrls?: IAPIBlob[];
}

export interface IAPIBlob {
  Name: string;
  Url: string;
}

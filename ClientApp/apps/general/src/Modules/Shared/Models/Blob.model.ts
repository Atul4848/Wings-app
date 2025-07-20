import { IdNameModel, modelProtection, Utilities } from '@wings-shared/core';
import { IAPIBlob } from '../Interfaces';

@modelProtection
export class BlobModel extends IdNameModel<string> {
  url: string = '';

  constructor(data?: Partial<BlobModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(blob: IAPIBlob): BlobModel {
    if (!blob) {
      return new BlobModel();
    }
    const data: Partial<BlobModel> = {
      id: Utilities.getTempId(),
      name: blob.Name,
      url: blob.Url,
    };
    return new BlobModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIBlob {
    return {
      Name: this.name,
      Url: this.url,
    };
  }

  static deserializeList(blobs: IAPIBlob[]): BlobModel[] {
    return blobs ? blobs.map((blob: IAPIBlob) => BlobModel.deserialize(blob)) : [];
  }
}

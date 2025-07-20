import { IAPIFeatureNote } from '../Interfaces';
import { modelProtection, DATE_FORMAT, CoreModel, ISelectOption } from '@wings-shared/core';
import moment from 'moment';
import { BlobModel } from './Blob.model';

@modelProtection
export class FeatureNoteModel extends CoreModel<string> {
  startDate: string = '';
  title: string = '';
  category: ISelectOption = null;
  message: string = '';
  releaseVersion: string = '';
  isInternal: boolean = false;
  isPublished: boolean = false;
  isArchived: boolean = false;
  blobUrls: BlobModel[] = [];

  constructor(data?: Partial<FeatureNoteModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(featureNote: IAPIFeatureNote): FeatureNoteModel {
    if (!featureNote) {
      return new FeatureNoteModel();
    }

    const data: Partial<FeatureNoteModel> = {
      id: featureNote.Id,
      startDate: moment.utc(featureNote.StartDate).local().format(DATE_FORMAT.API_FORMAT),
      title: featureNote.Title,
      category: featureNote.Category
        ? ({ label: featureNote.Category, value: featureNote.Category } as ISelectOption)
        : null,
      message: featureNote.Message,
      isInternal: featureNote.IsInternal,
      isPublished: featureNote.IsPublished,
      isArchived: featureNote.IsArchived,
      createdBy: featureNote.CreatedBy,
      updatedBy: featureNote.UpdatedBy,
      releaseVersion: featureNote.ReleaseVersion,
      createdOn: moment.utc(featureNote.CreatedOn).local().format(DATE_FORMAT.API_FORMAT),
      modifiedOn: featureNote.UpdatedOn
        ? moment.utc(featureNote.UpdatedOn).local().format(DATE_FORMAT.API_FORMAT)
        : null,
      blobUrls: BlobModel.deserializeList(featureNote.BlobUrls),
    };
    return new FeatureNoteModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIFeatureNote {
    return {
      Id: this.id,
      StartDate: moment(this.startDate).utc().format(DATE_FORMAT.API_FORMAT),
      Title: this.title,
      Category: this.category?.value as string,
      Message: this.message,
      ReleaseVersion: this.releaseVersion,
      IsInternal: this.isInternal,
      IsArchived: this.isArchived,
      IsPublished: this.isPublished,
      BlobUrls: this.blobUrls?.map(x => x.serialize()) || [],
    };
  }

  static deserializeList(featureNotes: IAPIFeatureNote[]): FeatureNoteModel[] {
    return featureNotes
      ? featureNotes.map((featureNote: IAPIFeatureNote) => FeatureNoteModel.deserialize(featureNote))
      : [];
  }
}

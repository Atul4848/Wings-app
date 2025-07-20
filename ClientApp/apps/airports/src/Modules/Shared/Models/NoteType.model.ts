import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { IAPINoteType } from '../Interfaces';

@modelProtection
export class NoteTypeModel extends CoreModel implements ISelectOption {
  cappsCode: string = '';

  constructor(data?: Partial<NoteTypeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPINoteType): NoteTypeModel {
    if (!apiData) {
      return new NoteTypeModel();
    }
    return new NoteTypeModel({ ...apiData, id: apiData.noteTypeId || apiData.id });
  }

  static deserializeList(apiDataList: IAPINoteType[]): NoteTypeModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPINoteType) => NoteTypeModel.deserialize(apiData)) : [];
  }

  public serialize(): IAPINoteType {
    return {
      ...this._serialize(),
      id: this.id,
      name: this.name,
      cappsCode: this.cappsCode,
    };
  }

  // required for dropdown
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}

import { AccessLevelModel, CoreModel, SourceTypeModel, StatusTypeModel, modelProtection } from '@wings-shared/core';
import { IAPIRestrictionSource } from '../Interfaces';

@modelProtection
export class RestrictionSourceModel extends CoreModel {
  id: number = 0;
  summaryDescription: string = '';

  constructor(data?: Partial<RestrictionSourceModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRestrictionSource): RestrictionSourceModel {
    if (!apiData) {
      return new RestrictionSourceModel();
    }
    const data: Partial<RestrictionSourceModel> = {
      ...apiData,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new RestrictionSourceModel(data);
  }

  public serialize(): IAPIRestrictionSource {
    return {
      ...this._serialize(),
      id: this.id,
      name: this.name,
      summaryDescription: this.summaryDescription,
    };
  }

  static deserializeList(apiDataList: IAPIRestrictionSource[]): RestrictionSourceModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRestrictionSource) => RestrictionSourceModel.deserialize(apiData))
      : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

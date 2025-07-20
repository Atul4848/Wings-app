import { IAPIContinent } from '@wings/shared';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  modelProtection,
} from '@wings-shared/core';

@modelProtection
export class ContinentModel extends CoreModel implements ISelectOption {
  code: string = '';

  constructor(data?: Partial<ContinentModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIContinent): ContinentModel {
    if (!apiData) {
      return new ContinentModel();
    }
    const data: Partial<ContinentModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id,
      code: apiData.code,
      name: apiData.name,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new ContinentModel(data);
  }

  static deserializeList(apiDataList: IAPIContinent[]): ContinentModel[] {
    return apiDataList ? apiDataList.map((continent: IAPIContinent) => ContinentModel.deserialize(continent)) : [];
  }

  public serialize(): IAPIContinent {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
    };
  }

  // required in auto complete
  public get label(): string {
    return `${this.name} (${this.code})`;
  }

  public get value(): string | number {
    return this.id;
  }
}

import { IAPICAPPSTerritoryType } from '../Interfaces';
import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class CAPPSTerritoryTypeModel extends CoreModel implements ISelectOption {
  code: string = '';

  constructor(data?: Partial<CAPPSTerritoryTypeModel>) {
    super(data);
    Object.assign(this, data);
    this.accessLevelId = data?.accessLevelId || 1;
  }

  static deserialize(apiData: IAPICAPPSTerritoryType): CAPPSTerritoryTypeModel {
    if (!apiData) {
      return new CAPPSTerritoryTypeModel();
    }
    const data: Partial<CAPPSTerritoryTypeModel> = {
      id: apiData.cappsTerritoryTypeId || apiData.territoryTypeId || apiData.id,
      code: apiData.code,
      name: apiData.name,
      statusId: apiData.statusId,
      accessLevelId: apiData.accessLevelId,
    };
    return new CAPPSTerritoryTypeModel(data);
  }

  static deserializeList(apiDataList: IAPICAPPSTerritoryType[]): CAPPSTerritoryTypeModel[] {
    return apiDataList
      ? apiDataList.map((continent: IAPICAPPSTerritoryType) => CAPPSTerritoryTypeModel.deserialize(continent))
      : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

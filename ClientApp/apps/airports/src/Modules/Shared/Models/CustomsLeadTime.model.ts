import { CoreModel, EntityMapModel, modelProtection, SettingsTypeModel, StatusTypeModel } from '@wings-shared/core';
import { IAPICustomsLeadTime } from '../Interfaces';

@modelProtection
export class CustomsLeadTimeModel extends CoreModel {
  leadTime: number;
  preClearance: boolean;
  customsLeadTimeType: SettingsTypeModel;
  flightOperationalCategory: EntityMapModel;

  constructor(data?: Partial<CustomsLeadTimeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomsLeadTime): CustomsLeadTimeModel {
    if (!apiData) {
      return new CustomsLeadTimeModel();
    }
    const data: Partial<CustomsLeadTimeModel> = {
      ...apiData,
      id: apiData.customsLeadTimeId || apiData.id,
      customsLeadTimeType: new SettingsTypeModel({
        ...apiData.customsLeadTimeType,
        id: apiData.customsLeadTimeType?.customsLeadTimeTypeId,
      }),
      flightOperationalCategory: new EntityMapModel({
        id: apiData.flightOperationalCategoryId || 0,
        entityId: apiData.flightOperationalCategoryId,
        name: apiData.flightOperationalCategoryName,
      }),
      status: StatusTypeModel.deserialize(apiData.status),
    };
    return new CustomsLeadTimeModel(data);
  }

  static deserializeList(apiDataList: IAPICustomsLeadTime[]): CustomsLeadTimeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPICustomsLeadTime) => CustomsLeadTimeModel.deserialize(apiData))
      : [];
  }

  public serialize(customsDetailId: number): IAPICustomsLeadTime {
    return {
      id: this.id,
      customsDetailId,
      preClearance: this.preClearance,
      leadTime: this.leadTime,
      customsLeadTimeTypeId: this.customsLeadTimeType?.id,
      flightOperationalCategoryId: this.flightOperationalCategory?.entityId,
      flightOperationalCategoryName: this.flightOperationalCategory?.name,
      statusId: this.status?.id,
    };
  }

  // we need value and label getters for Autocomplete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }
}

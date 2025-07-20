import { CoreModel, ISelectOption, modelProtection, Utilities, SettingsTypeModel } from '@wings-shared/core';
import { IAPIPreTravelTestDetail } from '../Interfaces';

@modelProtection
export class PreTravelTestDetailModel extends CoreModel implements ISelectOption {
  leadTime: number = null;
  testType: SettingsTypeModel;
  leadTimeIndicator: SettingsTypeModel;
  tempId: number = Utilities.getTempId(true);

  constructor(data?: Partial<PreTravelTestDetailModel>) {
    super(data);
    Object.assign(this, data);
    this.testType = data?.testType?.id ? new SettingsTypeModel(data.testType) : null;
    this.leadTimeIndicator = new SettingsTypeModel(data?.leadTimeIndicator);
  }

  static deserialize(apiData: IAPIPreTravelTestDetail): PreTravelTestDetailModel {
    if (!apiData) {
      return new PreTravelTestDetailModel();
    }
    const data: Partial<PreTravelTestDetailModel> = {
      ...apiData,
      id: apiData.preTravelTestDetailId || apiData.id,
      testType: SettingsTypeModel.deserialize({
        ...apiData?.testType,
        id: apiData?.testType?.testTypeId || apiData?.testType?.id,
      }),
      leadTimeIndicator: SettingsTypeModel.deserialize({
        ...apiData?.leadTimeIndicator,
        id: apiData?.leadTimeIndicator?.leadTimeIndicatorId || apiData?.leadTimeIndicator?.id,
      }),
    };
    return new PreTravelTestDetailModel(data);
  }

  public isIdExist(data: PreTravelTestDetailModel): boolean {
    return Boolean(this.id) ? Utilities.isEqual(this.id, data.id) : Utilities.isEqual(this.tempId, data.tempId);
  }

  public serialize(): IAPIPreTravelTestDetail {
    return {
      id: this.id,
      testTypeId: this.testType?.id || null,
      leadTime: Utilities.getNumberOrNullValue(this.leadTime),
      leadTimeIndicatorId: this.leadTimeIndicator?.id || null,
    };
  }

  static deserializeList(apiDataList: IAPIPreTravelTestDetail[]): PreTravelTestDetailModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPreTravelTestDetail) => PreTravelTestDetailModel.deserialize(apiData))
      : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

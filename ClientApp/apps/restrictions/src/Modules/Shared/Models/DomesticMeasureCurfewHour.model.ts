import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIDomesticMeasureCurfewHour } from '../Interfaces';

@modelProtection
export class DomesticMeasureCurfewHourModel extends CoreModel {
  id: number = 0;
  curfewHourType: SettingsTypeModel;
  curfewDetails: string = '';
  curfewTimeFrame: string = '';
  curfewExpirationDate: string = '';
  constructor(data?: Partial<DomesticMeasureCurfewHourModel>) {
    super(data);
    Object.assign(this, data);
    this.curfewHourType = new SettingsTypeModel({ ...data?.curfewHourType });
  }

  static deserialize(apiData: IAPIDomesticMeasureCurfewHour): DomesticMeasureCurfewHourModel {
    if (!apiData) {
      return new DomesticMeasureCurfewHourModel();
    }
    const data: Partial<DomesticMeasureCurfewHourModel> = {
      ...apiData,
      id: apiData.domesticMeasureCurfewHourId || apiData.id,
      curfewHourType: SettingsTypeModel.deserialize({
        ...apiData.curfewHourType,
        id: apiData.curfewHourType.curfewHourTypeId,
      }),
    };
    return new DomesticMeasureCurfewHourModel(data);
  }

  public serialize(): IAPIDomesticMeasureCurfewHour {
    return {
      id: this.id,
      curfewHourTypeId: this.curfewHourType.id,
      curfewDetails: this.curfewDetails,
      curfewTimeFrame: this.curfewTimeFrame,
      curfewExpirationDate: this.curfewExpirationDate || null,
    };
  }

  static deserializeList(apiDataList: IAPIDomesticMeasureCurfewHour[]): DomesticMeasureCurfewHourModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIDomesticMeasureCurfewHour) => DomesticMeasureCurfewHourModel.deserialize(apiData))
      : [];
  }
}

import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';
import { Airports } from './Airports.model';

@modelProtection
export class Slide3Model extends CoreModel implements ISelectOption {
  id: number = 0;
  userId: string = '';
  vendorId: number = 0;
  locationName: string = '';
  tempLocationId: string = '';
  locationUniqueCode: string = '';
  slide4Answer: string = ';'
  slide5Answer: string = ';'
  slide6Answer: string = ';'

  constructor(data?: Partial<Slide3Model>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: Slide3Model): Slide3Model {
    if (!apiData) {
      return new Slide3Model();
    }
    const data: Partial<Slide3Model> = {
      ...apiData,
    };
    return new Slide3Model(data);
  }

  static deserializeList(apiDataList: Slide3Model[]): Slide3Model[] {
    return apiDataList ? apiDataList.map(apiData => Slide3Model.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.locationName;
  }

  public get value(): string | number {
    return this.id;
  }
}

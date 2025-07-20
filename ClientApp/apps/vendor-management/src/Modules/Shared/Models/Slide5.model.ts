import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';
import { Airports } from './Airports.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { VendorLocationModel } from './VendorLocation.model';

@modelProtection
export class Slide5Model extends CoreModel implements ISelectOption {
  id: number = 0;
  vendor?: VendorManagmentModel = new VendorManagmentModel();
  tempLocationId: string = '';
  coordinatingOffice: VendorLocationModel = new VendorLocationModel();
  legalBusinessName: string = '';
  vendorName: string = '';
  managerName: string = '';
  assitManagerName: string = '';
  opsPrimaryPhoneNo: string = '';
  opsSecondaryPhoneNo: string = '';
  opsFaxNo: string = '';
  opsPrimaryEmail: string = '';
  opsSecondaryEmail: string = '';

  constructor(data?: Partial<Slide5Model>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: Slide5Model): Slide5Model {
    if (!apiData) {
      return new Slide5Model();
    }
    const data: Partial<Slide5Model> = {
      ...apiData,
      vendor: VendorManagmentModel.deserialize(apiData?.vendor),
      tempLocationId: apiData.tempLocationId,
      coordinatingOffice: VendorLocationModel.deserialize(apiData.coordinatingOffice),
      legalBusinessName: apiData.legalBusinessName,
      vendorName: apiData.vendorName,
      managerName: apiData.managerName,
      assitManagerName: apiData.assitManagerName,
      opsPrimaryPhoneNo: apiData.opsPrimaryPhoneNo,
      opsSecondaryPhoneNo: apiData.opsSecondaryPhoneNo,
      opsFaxNo: apiData.opsFaxNo,
      opsPrimaryEmail: apiData.opsPrimaryEmail,
      opsSecondaryEmail: apiData.opsSecondaryEmail
    };
    return new Slide5Model(data);
  }

  static deserializeList(apiDataList: Slide5Model[]): Slide5Model[] {
    return apiDataList
      ? apiDataList.map((apiData) => Slide5Model.deserialize(apiData))
      : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

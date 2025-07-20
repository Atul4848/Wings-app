import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { VendorLocationModel } from './VendorLocation.model';
import { VendorManagmentModel } from './VendorManagment.model';

@modelProtection
export class Slide6Model extends CoreModel implements ISelectOption {
  id: number = 0;
  vendor: VendorManagmentModel = new VendorManagmentModel();
  vendorId: number = 0;
  tempLocationId: string = '';
  groundServiceProviderAppliedVendorLocation: VendorLocationModel = new VendorLocationModel();
  groundServiceProviderAppliedVendorLocationId: number = 0;
  legalBusinessName: string = '';
  managerName: string = '';
  assitManagerName: string = '';
  primaryPhoneNo: string = '';
  secondaryPhoneNo: string = '';
  fax: string = '';
  email: string = '';
  secondaryEmail: string = '';

  constructor(data?: Partial<Slide6Model>) {
    super(data);
    Object.assign(this, data);
  }


  static deserialize(apiData: Slide6Model): Slide6Model {
    if (!apiData) {
      return new Slide6Model();
    }
    const data: Partial<Slide6Model> = {
      ...apiData,
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
      assitManagerName: apiData?.asstManagerName,
      groundServiceProviderAppliedVendorLocation:
        apiData.groundServiceProviderAppliedVendorLocation != null
          ? VendorLocationModel.deserialize({
            ...apiData.groundServiceProviderAppliedVendorLocation,
            id: apiData.groundServiceProviderAppliedVendorLocation?.vendorLocationId,
          })
          : null,
    };
    return new Slide6Model(data);
  }

  static deserializeList(apiDataList: Slide6Model[]): Slide6Model[] {
    return apiDataList ? apiDataList.map(apiData => Slide6Model.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

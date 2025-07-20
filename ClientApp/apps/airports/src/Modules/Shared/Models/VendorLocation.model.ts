import { IAPIVendorLocation } from '../Interfaces';
import { LocationOperationalEssentialModel } from './VendorLocationOperationalEssential.model';
import { modelProtection, CoreModel, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class VendorLocationModel extends CoreModel {
  code: string = '';
  vendorId: number = 0;
  vendor: IdNameCodeModel;
  vendorLocationId: number = 0;
  airportRank: number;
  vendorLocationStatus: SettingsTypeModel;
  operationalEssential: LocationOperationalEssentialModel;

  constructor(data?: Partial<VendorLocationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIVendorLocation): VendorLocationModel {
    if (!apiData) {
      return new VendorLocationModel();
    }
    const data: Partial<VendorLocationModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      code: apiData.code,
      vendor: IdNameCodeModel.deserialize(apiData.vendor),
      vendorLocationId: apiData.vendorId,
      airportRank: apiData.airportRank,
      vendorLocationStatus: SettingsTypeModel.deserialize(apiData.vendorLocationStatus),
      operationalEssential: LocationOperationalEssentialModel.deserialize(apiData.operationalEssential),
    };
    return new VendorLocationModel(data);
  }

  static deserializeList(apiDataList: IAPIVendorLocation[]): VendorLocationModel[] {
    return apiDataList ? apiDataList.map(apiData => VendorLocationModel.deserialize(apiData)) : [];
  }
}

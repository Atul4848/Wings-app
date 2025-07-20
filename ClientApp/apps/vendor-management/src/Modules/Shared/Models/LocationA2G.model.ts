import { ISelectOption, modelProtection } from '@wings-shared/core';
import { BaseModel } from './Base.model';
import { SettingBaseModel } from './SettingBase.model';
import { IAPIRequestLocationA2G } from '../Interfaces/Request/API-Request-VendorLocationA2G.interface';
import { LocationA2GAgentModel } from './LocationA2GAgent.model';
import { ContactMasterModel } from './ContactMaster.model';

@modelProtection
export class LocationA2GModel extends BaseModel implements ISelectOption {
  public id: number;
  public a2GLocationType: SettingBaseModel;
  public vendorLocationId: number;
  public isA2GCommCopy: boolean = false;
  public locationDocUri: string = '';
  public arrivalLogistic: string = '';
  public departureLogistic: string = '';
  public a2GAgent: LocationA2GAgentModel[];
  public a2GEmail: ContactMasterModel = new ContactMasterModel();

  constructor(data?: Partial<LocationA2GModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: LocationA2GModel): LocationA2GModel {
    if (!apiData) {
      return new LocationA2GModel();
    }
    const data: Partial<LocationA2GModel> = {
      ...apiData,
      vendorLocationId: apiData.vendorLocationId,
      locationDocUri: apiData.locationDocUri,
      arrivalLogistic: apiData.arrivalLogistic,
      departureLogistic: apiData.departureLogistic,
      a2GLocationType: SettingBaseModel.deserialize(apiData.a2GLocationType),
      a2GAgent: LocationA2GAgentModel.deserializeList(apiData.a2GAgent),
      a2GEmail: apiData?.contact ? ContactMasterModel.deserialize(apiData.contact) : null,
    };
    return new LocationA2GModel(data);
  }

  public serialize(
    documentUri: string,
    locationId: number,
    a2gAgentData: LocationA2GAgentModel[],
    contactId?: number
  ): IAPIRequestLocationA2G {
    return {
      userId: '',
      id: this.id || 0,
      vendorLocationId: locationId ? locationId : this.vendorLocationId,
      a2GLocationTypeId: this.a2GLocationType.id,
      // isA2GCommCopy: this.isA2GCommCopy,
      isA2GCommCopy: this?.isA2GCommCopy === undefined || this?.isA2GCommCopy === null ? null : !!this?.isA2GCommCopy,
      locationDocUri: documentUri ? documentUri : this.locationDocUri,
      arrivalLogistic: this.arrivalLogistic,
      departureLogistic: this.departureLogistic,
      a2GAgentRequest: a2gAgentData.map(item => item.serialize('')),
      contactId: contactId || null,
    };
  }

  static deserializeList(apiDataList: LocationA2GModel[]): LocationA2GModel[] {
    return apiDataList ? apiDataList.map((apiData: any) => LocationA2GModel.deserialize(apiData)) : [];
  }
}

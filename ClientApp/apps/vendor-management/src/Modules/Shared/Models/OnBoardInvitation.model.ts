import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { ContactMasterModel } from './ContactMaster.model';
import { VendorLocationModel } from './VendorLocation.model';
import { IAPIRequestVendorLocationContact } from '../Interfaces/Request/API-Request-VendorLocationContact.interface';
import { IAPIResponseVendorLocationContact } from '../Interfaces/Response/API-Response-VendorLocationContact';
import { VendorManagmentModel } from './VendorManagment.model';
import { Airports } from './Airports.model';

@modelProtection
export class OnBoardInvitationModel extends CoreModel implements ISelectOption {
  id: number = 0;
  userId?: string = '';
  airportReference: Airports = new Airports();
  isInviteEmailSent: boolean = false;
  comment: string = '';

  constructor(data?: Partial<ContactMasterModel>) {
    super(data);
    Object.assign(this, data);
  }

  public serialize(): OnBoardInvitationModel {
    return {
      userId: this.userId || '',
      id: this.id || 0,
      airportReferenceRequest: this.airportReference,
      isInviteEmailSent: this.isInviteEmailSent || false,
      comment: this.comment || '',
    };
  }

  static deserialize(apiData: IAPIResponseVendorLocationContact): OnBoardInvitationModel {
    if (!apiData) {
      return new OnBoardInvitationModel();
    }
    const data: Partial<OnBoardInvitationModel> = {
      ...apiData,
      airportReference: Airports.deserializeAirportReference(apiData?.airportReference),
    };
    return new OnBoardInvitationModel(data);
  }
    
  static deserializeList(apiDataList: IAPIResponseVendorLocationContact[]): OnBoardInvitationModel[] {
    return apiDataList ? apiDataList.map(apiData => OnBoardInvitationModel.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.airportReference?.label;
  }
    
  public get value(): string | number {
    return this.id;
  }
}

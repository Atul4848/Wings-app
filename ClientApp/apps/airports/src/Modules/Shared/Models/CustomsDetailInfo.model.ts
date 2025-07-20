import { CoreModel, EntityMapModel, modelProtection, regex, getYesNoNullToBoolean } from '@wings-shared/core';
import { IAPIAirportCustomsDetailInfo, IAPIAirportCustomsDetailInfoRequest } from '../Interfaces';
import { CustomsLeadTimeModel } from './CustomsLeadTime.model';

@modelProtection
export class CustomsDetailInfoModel extends CoreModel {
  airportId: number;
  canPassPermitLocation: boolean;
  toleranceMinus: number;
  tolerancePlus: number;
  uwaInternalProcessNotes: string;
  customClearanceProcess: string;
  specialInstructions: string;
  trashRemovalVendor: string;
  trashRemovalRequestTemplate: string;
  internationalTrashAvailable: boolean;
  customsDocumentRequirements: EntityMapModel[];
  customsRequiredInformationTypes: EntityMapModel[];
  customsLeadTimes: CustomsLeadTimeModel[];

  constructor(data?: Partial<CustomsDetailInfoModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAirportCustomsDetailInfo): CustomsDetailInfoModel {
    if (!apiData) {
      return new CustomsDetailInfoModel();
    }
    const data: Partial<CustomsDetailInfoModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.customsDetailId || apiData.id,
      customClearanceProcess: apiData.customsClearanceExternalProcess,
      customsDocumentRequirements: apiData.customsDocumentRequirements?.map(
        entity =>
          new EntityMapModel({
            id: entity.customsDocumentRequirementId || entity.id,
            entityId: entity.permitDocumentId,
            name: entity.name,
            code: entity.code,
          })
      ),
      customsRequiredInformationTypes: apiData.customsRequiredInformationTypes?.map(
        entity =>
          new EntityMapModel({
            id: entity.customsRequiredInformationTypeId || entity.id,
            entityId: entity.requiredInformationType.requiredInformationTypeId || entity.requiredInformationType.id,
            name: entity.requiredInformationType.name,
          })
      ),
      customsLeadTimes: CustomsLeadTimeModel.deserializeList(apiData.customsLeadTimes),
    };
    return new CustomsDetailInfoModel(data);
  }

  static deserializeList(apiDataList: IAPIAirportCustomsDetailInfo[]): CustomsDetailInfoModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomsDetailInfoModel.deserialize(apiData)) : [];
  }

  //serialize object for create/update API
  public serialize(): IAPIAirportCustomsDetailInfoRequest {
    return {
      id: this.id || 0,
      airportId: this.airportId,
      canPassPermitLocation: getYesNoNullToBoolean(this.canPassPermitLocation),
      tolerancePlus: this.tolerancePlus || null,
      toleranceMinus: this.toleranceMinus || null,
      uwaInternalProcessNotes: this.uwaInternalProcessNotes,
      customsClearanceExternalProcess: this.customClearanceProcess?.replace(regex.stripedHTML, '').trim(),
      specialInstructions: this.specialInstructions,
      customsRequiredInformationTypes: this.customsRequiredInformationTypes
        ? this.customsRequiredInformationTypes?.map(entity => entity.entityId)
        : [],
      customsDocumentRequirements: this.customsDocumentRequirements
        ? this.customsDocumentRequirements?.map(entity => ({
          id: entity.id || 0,
          permitDocumentId: entity.entityId,
          name: entity.name,
          code: entity.code,
        }))
        : [],
      customsLeadTimes: this.customsLeadTimes ? this.customsLeadTimes?.map(x => x.serialize(this.id)) : [],
      trashRemovalVendor: this.trashRemovalVendor,
      internationalTrashAvailable: getYesNoNullToBoolean(this.internationalTrashAvailable),
      trashRemovalRequestTemplate: this.trashRemovalRequestTemplate,
    };
  }
}

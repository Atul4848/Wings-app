import { IAPIRegistryAssociationDetail, IAPIRequest } from '../Interfaces';
import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';

@modelProtection
export class RegistryAssociationDetailModel extends CoreModel {
  deliveryPackageType: SettingsTypeModel;
  departure: SettingsTypeModel;
  destination: SettingsTypeModel;
  destinationAlternate: SettingsTypeModel;
  takeoffAlternate: SettingsTypeModel;
  reclearDestination: SettingsTypeModel;
  reclearAlternate: SettingsTypeModel;
  etp: SettingsTypeModel;
  etops: SettingsTypeModel;
  pointOfSafeReturn: SettingsTypeModel;
  customersWithNonStandardRunwayAnalysisRegistryId: number;
  customersWithNonStandardRunwayAnalysisRegistryOptionId?: number;

  constructor(data?: Partial<RegistryAssociationDetailModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRegistryAssociationDetail): RegistryAssociationDetailModel {
    if (!apiData) {
      return new RegistryAssociationDetailModel();
    }
    const data: Partial<RegistryAssociationDetailModel> = {
      ...apiData,
      customersWithNonStandardRunwayAnalysisRegistryId:
        apiData.customersWithNonStandardRunwayAnalysisRegistryId || apiData.id,
      deliveryPackageType: SettingsTypeModel.deserialize({
        ...apiData.deliveryPackageType,
        id: apiData.deliveryPackageType?.deliveryPackageTypeId,
      }),
      departure: SettingsTypeModel.deserialize({
        ...apiData.departure,
        id: apiData.departure?.departureId,
      }),
      destination: SettingsTypeModel.deserialize({
        ...apiData.destination,
        id: apiData.destination?.destinationId,
      }),
      destinationAlternate: SettingsTypeModel.deserialize({
        ...apiData.destinationAlternate,
        id: apiData.destinationAlternate?.destinationAlternateId,
      }),
      takeoffAlternate: SettingsTypeModel.deserialize({
        ...apiData.takeoffAlternate,
        id: apiData.takeoffAlternate?.takeoffAlternateId,
      }),
      reclearDestination: SettingsTypeModel.deserialize({
        ...apiData.reclearDestination,
        id: apiData.reclearDestination?.reclearDestinationId,
      }),
      reclearAlternate: SettingsTypeModel.deserialize({
        ...apiData.reclearAlternate,
        id: apiData.reclearAlternate?.reclearAlternateId,
      }),
      etp: SettingsTypeModel.deserialize({
        ...apiData.etp,
        id: apiData.etp?.etpId,
      }),
      etops: SettingsTypeModel.deserialize({
        ...apiData.etops,
        id: apiData.etops?.etopsId,
      }),
      pointOfSafeReturn: SettingsTypeModel.deserialize({
        ...apiData.pointOfSafeReturn,
        id: apiData.pointOfSafeReturn?.pointOfSafeReturnId,
      }),
      customersWithNonStandardRunwayAnalysisRegistryOptionId:
        apiData.customersWithNonStandardRunwayAnalysisRegistryOptionId || apiData.id,
    };

    return new RegistryAssociationDetailModel(data);
  }

  public serialize(): IAPIRequest {
    return {
      id: this.id,
      customersWithNonStandardRunwayAnalysisRegistryId: this.customersWithNonStandardRunwayAnalysisRegistryId,
      deliveryPackageTypeId: this.deliveryPackageType?.id,
      departureId: this.departure.id,
      destinationId: this.destination?.id,
      destinationAlternateId: this.destinationAlternate?.id,
      takeoffAlternateId: this.takeoffAlternate?.id,
      reclearDestinationId: this.reclearDestination?.id,
      reclearAlternateId: this.reclearAlternate?.id,
      etpId: this.etp?.id,
      etopsId: this.etops?.id,
      pointOfSafeReturnId: this.pointOfSafeReturn?.id,
    };
  }
}

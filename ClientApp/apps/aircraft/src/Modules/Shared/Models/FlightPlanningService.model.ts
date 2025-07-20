import { CoreModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIFlightPlanningService } from '../Interfaces';
import { RegistryAssociationModel } from './RegistryAssociation.model';

@modelProtection
export class FlightPlanningServiceModel extends CoreModel {
  customerName: string = '';
  customerNumber: SettingsTypeModel;
  customersWithNonStandardRunwayAnalysisRegistries: RegistryAssociationModel[] = [];

  constructor(data?: Partial<FlightPlanningServiceModel>) {
    super(data);
    Object.assign(this, data);
    this.customerNumber = new SettingsTypeModel(data?.customerNumber);
  }

  static deserialize(apiData: IAPIFlightPlanningService): FlightPlanningServiceModel {
    if (!apiData) {
      return new FlightPlanningServiceModel();
    }
    const data: Partial<FlightPlanningServiceModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.customersWithNonStandardRunwayAnalysisId || apiData.id,
      customerNumber: SettingsTypeModel.deserialize({
        id: Number(apiData.customerNumber),
        name: apiData.customerNumber,
      }),
      customersWithNonStandardRunwayAnalysisRegistries: RegistryAssociationModel.deserializeList(
        apiData.customersWithNonStandardRunwayAnalysisRegistries
      ),
    };
    return new FlightPlanningServiceModel(data);
  }

  public serialize(): IAPIFlightPlanningService {
    return {
      id: this.id || 0,
      customerNumber: this.customerNumber.name,
      customerName: this.customerName,
    };
  }

  static deserializeList(apiDataList: IAPIFlightPlanningService[]): FlightPlanningServiceModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIFlightPlanningService) => FlightPlanningServiceModel.deserialize(apiData))
      : [];
  }
}

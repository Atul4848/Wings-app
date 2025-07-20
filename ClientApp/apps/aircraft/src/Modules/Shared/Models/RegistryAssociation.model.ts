import { IAPIRegistryAssociation } from './../Interfaces';
import { CoreModel, modelProtection } from '@wings-shared/core';
import { RegistryAssociationDetailModel } from './RegistryAssociationDetail.model';

@modelProtection
export class RegistryAssociationModel extends CoreModel {
  registry: string = '';
  customersWithNonStandardRunwayAnalysisRegistryId: number;
  customersWithNonStandardRunwayAnalysisId?: number;
  customersWithNonStandardRunwayAnalysisRegistryOption?: RegistryAssociationDetailModel;

  constructor(data?: Partial<RegistryAssociationModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRegistryAssociation): RegistryAssociationModel {
    if (!apiData) {
      return new RegistryAssociationModel();
    }
    const data: Partial<RegistryAssociationModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      registry: apiData.registry,
      id: apiData.customersWithNonStandardRunwayAnalysisRegistryId || apiData.id,
      customersWithNonStandardRunwayAnalysisRegistryOption: RegistryAssociationDetailModel.deserialize(
        apiData.customersWithNonStandardRunwayAnalysisRegistryOption
      ),
    };
    return new RegistryAssociationModel(data);
  }

  static deserializeList(apiDataList?: IAPIRegistryAssociation[]): RegistryAssociationModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRegistryAssociation) => RegistryAssociationModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIRegistryAssociation {
    return {
      id: this.id,
      registry: this.registry,
      customersWithNonStandardRunwayAnalysisId: this.customersWithNonStandardRunwayAnalysisId,
    };
  }
}

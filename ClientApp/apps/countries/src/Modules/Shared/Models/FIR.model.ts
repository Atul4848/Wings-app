import { CountryModel } from '@wings/shared';
import {
  AccessLevelModel,
  CoreModel,
  EntityMapModel,
  modelProtection,
  SettingsTypeModel,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
} from '@wings-shared/core';
import { IAPIFIR, IAPIFIRRequest } from '../Interfaces';

@modelProtection
export class FIRModel extends CoreModel {
  code: string = '';
  firControllingCountries: CountryModel[] = [];
  firLandmassCountries: CountryModel[] = [];
  controllingCountries: number[] = [];
  appliedFeeRequirements: EntityMapModel[] = [];

  constructor(data?: Partial<FIRModel>) {
    super(data);
    Object.assign(this, data);
    this.appliedFeeRequirements = data?.appliedFeeRequirements?.map(x => new EntityMapModel(x)) || [];
  }

  // serialize object for create/update API
  public serialize(): IAPIFIRRequest {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      controllingCountries: this.firControllingCountries.map((firCountry: CountryModel) =>
        Utilities.getNumberOrNullValue(firCountry.id)
      ),
      landmassCountries: this.firLandmassCountries.map((firLandmass: CountryModel) =>
        Utilities.getNumberOrNullValue(firLandmass.id)
      ),
      appliedFeeRequirements: this.appliedFeeRequirements?.map(x => ({
        id: x.id || 0,
        feeRequirementId: x.entityId,
      })),
      statusId: Utilities.getNumberOrNullValue(this.status.value),
      accessLevelId: this.accessLevel.id,
      sourceTypeId: this.sourceType?.id,
    };
  }

  static deserialize(apiFIR: IAPIFIR): FIRModel {
    if (!apiFIR) {
      return new FIRModel();
    }
    const data: Partial<FIRModel> = {
      ...CoreModel.deserializeAuditFields(apiFIR),
      id: apiFIR.firId || apiFIR.id,
      code: apiFIR.code,
      name: apiFIR.name,
      firControllingCountries: CountryModel.deserializeList(apiFIR.firControllingCountries),
      firLandmassCountries: CountryModel.deserializeList(apiFIR.firLandmassCountries),
      appliedFeeRequirements: apiFIR.appliedFeeRequirements?.map(
        entity =>
          new EntityMapModel({
            entityId: entity.feeRequirement?.feeRequirementId,
            id: entity.id || entity.appliedFeeRequirementId,
            name: entity.feeRequirement?.name,
          })
      ),
      status: StatusTypeModel.deserialize(apiFIR.status),
      accessLevel: AccessLevelModel.deserialize(apiFIR.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiFIR.sourceType),
    };
    return new FIRModel(data);
  }

  static deserializeList(apiFIRList: IAPIFIR[]): FIRModel[] {
    return apiFIRList ? apiFIRList.map((apiFIR: IAPIFIR) => FIRModel.deserialize(apiFIR)) : [];
  }
}

import {
  DistanceModel,
  Item10AModel,
  UsCustomDecalModel,
  WeightsModel,
  WindLimitationModel,
  Item18Model,
  Item10BModel,
  Item19Model,
} from './index';
import { IAPIAircraftRegistry } from '../../Interfaces';
import { CoreModel, ISelectOption, modelProtection, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
@modelProtection
export class AircraftRegistryModel extends CoreModel implements ISelectOption {
  registry: string;
  registryStartDate: string;
  registryEndDate: string;
  acas: SettingsTypeModel;
  airframe: SettingsTypeModel;
  isOceanicClearanceEnabled: boolean;
  isPDCRegistered: boolean;
  isDummyRegistry: boolean;
  usCustomsDecal: UsCustomDecalModel;
  weights: WeightsModel;
  distance: DistanceModel;
  item10A: Item10AModel;
  item10B: Item10BModel;
  item18: Item18Model;
  item19: Item19Model;
  windLimitation: WindLimitationModel;
  registryNationality: IdNameCodeModel;
  wakeTurbulenceGroup: SettingsTypeModel;

  constructor(data?: Partial<Item10AModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIAircraftRegistry): AircraftRegistryModel {
    if (!apiData) {
      return new AircraftRegistryModel();
    }
    const data: Partial<AircraftRegistryModel> = {
      ...apiData,
      registryNationality: IdNameCodeModel.deserialize({
        id: apiData.registrationNationalityId,
        name: apiData.registrationNationalityCode,
        code: apiData.registrationNationalityCode,
      }),
      acas: SettingsTypeModel.deserialize({ ...apiData.acas, id: apiData.acas.acasId }),
      airframe: SettingsTypeModel.deserialize({ name: apiData.airframe.serialNumber, id: apiData.airframe.airframeId }),
      usCustomsDecal: UsCustomDecalModel.deserialize(apiData.usCustomsDecal),
      weights: WeightsModel.deserialize(apiData.weights),
      distance: DistanceModel.deserialize(apiData.distance),
      item10A: Item10AModel.deserialize(apiData.item10A),
      item10B: Item10BModel.deserialize(apiData.item10B),
      item18: Item18Model.deserialize(apiData.item18),
      item19: Item19Model.deserialize(apiData.item19),
      windLimitation: WindLimitationModel.deserialize(apiData.windLimitation),
      wakeTurbulenceGroup: SettingsTypeModel.deserialize({
        id: apiData.wakeTurbulenceGroup?.wakeTurbulenceGroupId || apiData.wakeTurbulenceGroup.id,
        ...apiData.wakeTurbulenceGroup,
      }),
    };
    return new AircraftRegistryModel(data);
  }

  static deserializeList(apiDataList: IAPIAircraftRegistry[]): AircraftRegistryModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIAircraftRegistry) => AircraftRegistryModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIAircraftRegistry {
    return {
      statusId: this.status.id,
      accessLevelId: this.accessLevel.id,
      sourceTypeId: this.sourceType.id,
      id: this.id,
      registry: this.registry,
      registrationNationalityId: this.registryNationality.id,
      registrationNationalityCode: this.registryNationality.code,
      registryStartDate: this.registryStartDate,
      registryEndDate: this.registryEndDate,
      acasId: this.acas.id,
      airframeId: this.airframe.id,
      isOceanicClearanceEnabled: this.isOceanicClearanceEnabled,
      isPDCRegistered: this.isPDCRegistered,
      isDummyRegistry: this.isDummyRegistry,
      wakeTurbulenceGroupId: this.wakeTurbulenceGroup.id,
    };
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import {
  RegistrySequenceBaseModel,
  DistanceModel,
  UsCustomDecalModel,
  WeightsModel,
  WindLimitationModel,
} from './index';
import { IAPIItem19 } from '../../Interfaces';

@modelProtection
export class Item19Model extends CoreModel implements ISelectOption {
  radios: RegistrySequenceBaseModel[];
  usCustomsDecal: UsCustomDecalModel;
  weights: WeightsModel;
  distance: DistanceModel;
  windLimitation: WindLimitationModel;

  constructor(data?: Partial<Item19Model>) {
    super(data);
    Object.assign(this, data);
    this.radios = data?.radios?.map(a => new RegistrySequenceBaseModel(a)) || [];
    this.usCustomsDecal = new UsCustomDecalModel(data?.usCustomsDecal);
    this.weights = new WeightsModel(data?.weights);
    this.distance = new DistanceModel(data?.distance);
    this.windLimitation = new WindLimitationModel(data?.windLimitation);
  }

  static deserialize(apiData: IAPIItem19): Item19Model {
    if (!apiData) {
      return new Item19Model();
    }
    const data: Partial<Item19Model> = {
      ...apiData,
      radios: RegistrySequenceBaseModel.deserializeList(apiData.radios),
      usCustomsDecal: UsCustomDecalModel.deserialize(apiData.usCustomsDecal),
      weights: WeightsModel.deserialize(apiData.weights),
      distance: DistanceModel.deserialize(apiData.distance),
      windLimitation: WindLimitationModel.deserialize(apiData.windLimitation),
    };
    return new Item19Model(data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

import { IAPISeries } from '../Interfaces';
import { AircraftModel } from './AircraftModel.model';
import { AccessLevelModel, CoreModel, SourceTypeModel, modelProtection } from '@wings-shared/core';

@modelProtection
export class SeriesModel extends CoreModel {
  seriesModels: AircraftModel[];

  constructor(data?: Partial<SeriesModel>) {
    super(data);
    Object.assign(this, data);
    this.seriesModels = data?.seriesModels?.map(x => new AircraftModel(x)) || [];
  }

  static deserialize(apiData: IAPISeries): SeriesModel {
    if (!apiData) {
      return new SeriesModel();
    }
    const data: Partial<SeriesModel> = {
      ...apiData,
      id: apiData.seriesId || apiData.id,
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      seriesModels: apiData.seriesModels?.map(x => AircraftModel.deserialize({ ...x.model, id: x.model?.modelId })),
    };
    return new SeriesModel(data);
  }

  public serialize(): IAPISeries {
    return {
      id: this.id,
      name: this.name,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
      modelIds: this.seriesModels?.map(x => x.id),
    };
  }

  static deserializeList(apiDataList: IAPISeries[]): SeriesModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPISeries) => SeriesModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

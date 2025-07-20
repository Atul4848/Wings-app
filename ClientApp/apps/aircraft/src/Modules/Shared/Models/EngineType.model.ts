import { IAPIEngineType } from '../Interfaces';
import { SeriesModel } from './Series.model';
import { AccessLevelModel, CoreModel, ISelectOption, SourceTypeModel, modelProtection } from '@wings-shared/core';
@modelProtection
export class EngineTypeModel extends CoreModel implements ISelectOption {
  engineTypeSeries: SeriesModel[];
  constructor(data?: Partial<EngineTypeModel>) {
    super(data);
    Object.assign(this, data);
    this.engineTypeSeries = data?.engineTypeSeries?.map(x => new SeriesModel(x)) || [];
  }

  static deserialize(apiEngineType: IAPIEngineType): EngineTypeModel {
    if (!apiEngineType) {
      return new EngineTypeModel();
    }
    const data: Partial<EngineTypeModel> = {
      ...apiEngineType,
      accessLevel: AccessLevelModel.deserialize(apiEngineType.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiEngineType.sourceType),
      engineTypeSeries:
        apiEngineType.engineTypeSeries?.map(x => SeriesModel.deserialize({ ...x.series, id: x.series?.seriesId })) ||
        [],
    };
    return new EngineTypeModel(data);
  }

  public serialize(): IAPIEngineType {
    return {
      id: this.id,
      name: this.name,
      seriesIds: this.engineTypeSeries?.map(x => x.id),
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
    };
  }

  static deserializeList(apiDataList: IAPIEngineType[]): EngineTypeModel[] {
    return apiDataList ? apiDataList.map((apiData: IAPIEngineType) => EngineTypeModel.deserialize(apiData)) : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

import { modelProtection, CoreModel, ISelectOption } from '@wings-shared/core';
import { IAPIRunwayLightType } from '../Interfaces';

@modelProtection
export class RunwayLightTypeModel extends CoreModel implements ISelectOption {
  id: number = 0;
  code: string = '';
  faaCode: string = '';
  description: string = '';

  constructor(data?: Partial<RunwayLightTypeModel>) {
    super();
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIRunwayLightType): RunwayLightTypeModel {
    if (!apiData) {
      return new RunwayLightTypeModel();
    }
    const data: Partial<RunwayLightTypeModel> = {
      ...apiData,
      id: apiData.runwayLightTypeId || apiData.id,
    };
    return new RunwayLightTypeModel(data);
  }

  static deserializeList(apiDataList: IAPIRunwayLightType[]): RunwayLightTypeModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRunwayLightType) => RunwayLightTypeModel.deserialize(apiData))
      : [];
  }

  public serialize(): IAPIRunwayLightType {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      faaCode: this.faaCode,
      description: this.description,
      sourceTypeId: this.sourceTypeId,
      accessLevelId: this.accessLevelId,
      statusId: this.status?.value,
    };
  }

  public get label(): string {
    if (this.name && this.code) {
      return `${this.name} (${this.code})`;
    }
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

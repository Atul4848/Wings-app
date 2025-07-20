import { IAPIPerformanceLink } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  SourceTypeModel,
  StatusTypeModel,
  modelProtection,
} from '@wings-shared/core';

@modelProtection
export class PerformanceLinkModel extends CoreModel implements ISelectOption {
  id: number = 0;
  link: string = '';
  description: string = '';

  constructor(data?: Partial<PerformanceLinkModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPIPerformanceLink): PerformanceLinkModel {
    if (!apiData) {
      return new PerformanceLinkModel();
    }
    const data: Partial<PerformanceLinkModel> = {
      ...apiData,
      id: apiData.performanceLinkId,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new PerformanceLinkModel(data);
  }

  public serialize(): IAPIPerformanceLink {
    return {
      id: this.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevelId,
      sourceTypeId: this.sourceTypeId,
      link: this.link,
      description: this.description,
    };
  }

  static deserializeList(apiDataList: IAPIPerformanceLink[]): PerformanceLinkModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPerformanceLink) => PerformanceLinkModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.link;
  }

  public get value(): string | number {
    return this.id;
  }
}

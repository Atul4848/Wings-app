import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
} from '@wings-shared/core';
import { IAPIHealthAuthorizationLink } from '../Interfaces';

@modelProtection
export class HealthAuthorizationLinkModel extends CoreModel implements ISelectOption {
  id: number = 0;
  link: string = '';
  description: string = '';
  tempId: number = Utilities.getTempId(true);

  constructor(data?: Partial<HealthAuthorizationLinkModel>) {
    super(data);
    Object.assign(this, data);
    this.accessLevel = new AccessLevelModel(data?.accessLevel || { id: 2, name: 'Private' });
  }

  static deserialize(apiData: IAPIHealthAuthorizationLink): HealthAuthorizationLinkModel {
    if (!apiData) {
      return new HealthAuthorizationLinkModel();
    }
    const data: Partial<HealthAuthorizationLinkModel> = {
      ...apiData,
      id: apiData.healthAuthorizationLinkId || apiData.id,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new HealthAuthorizationLinkModel(data);
  }

  public serialize(): IAPIHealthAuthorizationLink {
    return {
      id: this.id,
      statusId: this.statusId,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceTypeId,
      link: this.link,
      description: this.description,
    };
  }

  public isIdExist(data: HealthAuthorizationLinkModel): boolean {
    return Boolean(this.id) ? Utilities.isEqual(this.id, data.id) : Utilities.isEqual(this.tempId, data.tempId);
  }

  static deserializeList(apiDataList: IAPIHealthAuthorizationLink[]): HealthAuthorizationLinkModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIHealthAuthorizationLink) => HealthAuthorizationLinkModel.deserialize(apiData))
      : [];
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

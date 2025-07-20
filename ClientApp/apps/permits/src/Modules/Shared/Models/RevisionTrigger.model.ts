import { CoreModel, EntityMapModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { IAPIRevisionTrigger } from '../Interfaces';

@modelProtection
export class RevisionTriggerModel extends CoreModel {
  permitAdditionalInfoId: number;
  process: string = '';
  missionElement: SettingsTypeModel;
  dataElements: EntityMapModel[] = [];

  constructor(data?: Partial<RevisionTriggerModel>) {
    super(data);
    Object.assign(this, data);
    this.missionElement = data?.missionElement ? new SettingsTypeModel(data?.missionElement) : null;
    this.dataElements = data?.dataElements ? data?.dataElements?.map(x => new EntityMapModel(x)) : [];
  }

  static deserialize(apiData: IAPIRevisionTrigger): RevisionTriggerModel {
    if (!apiData) {
      return new RevisionTriggerModel();
    }
    return new RevisionTriggerModel({
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id || apiData.permitAdditionalInfoRevisionId,
      missionElement: new SettingsTypeModel({
        ...apiData.missionElement,
        id: apiData.missionElement?.missionElementId,
      }),
      dataElements: apiData.appliedPermitDataElements?.map(
        x =>
          new EntityMapModel({
            entityId: x.appliedPermitDataElementId,
            id: x.dataElement.dataElementId,
            name: x.dataElement.name,
          })
      ),
    });
  }

  public serialize(): IAPIRevisionTrigger {
    return {
      ...this._serialize(),
      id: this.id || 0,
      permitAdditionalInfoId: this.permitAdditionalInfoId || 0,
      process: this.process,
      missionElementId: this.missionElement?.id,
      dataElementIds: this.dataElements?.map(x => x.id),
    };
  }

  static deserializeList(apiDataList: IAPIRevisionTrigger[]): RevisionTriggerModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIRevisionTrigger) => RevisionTriggerModel.deserialize(apiData))
      : [];
  }
}

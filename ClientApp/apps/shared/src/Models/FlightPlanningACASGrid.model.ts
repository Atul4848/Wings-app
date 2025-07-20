import {
  AccessLevelModel,
  CoreModel,
  EntityMapModel,
  SettingsTypeModel,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
} from '@wings-shared/core';
import { IAPIACASIIAdditionalInformation, IAPIACASIIAdditionalInformationRequest } from '../Interfaces';

export class FlightPlanningACASGridModel extends CoreModel {
  paxMin?: number;
  airworthinessDate?: string;
  mtowMin?: number;
  flightOperationalCategoryId?: number;
  flightOperationalCategoryName?: string;
  flightOperationalCategory: EntityMapModel;
  requirementType: SettingsTypeModel;
  requirementTypeId?: number;

  constructor(data?: Partial<FlightPlanningACASGridModel>) {
    super(data);
    Object.assign(this, data);
    this.status = new StatusTypeModel(data?.status);
    this.accessLevel = new AccessLevelModel(data?.accessLevel);
    this.sourceType = data?.sourceType ? new SourceTypeModel(data?.sourceType) : null;
  }

  static deserialize(apiData: IAPIACASIIAdditionalInformation): FlightPlanningACASGridModel {
    if (!apiData) {
      return new FlightPlanningACASGridModel();
    }

    return new FlightPlanningACASGridModel({
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id,
      paxMin: apiData.paxMin,
      airworthinessDate: apiData.airworthinessDate,
      mtowMin: apiData.mtowMin,
      flightOperationalCategory: new EntityMapModel({
        id: apiData.flightOperationalCategoryId || 0,
        entityId: apiData.flightOperationalCategoryId,
        name: apiData.flightOperationalCategoryName,
      }),
      requirementType: new SettingsTypeModel({
        id: apiData.requirementType.requirementTypeId,
        name: apiData.requirementType.name,
      }),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    });
  }

  static deserializeList(apiDataList: IAPIACASIIAdditionalInformation[]): FlightPlanningACASGridModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIACASIIAdditionalInformation) => FlightPlanningACASGridModel.deserialize(apiData))
      : [];
  }

  // serialize object for create/update API
  public serialize(): IAPIACASIIAdditionalInformationRequest {
    return {
      id: this.id,
      paxMin: Utilities.getNumberOrNullValue(this.paxMin),
      airworthinessDate: this.airworthinessDate || null,
      mtowMin: Utilities.getNumberOrNullValue(this.mtowMin),
      flightOperationalCategoryId: this.flightOperationalCategory.entityId,
      flightOperationalCategoryName: this.flightOperationalCategory.name,
      requirementTypeId: this.requirementType.id,
      ...this._serialize(),
    };
  }
}

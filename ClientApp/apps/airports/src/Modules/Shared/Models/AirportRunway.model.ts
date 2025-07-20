import { IAPIAirportRunway, IAPIRunwayDetail } from '../Interfaces';
import {
  AccessLevelModel,
  CoreModel,
  ISelectOption,
  modelProtection,
  SourceTypeModel,
  StatusTypeModel,
  Utilities,
  SettingsTypeModel,
} from '@wings-shared/core';
import { RunwaySettingsTypeModel } from './RunwaySettingsTypeModel.model';
import { RunwayDetailModel } from './RunwayDetail.model';
import { RunwayLightTypeModel } from './RunwayLightType.model';

@modelProtection
export class AirportRunwayModel extends CoreModel implements ISelectOption {
  airportId: number = null;
  runwayId: string = '';
  runwayLength: number = null;
  width: number = null;
  elevation: number = null;
  centerLineSpacing: number = null;
  statusDate: string = '';
  runwaySurfaceTreatment: RunwaySettingsTypeModel;
  runwaySurfacePrimaryType: RunwaySettingsTypeModel;
  runwaySurfaceSecondaryType: RunwaySettingsTypeModel;
  runwayLightType: RunwayLightTypeModel;
  runwayCondition: RunwaySettingsTypeModel;
  runwayUsageType: SettingsTypeModel;
  reciprocal: RunwayDetailModel;
  base: RunwayDetailModel;
  isHardSurface?: boolean;
  // UI Fields
  hasRunwayDetails: boolean = false;

  constructor(data?: Partial<AirportRunwayModel>) {
    super(data);
    Object.assign(this, data);
    this.runwaySurfaceTreatment = new RunwaySettingsTypeModel(data?.runwaySurfaceTreatment);
    this.runwaySurfacePrimaryType = new RunwaySettingsTypeModel(data?.runwaySurfacePrimaryType);
    this.runwaySurfaceSecondaryType = new RunwaySettingsTypeModel(data?.runwaySurfaceSecondaryType);
    this.runwayLightType = new RunwayLightTypeModel(data?.runwayLightType);
    this.runwayCondition = new RunwaySettingsTypeModel(data?.runwayCondition);
    this.runwayUsageType = new SettingsTypeModel(data?.runwayUsageType);
    this.reciprocal = new RunwayDetailModel(data?.reciprocal);
    this.base = new RunwayDetailModel(data?.base);
    this.hasRunwayDetails = Boolean(this.getRunwayDetails.length);
  }

  public get getRunwayDetails(): RunwayDetailModel[] {
    const runwayDetails: RunwayDetailModel[] = [];

    if (Boolean(this.base.runwayNumber)) {
      runwayDetails.push(this.base);
    }
    if (Boolean(this.reciprocal.runwayNumber)) {
      runwayDetails.push(this.reciprocal);
    }
    return runwayDetails;
  }

  public static deserialize(apiData: IAPIAirportRunway): AirportRunwayModel {
    if (!apiData) {
      return new AirportRunwayModel();
    }
    const { length, ...rest } = apiData;
    const data: Partial<AirportRunwayModel> = {
      ...rest,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.runwayId || apiData.id,
      runwayId: apiData.runway_Id,
      runwayLength: length,
      runwaySurfaceTreatment: RunwaySettingsTypeModel.deserialize({
        ...apiData.runwaySurfaceTreatment,
        id: apiData.runwaySurfaceTreatment?.runwaySurfaceTreatmentId || apiData.runwaySurfaceTreatment?.id,
      }),
      runwaySurfacePrimaryType: RunwaySettingsTypeModel.deserialize({
        ...apiData.runwaySurfacePrimaryType,
        id: apiData.runwaySurfacePrimaryType?.runwaySurfaceTypeId || apiData.runwaySurfacePrimaryType?.id,
      }),
      runwaySurfaceSecondaryType: RunwaySettingsTypeModel.deserialize({
        ...apiData.runwaySurfaceSecondaryType,
        id: apiData.runwaySurfaceSecondaryType?.runwaySurfaceTypeId || apiData.runwaySurfaceSecondaryType?.id,
      }),
      runwayLightType: RunwayLightTypeModel.deserialize({
        ...apiData.runwayLightType,
        id: apiData.runwayLightType?.runwayLightTypeId || apiData.runwayLightType?.id,
      }),
      runwayCondition: RunwaySettingsTypeModel.deserialize({
        ...apiData.runwayCondition,
        id: apiData.runwayCondition?.runwayConditionId || apiData.runwayCondition?.id,
      }),
      runwayUsageType: SettingsTypeModel.deserialize({
        ...apiData.runwayUsageType,
        id: apiData.runwayUsageType?.runwayUsageTypeId || apiData.runwayUsageType?.id,
      }),
      base: this.deserializeRunwayDetail(apiData, 1),
      reciprocal: this.deserializeRunwayDetail(apiData, 2),
      isHardSurface: apiData.runwaySurfacePrimaryType?.isHardSurface,
    };
    return new AirportRunwayModel(data);
  }

  private static deserializeRunwayDetail(apiData: IAPIAirportRunway, typeId: number): RunwayDetailModel {
    const detail = apiData.runwayDetail?.find(a => a.runwayType?.runwayTypeId === typeId);
    return RunwayDetailModel.deserialize(detail);
  }

  // serialize object for create/update API
  public serialize(): IAPIAirportRunway {
    return {
      id: this.id || 0,
      runway_Id: this.runwayId,
      length: Utilities.getNumberOrNullValue(this.runwayLength),
      width: Utilities.getNumberOrNullValue(this.width),
      airportId: Utilities.getNumberOrNullValue(this.airportId),
      elevation: Utilities.getNumberOrNullValue(this.elevation),
      centerLineSpacing: Utilities.getNumberOrNullValue(this.centerLineSpacing),
      statusDate: this.statusDate || null,
      runwaySurfaceTreatmentId: this.runwaySurfaceTreatment.id,
      runwaySurfacePrimaryTypeId: this.runwaySurfacePrimaryType.id,
      runwaySurfaceSecondaryTypeId: this.runwaySurfaceSecondaryType.id,
      runwayLightTypeId: Utilities.getNumberOrNullValue(this.runwayLightType.id),
      runwayConditionId: this.runwayCondition.id,
      runwayUsageTypeId: this.runwayUsageType.id,
      runwayDetail: this.getRunwayDetails.map(x => x.serialize()),
      statusId: this.status?.value,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id || 1,
    };
  }

  public static deserializeList(runways: IAPIAirportRunway[]): AirportRunwayModel[] {
    return runways ? runways.map(runway => AirportRunwayModel.deserialize(runway)) : [];
  }

  // required for dropdown
  public get label(): string {
    const hardSurface: string = this.isHardSurface && 'H';
    return [ this.runwayId, this.runwaySurfacePrimaryType?.label, this.runwayLength, hardSurface ]
      .filter(x => x)
      .join(' - ');
  }

  public get value(): number {
    return this.id;
  }
}

import { CruisePolicyScheduleModel, PerformanceLinkModel } from './index';
import { IAPIPerformanceResponse, IAPIPerformanceRequest } from '../Interfaces';
import { PolicyScheduleModel } from './PolicySchedule.model';
import { GenericRegistryModel } from './GenericRegistry.model';
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

@modelProtection
export class PerformanceModel extends CoreModel implements ISelectOption {
  id: number = 0;
  comments: string = '';
  fomS230: string = '';
  maxFlightLevel: string = '';
  mtowInPounds: number = null;
  mtowInKilos: number = null;
  isVerificationComplete: boolean = false;
  defaultClimbSchedule: SettingsTypeModel;
  defaultHoldSchedule: SettingsTypeModel;
  defaultDescentSchedule: SettingsTypeModel;
  defaultCruiseSchedule: SettingsTypeModel;
  performanceLinks: PerformanceLinkModel[] = [];
  climbSchedules: PolicyScheduleModel[] = [];
  holdSchedules: PolicyScheduleModel[] = [];
  descentSchedules: PolicyScheduleModel[] = [];
  cruiseSchedules: CruisePolicyScheduleModel[] = [];
  icaoTypeDesignator: SettingsTypeModel;
  wakeTurbulenceCategory: SettingsTypeModel;
  navBlueGenericRegistries: GenericRegistryModel[];
  isRestricted: boolean = false;

  constructor(data?: Partial<PerformanceModel>) {
    super(data);
    Object.assign(this, data);
    this.performanceLinks = data?.performanceLinks?.map(x => new PerformanceLinkModel(x)) || [];
    this.climbSchedules = data?.climbSchedules?.map(x => new PolicyScheduleModel(x)) || [];
    this.holdSchedules = data?.holdSchedules?.map(x => new PolicyScheduleModel(x)) || [];
    this.descentSchedules = data?.descentSchedules?.map(x => new PolicyScheduleModel(x)) || [];
    this.cruiseSchedules = data?.cruiseSchedules?.map(x => new CruisePolicyScheduleModel(x)) || [];
    this.navBlueGenericRegistries = data?.navBlueGenericRegistries?.map(x => new GenericRegistryModel(x)) || [];
    this.defaultClimbSchedule = new SettingsTypeModel(data?.defaultClimbSchedule);
    this.defaultHoldSchedule = new SettingsTypeModel(data?.defaultHoldSchedule);
    this.defaultDescentSchedule = new SettingsTypeModel(data?.defaultDescentSchedule);
    this.defaultCruiseSchedule = new SettingsTypeModel(data?.defaultCruiseSchedule);
    this.icaoTypeDesignator = data?.icaoTypeDesignator?.id ? new SettingsTypeModel(data?.icaoTypeDesignator) : null;
    this.wakeTurbulenceCategory = data?.wakeTurbulenceCategory?.id
      ? new SettingsTypeModel(data?.wakeTurbulenceCategory)
      : null;
    this.sourceType = new SourceTypeModel({
      id: data?.sourceType?.id || 3,
      name: data?.sourceType?.name || 'NavBlue',
    });
  }

  static deserialize(apiData: IAPIPerformanceResponse): PerformanceModel {
    if (!apiData) {
      return new PerformanceModel();
    }
    const data: Partial<PerformanceModel> = {
      ...apiData,
      id: apiData.performanceId || apiData.id,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
      defaultClimbSchedule: new SettingsTypeModel({
        id: apiData.defaultClimbSchedule?.climbScheduleId,
        name: apiData.defaultClimbSchedule?.profile,
      }),
      defaultHoldSchedule: new SettingsTypeModel({
        id: apiData.defaultHoldSchedule?.holdScheduleId,
        name: apiData.defaultHoldSchedule?.profile,
      }),
      defaultDescentSchedule: new SettingsTypeModel({
        id: apiData.defaultDescentSchedule?.descentScheduleId,
        name: apiData.defaultDescentSchedule?.profile,
      }),
      climbSchedules:
        apiData.climbSchedules?.map(a =>
          PolicyScheduleModel.deserialize({
            ...a,
            id: a.climbScheduleId,
            isDefault:
              apiData.climbSchedules.length === 1 ||
              Utilities.isEqual(a.climbScheduleId, apiData.defaultClimbSchedule?.climbScheduleId),
          })
        ) || [],
      holdSchedules:
        apiData.holdSchedules?.map(a =>
          PolicyScheduleModel.deserialize({
            ...a,
            id: a.holdScheduleId,
            isDefault:
              apiData.holdSchedules.length === 1 ||
              Utilities.isEqual(a.holdScheduleId, apiData.defaultHoldSchedule?.holdScheduleId),
          })
        ) || [],
      descentSchedules:
        apiData.descentSchedules?.map(a =>
          PolicyScheduleModel.deserialize({
            ...a,
            id: a.descentScheduleId,
            isDefault:
              apiData.descentSchedules.length === 1 ||
              Utilities.isEqual(a.descentScheduleId, apiData.defaultDescentSchedule?.descentScheduleId),
          })
        ) || [],
      cruiseSchedules:
        apiData.cruiseSchedules?.map(a =>
          CruisePolicyScheduleModel.deserialize({
            ...a,
            id: a.cruiseScheduleId,
            isDefault:
              apiData.cruiseSchedules.length === 1 ||
              Utilities.isEqual(a.cruiseScheduleId, apiData.defaultCruiseSchedule?.cruiseScheduleId),
          })
        ) || [],
      defaultCruiseSchedule: new SettingsTypeModel({
        id: apiData.defaultCruiseSchedule?.cruiseScheduleId,
        name: apiData.defaultCruiseSchedule?.profile,
      }),
      performanceLinks: apiData.performanceLinks?.map(x => PerformanceLinkModel.deserialize(x)),
      wakeTurbulenceCategory: SettingsTypeModel.deserialize({
        ...apiData.wakeTurbulenceCategory,
        id: apiData.wakeTurbulenceCategory?.wakeTurbulenceCategoryId || null,
      }),
      icaoTypeDesignator: SettingsTypeModel.deserialize({
        ...apiData.icaoTypeDesignator,
        id: apiData.icaoTypeDesignator?.icaoTypeDesignatorId || null,
      }),
      navBlueGenericRegistries: GenericRegistryModel.deserializeList(apiData.navBlueGenericRegistries),
    };
    return new PerformanceModel(data);
  }

  public serialize(): IAPIPerformanceRequest {
    return {
      id: this.id,
      name: this.name,
      isRestricted: this.isRestricted,
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
      comments: this.comments,
      fomS230: this.fomS230,
      maxFlightLevel: this.maxFlightLevel || null,
      mtowInPounds: Utilities.getNumberOrNullValue(this.mtowInPounds),
      mtowInKilos: Utilities.getNumberOrNullValue(this.mtowInKilos),
      defaultClimbScheduleId: this.defaultClimbSchedule?.id || null,
      defaultHoldScheduleId: this.defaultHoldSchedule?.id || null,
      defaultDescentScheduleId: this.defaultDescentSchedule?.id || null,
      defaultCruiseScheduleId: this.defaultCruiseSchedule?.id || null,
      performanceLinks: this.performanceLinks?.map(x => x.serialize()),
      climbSchedules: this.climbSchedules?.map(x => x.schedule.id),
      holdSchedules: this.holdSchedules?.map(x => x.schedule.id),
      descentSchedules: this.descentSchedules?.map(x => x.schedule.id),
      cruiseSchedules: this.cruiseSchedules?.map(x => x.schedule.id),
      icaoTypeDesignatorId: this.icaoTypeDesignator?.id || null,
      wakeTurbulenceCategoryId: this.wakeTurbulenceCategory?.id || null,
      isVerificationComplete: this.isVerificationComplete,
    };
  }

  static deserializeList(apiDataList: IAPIPerformanceResponse[]): PerformanceModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIPerformanceResponse) => PerformanceModel.deserialize(apiData))
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

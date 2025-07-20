import {
  AccessLevelModel,
  CoreModel,
  SourceTypeModel,
  StatusTypeModel,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';
import { ScheduleRestrictionEntityModel } from '../Models';
import { IAPIScheduleRestrictions } from '../Interfaces';

@modelProtection
export class ScheduleRestrictionsModel extends CoreModel {
  id: number = 0;
  startDate: string = '';
  endDate: string = '';
  isAllDeparture: boolean = false;
  isAllArrival: boolean = false;
  isAllOverFlight: boolean = false;
  restrictionType: SettingsTypeModel;
  restrictingEntities: ScheduleRestrictionEntityModel[] = [];
  departureLevel: SettingsTypeModel;
  departureLevelEntities: ScheduleRestrictionEntityModel[] = [];
  arrivalLevel: SettingsTypeModel;
  arrivalLevelEntities: ScheduleRestrictionEntityModel[] = [];
  overFlightLevel: SettingsTypeModel;
  overFlightLevelEntities: ScheduleRestrictionEntityModel[] = [];
  departureEntityExceptions: ScheduleRestrictionEntityModel[] = [];
  arrivalEntityExceptions: ScheduleRestrictionEntityModel[] = [];
  overFlightEntityExceptions: ScheduleRestrictionEntityModel[] = [];
  farTypes: ScheduleRestrictionEntityModel[] = [];
  validatedDate: string = '';
  validatedBy: string = '';
  validationNotes: string = '';

  constructor(data?: Partial<ScheduleRestrictionsModel>) {
    super(data);
    Object.assign(this, data);
    this.restrictionType = new SettingsTypeModel(data?.restrictionType);
    this.departureLevel = new SettingsTypeModel(data?.departureLevel);
    this.arrivalLevel = new SettingsTypeModel(data?.arrivalLevel);
    this.overFlightLevel = new SettingsTypeModel(data?.overFlightLevel);
    this.restrictingEntities =
      data?.restrictingEntities?.map(entity => new ScheduleRestrictionEntityModel(entity)) || [];
    this.departureLevelEntities =
      data?.departureLevelEntities?.map(entity => new ScheduleRestrictionEntityModel(entity)) || [];
    this.arrivalLevelEntities =
      data?.arrivalLevelEntities?.map(entity => new ScheduleRestrictionEntityModel(entity)) || [];
    this.overFlightLevelEntities =
      data?.overFlightLevelEntities?.map(entity => new ScheduleRestrictionEntityModel(entity)) || [];
    this.departureEntityExceptions =
      data?.departureEntityExceptions?.map(entity => new ScheduleRestrictionEntityModel(entity)) || [];
    this.arrivalEntityExceptions =
      data?.arrivalEntityExceptions?.map(entity => new ScheduleRestrictionEntityModel(entity)) || [];
    this.overFlightEntityExceptions =
      data?.overFlightEntityExceptions?.map(entity => new ScheduleRestrictionEntityModel(entity)) || [];
    this.farTypes = data?.farTypes?.map(farType => new ScheduleRestrictionEntityModel(farType)) || [];
  }

  static deserialize(apiData: IAPIScheduleRestrictions): ScheduleRestrictionsModel {
    if (!apiData) {
      return new ScheduleRestrictionsModel();
    }
    const data: Partial<ScheduleRestrictionsModel> = {
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.scheduleRestrictionId || apiData.id,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      validatedDate: apiData.validatedDate,
      validatedBy: apiData.validatedBy,
      validationNotes: apiData.validationNotes,
      isAllDeparture: apiData.isAllDeparture,
      isAllArrival: apiData.isAllArrival,
      isAllOverFlight: apiData.isAllOverFlight,
      restrictionType: SettingsTypeModel.deserialize({
        ...apiData.restrictionType,
        id: apiData.restrictionType?.restrictionTypeId,
      }),
      restrictingEntities: apiData.restrictingEntities.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.restrictingEntityId,
        })
      ),
      departureLevel: SettingsTypeModel.deserialize({
        ...apiData.scheduleDepartureLevel,
        id: apiData.scheduleDepartureLevel?.scheduleDepartureLevelId,
      }),
      departureLevelEntities: apiData.scheduleDepartureLevelEntities?.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.scheduleDepartureLevelEntityId,
        })
      ),
      arrivalLevel: SettingsTypeModel.deserialize({
        ...apiData.scheduleArrivalLevel,
        id: apiData.scheduleArrivalLevel?.scheduleArrivalLevelId,
      }),
      arrivalLevelEntities: apiData.scheduleArrivalLevelEntities?.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.scheduleArrivalLevelEntityId,
        })
      ),
      overFlightLevel: SettingsTypeModel.deserialize({
        ...apiData.scheduleOverFlightLevel,
        id: apiData.scheduleOverFlightLevel?.scheduleOverFlightLevelId,
      }),
      overFlightLevelEntities: apiData.scheduleOverFlightLevelEntities?.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.scheduleOverFlightLevelEntityId,
        })
      ),
      departureEntityExceptions: apiData.scheduleDepartureLevelEntityExceptions?.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.scheduleDepartureLevelEntityExceptionId,
        })
      ),
      arrivalEntityExceptions: apiData.scheduleArrivalLevelEntityExceptions?.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.scheduleArrivalLevelEntityExceptionId,
        })
      ),
      overFlightEntityExceptions: apiData.scheduleOverFlightLevelEntityExceptions?.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.scheduleOverFlightLevelEntityExceptionId,
        })
      ),
      farTypes: apiData.farTypes?.map(entity =>
        ScheduleRestrictionEntityModel.deserialize({
          ...entity,
          id: entity.farTypeId,
        })
      ),
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return new ScheduleRestrictionsModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIScheduleRestrictions {
    return {
      id: this.id || 0,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      isAllDeparture: this.isAllDeparture || false,
      isAllArrival: this.isAllArrival || false,
      isAllOverFlight: this.isAllOverFlight || false,
      restrictionTypeId: this.restrictionType?.id || null,
      restrictingEntities: this.restrictingEntities?.map(entity => entity.serialize(this.id)),
      scheduleDepartureLevelId: this.departureLevel?.id || null,
      scheduleDepartureLevelEntities: this.departureLevelEntities?.map(entity => entity.serialize(this.id)),
      scheduleDepartureLevelEntityExceptions: this.departureEntityExceptions?.map(entity => entity.serialize(this.id)),
      scheduleArrivalLevelId: this.arrivalLevel?.id || null,
      scheduleArrivalLevelEntities: this.arrivalLevelEntities?.map(entity => entity.serialize(this.id)),
      scheduleArrivalLevelEntityExceptions: this.arrivalEntityExceptions?.map(entity => entity.serialize(this.id)),
      scheduleOverFlightLevelId: this.overFlightLevel?.id || null,
      scheduleOverFlightLevelEntities: this.overFlightLevelEntities?.map(entity => entity.serialize(this.id)),
      scheduleOverFlightLevelEntityExceptions: this.overFlightEntityExceptions?.map(entity =>
        entity.serialize(this.id)
      ),
      farTypes: this.farTypes.map(entity => entity.serialize(this.id)),
      validatedDate: this.validatedDate || null,
      validatedBy: this.validatedBy,
      validationNotes: this.validationNotes,
      sourceTypeId: this.sourceType?.id,
      accessLevelId: this.accessLevel?.id,
      statusId: this.status?.id,
    };
  }

  static deserializeList(apiDataList: IAPIScheduleRestrictions[]): ScheduleRestrictionsModel[] {
    return apiDataList
      ? apiDataList.map((apiData: IAPIScheduleRestrictions) => ScheduleRestrictionsModel.deserialize(apiData))
      : [];
  }
}

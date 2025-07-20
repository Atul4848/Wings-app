import { IAPIAirportPermission, IAPIAirportPermissionRequest } from '../Interfaces';
import { CoreModel, EntityMapModel, IdNameCodeModel, SettingsTypeModel } from '@wings-shared/core';
import { PermissionLeadTimeModel } from './PermissionLeadTime.model';
import { PermissionExceptionModel } from './PermissionException.model';
import { PermissionToleranceModel } from './PermissionTolerance.model';

export class AirportPermissionModel extends CoreModel {
  startDate: string = '';
  endDate: string = '';
  formLink: string = '';
  templateID: string = '';
  idNumberItem18Format: string = '';
  idNumberIssued: boolean = null;
  idNumberRequiredInFlightPlan: boolean = null;
  slotAndPPRJointApproval: boolean = null;
  documentsRequired: boolean = null;
  specialFormsRequired: boolean = null;
  tbAorOpenScheduleAllowed: boolean = null;
  gabaNightSlotsAvailable: boolean = null;
  gabaPeakHourSlotsAvailable: boolean = null;
  airportGABAMaxArrivalSlotsPerDay: number;
  airportGABAMaxDepartureSlotsPerDay: number;
  permissionType: SettingsTypeModel;
  notificationType: SettingsTypeModel;
  confirmationRequiredFors: SettingsTypeModel[] = [];
  permissionRequiredFors: SettingsTypeModel[] = [];
  pprPurposes: SettingsTypeModel[] = [];
  documents: IdNameCodeModel[] = [];
  permissionVendors: EntityMapModel[] = [];
  permissionExceptions: PermissionExceptionModel[] = [];
  permissionLeadTimes: PermissionLeadTimeModel[] = [];
  permissionTolerances: PermissionToleranceModel[] = [];

  airportId: number;

  constructor(data?: Partial<AirportPermissionModel>) {
    super(data);
    Object.assign(this, data);
    this.documents = data?.documents?.map(x => new IdNameCodeModel(x)) || [];
    this.pprPurposes = data?.pprPurposes?.map(x => new SettingsTypeModel(x)) || [];
    this.permissionRequiredFors = data?.permissionRequiredFors?.map(x => new SettingsTypeModel(x)) || [];
    this.confirmationRequiredFors = data?.confirmationRequiredFors?.map(x => new SettingsTypeModel(x)) || [];
    this.permissionExceptions = data?.permissionExceptions?.map(x => new PermissionExceptionModel(x)) || [];
    this.permissionLeadTimes = data?.permissionLeadTimes?.map(x => new PermissionLeadTimeModel(x)) || [];
    this.permissionTolerances = data?.permissionTolerances?.map(x => new PermissionToleranceModel(x)) || [];
  }

  static deserialize(apiData: IAPIAirportPermission): AirportPermissionModel {
    if (!apiData) {
      return new AirportPermissionModel();
    }

    const data: Partial<AirportPermissionModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.permissionId || apiData.id,
      permissionType: apiData.permissionType
        ? new SettingsTypeModel({
          ...apiData.permissionType,
          id: apiData.permissionType?.permissionTypeId || apiData.permissionType?.id,
        })
        : null,
      notificationType: apiData.notificationType
        ? new SettingsTypeModel({
          ...apiData.notificationType,
          id: apiData.notificationType?.notificationTypeId || apiData.notificationType?.id,
        })
        : null,
      documents: apiData.documents?.map(
        x =>
          new IdNameCodeModel({
            ...x,
            id: x.documentId,
          })
      ),
      permissionRequiredFors: apiData.permissionRequiredFors?.map(
        x =>
          new SettingsTypeModel({
            ...x,
            id: x.permissionRequiredForId,
          })
      ),
      pprPurposes: apiData.pprPurposes?.map(
        x =>
          new SettingsTypeModel({
            ...x,
            id: x.pprPurposeId,
          })
      ),
      confirmationRequiredFors: apiData.confirmationRequiredFors?.map(
        x =>
          new SettingsTypeModel({
            ...x,
            id: x.confirmationRequiredForId,
          })
      ),
      permissionVendors: apiData.permissionVendors?.map(
        x =>
          new EntityMapModel({
            ...x,
            entityId: x.vendorId,
          })
      ),
      permissionExceptions: PermissionExceptionModel.deserializeList(apiData.permissionExceptions),
      permissionLeadTimes: PermissionLeadTimeModel.deserializeList(apiData.permissionLeadTimes),
      permissionTolerances: PermissionToleranceModel.deserializeList(apiData.permissionTolerances),
    };
    return new AirportPermissionModel(data);
  }

  // serialize object for create/update API
  public serialize(permissionId: number): IAPIAirportPermissionRequest {
    return {
      ...this._serialize(),
      id: this.id || 0,
      airportId: this.airportId || null,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      templateID: this.templateID,
      formLink: this.formLink,
      idNumberItem18Format: this.idNumberItem18Format,
      idNumberIssued: this.idNumberIssued,
      idNumberRequiredInFlightPlan: this.idNumberRequiredInFlightPlan,
      slotAndPPRJointApproval: this.slotAndPPRJointApproval,
      documentsRequired: this.documentsRequired,
      specialFormsRequired: this.specialFormsRequired,
      tbAorOpenScheduleAllowed: this.tbAorOpenScheduleAllowed,
      gabaNightSlotsAvailable: this.gabaNightSlotsAvailable,
      gabaPeakHourSlotsAvailable: this.gabaPeakHourSlotsAvailable,
      airportGABAMaxArrivalSlotsPerDay: Number(this.airportGABAMaxArrivalSlotsPerDay) || null,
      airportGABAMaxDepartureSlotsPerDay: Number(this.airportGABAMaxDepartureSlotsPerDay) || null,
      permissionTypeId: this.permissionType?.id || null,
      notificationTypeId: this.notificationType?.id || null,
      confirmationRequiredForIds: this.confirmationRequiredFors.map(x => x.id),
      pprPurposeIds: this.pprPurposes.map(x => x.id),
      permissionRequiredForIds: this.permissionRequiredFors.map(x => x.id),
      documentIds: this.documents.map(x => x.id),
      permissionVendors: this.permissionVendors.map(x => {
        return {
          id: x.id || 0,
          permissionId: this.id || 0,
          vendorId: x.entityId,
          name: x.name,
          code: x.code,
        };
      }),
      permissionExceptions: this.permissionExceptions?.map(x => x.serialize(permissionId)) || [],
      permissionLeadTimes: this.permissionLeadTimes?.map(x => x.serialize(permissionId)) || [],
      permissionTolerances: this.permissionTolerances?.map(x => x.serialize(permissionId)) || [],
      sourceTypeId: this.sourceType?.id || 1,
    };
  }

  static deserializeList(permissions: IAPIAirportPermission[]): AirportPermissionModel[] {
    return permissions ? permissions.map((p: IAPIAirportPermission) => AirportPermissionModel.deserialize(p)) : [];
  }
}

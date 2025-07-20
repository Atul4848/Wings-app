import {
  CoreModel,
  EntityMapModel,
  getYesNoNullToBoolean,
  IdNameCodeModel,
  modelProtection,
  SettingsTypeModel,
} from '@wings-shared/core';
import { IAPIUsCustomsDetailsRequest, IAPIUsCustomsDetailsResponse } from '../Interfaces';
import { ReimbursableServicesProgramModel } from './ReimbursableServicesProgram.model';

@modelProtection
export class UsCustomsDetailsModel extends CoreModel {
  airportId: number;
  cbpPortType: SettingsTypeModel;
  cbpFactUrl: string = '';
  biometricCapabilitiesForeignNationals: boolean;
  areaPortAssignment: SettingsTypeModel;
  fieldOfficeOversight: SettingsTypeModel;
  satelliteLocation: boolean;
  driveTimeInMinutes: number;
  clearanceFBOs: IdNameCodeModel;
  preClearClearanceLocation: string = '';
  preClearRequiredInformation: string = '';
  isPreClearInternationalTrash: boolean;
  preClearUWAProcessNotes: string = '';
  preClearCustomsClearanceProcess: string = '';
  preClearSpecialInstruction: string = '';
  preClearanceDocuments: EntityMapModel[] = [];
  preClearCustomsLocations: EntityMapModel[] = [];
  reimbursableServicesProgram: ReimbursableServicesProgramModel;

  constructor(data?: Partial<UsCustomsDetailsModel>) {
    super(data);
    Object.assign(this, data);
  }

  //serialize object for create/update API
  public serialize(): IAPIUsCustomsDetailsRequest {
    return {
      id: this.id || 0,
      airportId: this.airportId,
      cbpPortTypeId: this.cbpPortType?.id || null,
      cbpFactSheetURL: this.cbpFactUrl || null,
      biometricCapabilitiesForeignNationals: getYesNoNullToBoolean(this.biometricCapabilitiesForeignNationals),
      areaPortAssignmentId: this.areaPortAssignment?.id || null,
      fieldOfficeOversightId: this.fieldOfficeOversight?.id || null,
      satelliteLocation: getYesNoNullToBoolean(this.satelliteLocation),
      driveTimeInMinutes: this.driveTimeInMinutes || null,
      preClearClearanceLocation: this.preClearClearanceLocation,
      preClearClearanceFBOVendorLocationId: this.clearanceFBOs?.id || null,
      preClearClearanceFBOVendorLocationCode: this.clearanceFBOs?.code || null,
      preClearClearanceFBOVendorLocationName: this.clearanceFBOs?.name || null,
      preClearRequiredInformation: this.preClearRequiredInformation,
      isPreClearInternationalTrash: getYesNoNullToBoolean(this.isPreClearInternationalTrash),
      preClearUWAProcessNotes: this.preClearUWAProcessNotes,
      preClearCustomsClearanceProcess: this.preClearCustomsClearanceProcess,
      preClearSpecialInstruction: this.preClearSpecialInstruction,
      preClearanceDocuments: this.preClearanceDocuments
        ? this.preClearanceDocuments?.map(x => {
          return { id: x.id, permitDocumentId: x.entityId, name: x.name, code: x.code };
        })
        : [],
      preClearCustomsLocations: this.preClearCustomsLocations
        ? this.preClearCustomsLocations?.map(x => x.entityId)
        : [],
      reimbursableServicesProgram: this.reimbursableServicesProgram?.serialize() || null,
    };
  }

  static deserialize(apiData: IAPIUsCustomsDetailsResponse): UsCustomsDetailsModel {
    if (!apiData) {
      return new UsCustomsDetailsModel();
    }
    const data: Partial<UsCustomsDetailsModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.id,
      cbpPortType: apiData.cbpPortType
        ? new SettingsTypeModel({
          ...apiData.cbpPortType,
          id: apiData.cbpPortType.cbpPortTypeId,
        })
        : null,
      cbpFactUrl: apiData.cbpFactSheetURL,
      areaPortAssignment: apiData.areaPortAssignment
        ? new SettingsTypeModel({
          ...apiData.areaPortAssignment,
          id: apiData.areaPortAssignment.areaPortAssignmentId,
        })
        : null,
      fieldOfficeOversight: apiData.fieldOfficeOversight
        ? new SettingsTypeModel({
          ...apiData.fieldOfficeOversight,
          id: apiData.fieldOfficeOversight.fieldOfficeOversightId,
        })
        : null,
      satelliteLocation: apiData.satelliteLocation,
      driveTimeInMinutes: apiData.driveTimeInMinutes,
      clearanceFBOs: apiData.preClearance?.preClearClearanceFBOVendor
        ? new IdNameCodeModel({
          ...apiData.preClearance.preClearClearanceFBOVendor,
          id: apiData.preClearance.preClearClearanceFBOVendor.vendorLocationId,
          name: apiData.preClearance.preClearClearanceFBOVendor.vendorLocationName,
          code: apiData.preClearance.preClearClearanceFBOVendor.vendorLocationCode,
        })
        : null,
      preClearClearanceLocation: apiData.preClearance?.preClearClearanceLocation,
      preClearRequiredInformation: apiData.preClearance?.preClearRequiredInformation,
      isPreClearInternationalTrash: apiData.preClearance?.isPreClearInternationalTrash,
      preClearUWAProcessNotes: apiData.preClearance?.preClearUWAProcessNotes,
      preClearCustomsClearanceProcess: apiData.preClearance?.preClearCustomsClearanceProcess,
      preClearSpecialInstruction: apiData.preClearance?.preClearSpecialInstruction,
      preClearanceDocuments: apiData.preClearance?.preClearanceDocuments?.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.preClearanceDocumentId || entity.id,
            entityId: entity.permitDocumentId,
          })
      ),
      preClearCustomsLocations: apiData.preClearance?.preClearCustomsLocations?.map(
        entity =>
          new EntityMapModel({
            ...entity,
            id: entity.preClearCustomsLocationInformationId || entity.id,
            entityId: entity.customsLocationInformationId,
          })
      ),
      reimbursableServicesProgram: ReimbursableServicesProgramModel.deserialize(apiData.reimbursableServicesProgram),
    };
    return new UsCustomsDetailsModel(data);
  }

  static deserializeList(apiDataList: IAPIUsCustomsDetailsResponse[]): UsCustomsDetailsModel[] {
    return apiDataList ? apiDataList.map(apiData => UsCustomsDetailsModel.deserialize(apiData)) : [];
  }
}

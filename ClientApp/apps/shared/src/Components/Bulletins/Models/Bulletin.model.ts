import { IAPIBulletin, IAPIBulletinRequest } from '../Interfaces';
import { CoreModel, IdNameCodeModel, modelProtection, SettingsTypeModel } from '@wings-shared/core';
import { UAOfficesModel } from './UAOffices.model';
import { BulletinEntityModel } from './BulletinEntity.model';

@modelProtection
export class BulletinModel extends CoreModel {
  startDate: string = '';
  endDate: string = '';
  bulletinText: string = '';
  internalNotes: string = '';
  sourceNotes: string = '';
  dmNotes: string = '';
  notamNumber: string = '';
  vendorName: string = '';
  bulletinCAPPSCategory: IdNameCodeModel;
  isUFN: boolean = false;
  runTripChecker: boolean = null;
  uaOffice: UAOfficesModel;
  bulletinLevel: SettingsTypeModel;
  bulletinEntity: BulletinEntityModel;
  bulletinSource: SettingsTypeModel;
  appliedBulletinTypes: SettingsTypeModel;
  bulletinPriority: SettingsTypeModel;
  syncToCAPPS: boolean = false;
  vendorLocationAirport: IdNameCodeModel;
  // id for purged bulletins
  purgedBulletinId: number;

  constructor(data?: Partial<BulletinModel>) {
    super(data);
    Object.assign(this, data);
    this.uaOffice = data?.uaOffice ? new UAOfficesModel(data?.uaOffice) : null;
    this.bulletinLevel = data?.bulletinLevel ? new SettingsTypeModel(data?.bulletinLevel) : null;
    this.bulletinSource = data?.bulletinSource ? new SettingsTypeModel(data?.bulletinSource) : null;
    this.bulletinEntity = data?.bulletinEntity ? new BulletinEntityModel(data?.bulletinEntity) : null;
    this.appliedBulletinTypes = data?.appliedBulletinTypes ? new SettingsTypeModel(data?.appliedBulletinTypes) : null;
    this.bulletinPriority = data?.bulletinPriority ? new SettingsTypeModel(data?.bulletinPriority) : null;
    this.bulletinCAPPSCategory = data?.bulletinCAPPSCategory ? new IdNameCodeModel(data?.bulletinCAPPSCategory) : null;
    this.vendorLocationAirport = data?.vendorLocationAirport ? new IdNameCodeModel(data?.vendorLocationAirport) : null;
  }

  static deserialize(apiData: IAPIBulletin): BulletinModel {
    if (!apiData) {
      return new BulletinModel();
    }

    const data: Partial<BulletinModel> = {
      ...apiData,
      ...CoreModel.deserializeAuditFields(apiData),
      id: apiData.bulletinId || apiData.id,
      purgedBulletinId: apiData.id,
      appliedBulletinTypes: new SettingsTypeModel({
        ...apiData?.appliedBulletinTypes[0]?.bulletinType,
        id: apiData.appliedBulletinTypes[0]?.bulletinType.bulletinTypeId,
      }),
      uaOffice: new UAOfficesModel({
        ...apiData.uaOffice,
        id: apiData.uaOffice?.uaOfficeId || apiData.uaOffice?.id,
      }),
      bulletinLevel: new SettingsTypeModel({
        ...apiData.bulletinLevel,
        id: apiData.bulletinLevel?.bulletinLevelId || apiData.bulletinLevel?.id,
      }),
      bulletinSource: new SettingsTypeModel({
        ...apiData.bulletinSource,
        id: apiData.bulletinSource?.bulletinSourceId || apiData.bulletinSource?.id,
      }),
      bulletinEntity: new BulletinEntityModel({
        ...apiData.bulletinEntity,
        entityId: apiData.bulletinEntity?.bulletinEntityId || apiData.bulletinEntity?.id,
        airportCode: apiData.vendorLocationAirport?.displayCode,
      }),
      bulletinPriority: new SettingsTypeModel({
        ...apiData.bulletinPriority,
        id: apiData.bulletinPriority?.bulletinPriorityId || apiData.bulletinPriority?.id,
      }),
      bulletinCAPPSCategory: new IdNameCodeModel({
        ...apiData.bulletinCAPPSCategory,
        id: apiData.bulletinCAPPSCategory?.bulletinCAPPSCategoryId || apiData.bulletinCAPPSCategory?.id,
      }),
      vendorLocationAirport: new IdNameCodeModel({
        ...apiData.vendorLocationAirport,
        id: apiData.vendorLocationAirport?.airportId,
        name: apiData.vendorLocationAirport?.airportName,
        code: apiData.vendorLocationAirport?.displayCode,
      }),
    };
    return new BulletinModel(data);
  }

  // serialize object for create/update API
  public serialize(): IAPIBulletinRequest {
    return {
      id: this.id || 0,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      bulletinText: this.bulletinText,
      internalNotes: this.internalNotes,
      sourceNotes: this.sourceNotes,
      dmNotes: this.dmNotes,
      vendorName: this.vendorName,
      notamNumber: this.notamNumber,
      bulletinCAPPSCategoryId: this.bulletinCAPPSCategory?.id,
      isUFN: this.isUFN || false,
      runTripChecker: this.runTripChecker,
      uaOfficeId: this.uaOffice?.id,
      uaOfficeName: this.uaOffice?.name,
      bulletinLevelId: this.bulletinLevel?.id,
      bulletinSourceId: this.bulletinSource?.id,
      bulletinEntityId: this.bulletinEntity?.entityId,
      bulletinEntityName: this.bulletinEntity?.name,
      bulletinEntityCode: this.bulletinEntity?.code,
      bulletinTypeIds: [ this.appliedBulletinTypes.id ],
      bulletinPriorityId: this.bulletinPriority?.id,
      syncToCAPPS: this.syncToCAPPS,
      vendorLocationAirportId: this.vendorLocationAirport?.id,
      ...this._serialize(),
    };
  }

  static deserializeList(apiBulletins: IAPIBulletin[]): BulletinModel[] {
    return apiBulletins ? apiBulletins.map((bulletin: IAPIBulletin) => BulletinModel.deserialize(bulletin)) : [];
  }
}

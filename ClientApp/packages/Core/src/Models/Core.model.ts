import { ENTITY_STATE, MODEL_STATUS } from '../Enums';
import { AccessLevelModel } from './AccessLevel.model';
import { SourceTypeModel } from './SourceType.model';
import { StatusTypeModel } from './StatusType.model';
import { IdNameModel } from './IdName.model';
import { modelProtection } from '../Decorators';
import { IBaseApiResponse } from '../Interfaces';

@modelProtection
export class CoreModel<T = number> extends IdNameModel<T> {
  // reference id used for multi select type entity
  referenceId?: number = 0;
  createdOn?: string;
  modifiedOn?: string;
  createdBy?: string;
  modifiedBy?: string;
  updatedBy?: string;
  createdDate?: string;
  updatedDate?: string;
  entityState?: ENTITY_STATE = ENTITY_STATE.UNCHNAGED;
  statusId?: MODEL_STATUS = MODEL_STATUS.ACTIVE;
  accessLevelId?: number = null;
  sourceTypeId?: number = null;
  // view only required for grid dropdown
  status?: StatusTypeModel;
  accessLevel?: AccessLevelModel;
  sourceType?: SourceTypeModel;
  userId?: string = '';

  constructor(data?: Partial<CoreModel>) {
    super();
    Object.assign(this, data);
    // view Only filed for Auto Complete
    this.status = data?.status || new StatusTypeModel();
    this.accessLevel = data?.accessLevel || new AccessLevelModel();
    this.sourceType = data?.sourceType || new SourceTypeModel();
    /* as we are now using objects for this type of fields
       so first we are checking if id is available in object or not */
    this.statusId = this.status?.id || data?.statusId || MODEL_STATUS.ACTIVE;
    this.accessLevelId = this.accessLevel?.id || data?.accessLevelId;
    this.sourceTypeId = this.sourceType?.id || data?.sourceTypeId;
  }

  public get isActive(): boolean {
    return this.status?.id === MODEL_STATUS.ACTIVE;
  }

  // Not using model here because we needs to parse Audit fields only
  static deserializeAuditFields(apiData: IBaseApiResponse): Partial<CoreModel> {
    if (!apiData) {
      return null;
    }
    const data: Partial<CoreModel> = {
      createdBy: apiData.createdBy,
      modifiedBy: apiData.modifiedBy || apiData.updatedBy,
      createdOn: apiData.createdOn || apiData.createdDate,
      modifiedOn: apiData.modifiedOn || apiData.updatedDate,
      status: StatusTypeModel.deserialize(apiData.status),
      accessLevel: AccessLevelModel.deserialize(apiData.accessLevel),
      sourceType: SourceTypeModel.deserialize(apiData.sourceType),
    };
    return data;
  }

  // Serialize common fields
  public _serialize(): Partial<IBaseApiResponse> {
    return {
      statusId: this.status?.id,
      accessLevelId: this.accessLevel?.id,
      sourceTypeId: this.sourceType?.id,
    };
  }
}

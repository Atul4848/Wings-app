import { MODEL_STATUS } from '../Enums';
import { AccessLevelModel, StatusTypeModel, SourceTypeModel } from '../Models';

export interface IBaseApiResponse {
  id: number;
  name?: string;
  createdOn?: string;
  modifiedOn?: string;
  createdBy?: string;
  modifiedBy?: string;
  statusId?: MODEL_STATUS;
  accessLevelId?: number;
  accessLevelName?: string;
  sourceTypeId?: number;
  sourceTypeName?: string;
  accessLevel?: AccessLevelModel;
  sourceType?: SourceTypeModel;
  status?: StatusTypeModel;
  // Refactor After API Changes
  createdDate?: string;
  updatedDate?: string;
  updatedBy?: string;
  summaryDescription?: string;
}

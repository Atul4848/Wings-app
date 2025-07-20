import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';


@modelProtection
export class OperationTypeDocumentList extends CoreModel implements ISelectOption {
  id: number = 0;
  operationTypeId: number = 0;
  operationType: SettingBaseModel = new SettingBaseModel();
  documentNameId: number = 0;
  documentName: SettingBaseModel = new SettingBaseModel();
  isRequired: boolean = false;
  statusId: number = 0;
  documentType: SettingBaseModel = new SettingBaseModel();
  status: SettingBaseModel = new SettingBaseModel(); 

  constructor(data?: Partial<OperationTypeDocumentList>) {
    super(data);
    Object.assign(this, data);
  }

  public serialize(): OperationTypeDocumentList {
    return {
      id: this.id || 0,
      userId: this.userId,
      
    };
  }

  static deserialize(apiData: OperationTypeDocumentList): OperationTypeDocumentList {
    if (!apiData) {
      return new OperationTypeDocumentList();
    }
    const data: Partial<OperationTypeDocumentList> = {
      ...apiData,
      documentType: SettingBaseModel.deserialize(apiData.documentType),
      status: SettingBaseModel.deserialize(apiData.status),
    };
    return new OperationTypeDocumentList(data);
  }

  static deserializeDocument(apiData: OperationTypeDocumentList): OperationTypeDocumentList {
    if (!apiData) {
      return new OperationTypeDocumentList();
    }
    const data: Partial<OperationTypeDocumentList> = {
      ...apiData,
      operationTypeId: apiData.operationTypeId,
      operationType: SettingBaseModel.deserialize(apiData.operationType),
      documentNameId: apiData.documentNameId,
      documentName: SettingBaseModel.deserialize(apiData.documentName),
      isRequired: apiData.isRequired,
      statusId: apiData.statusId,
      status: SettingBaseModel.deserialize(apiData.status)
    };
    return new OperationTypeDocumentList(data);
  }

  static deserializeList(apiDataList: OperationTypeDocumentList[]): OperationTypeDocumentList[] {
    return apiDataList ? apiDataList.map(apiData => OperationTypeDocumentList.deserialize(apiData)) : [];
  }

  public get label(): string {
    return this.documentType.name;
  }

  public get value(): string | number {
    return this.id;
  }
}

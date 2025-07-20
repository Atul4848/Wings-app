import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { VendorManagmentModel } from './VendorManagment.model';
import { ApprovalDataModel } from './ApprovalData.model';
import { SettingBaseModel } from './SettingBase.model';

@modelProtection
export class ApprovalModel  extends CoreModel{
  id: number = 0;
  entityName: string = '';
  vendorId: number = 0;
  approvalDatas: ApprovalDataModel[] = [];
  vendor: VendorManagmentModel = new VendorManagmentModel();
  status:SettingBaseModel=new SettingBaseModel();

  constructor(data?: Partial<ApprovalModel>) {
    super(data);
    Object.assign(this, data);
    this.approvalDatas = data?.approvalDatas?.map(x => new ApprovalDataModel(x)) || [];
  }
  
  static deserialize(apiData: ApprovalModel): ApprovalModel {
    if (!apiData) {
      return new ApprovalModel();
    }
    const data: Partial<ApprovalModel> = {
      id: apiData.id,
      entityName: apiData.entityName,
      vendorId: apiData.vendorId,
      status:SettingBaseModel.deserialize(apiData.status),
      approvalDatas: ApprovalDataModel.deserializeList(apiData.approvalDatas),
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
    };
    return new ApprovalModel(data);
  }

  static deserializeList(apiData: ApprovalModel[]): ApprovalModel[] {
    return apiData ? apiData.map((data: ApprovalModel) => ApprovalModel.deserialize(data)) : [];
  }

  public get label(): string {
    return this.entityName;
  }

  public get value(): string | number {
    return this.id;
  }
}

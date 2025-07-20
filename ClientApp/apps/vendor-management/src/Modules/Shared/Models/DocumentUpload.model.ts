import { CoreModel,ISelectOption, MODEL_STATUS, Utilities, modelProtection } from '@wings-shared/core'
import { SettingBaseModel } from './SettingBase.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { IAPIRequestDocumentUpload } from '../Interfaces/Request/API-Request-DocumentUpload.interface';
import { StatusBaseModel } from './StatusBase.model';
import { IAPIResponseDocumentUpload } from '../Interfaces/Response/API-Response-DocumentUpload';
import { VendorLocationModel } from './VendorLocation.model';
import { AuthStore } from '@wings-shared/security';

@modelProtection
export class DocumentUploadModel extends CoreModel implements ISelectOption {
  id:number =0;
  vendor?:VendorManagmentModel=new VendorManagmentModel();
  vendorLocation?: VendorLocationModel = new VendorLocationModel();
  name:SettingBaseModel=new SettingBaseModel();
  otherName: string='';
  documentUri: string='';
  status:StatusBaseModel=new StatusBaseModel();
  statusId: number;
  vendorId?: number;
  vendorLocationId?: number;
  documentNameId: number;
  startDate: Date = new Date();
  endDate?: Date = null;
  comment?: string = null;
  lastUpdated: string = AuthStore.user?.name || '';
  isRestricted: boolean = false;
  
  constructor(data?: Partial<DocumentUploadModel>) {
    super(data);
    Object.assign(this, data);
  }
  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): string | number {
    return this.id;
  }

  public serialize(documentUri:string,vendorId: number,vendorLocationId:number): IAPIRequestDocumentUpload {
    return {
      userId: '',
      id: this.id,
      documentUri: documentUri? documentUri : this.documentUri,
      statusId: this.status?.id,
      documentNameId: this.name.id,
      isRestricted: this.isRestricted,
      vendorId: vendorId,
      otherName: this.otherName || null,
      vendorLocationId: vendorLocationId,
      startDate: this.startDate,
      endDate: this.endDate || null,
      comment: this.comment?.replace(/^\s*\s*$/, '') || null,
      lastUpdated: AuthStore.user?.name
    };
  }

  static deserialize(apiData: IAPIResponseDocumentUpload): DocumentUploadModel {
    if (!apiData) {
      return new DocumentUploadModel();
    }
    const data: Partial<DocumentUploadModel> = {
      ...apiData,
      vendor: VendorManagmentModel.deserialize(apiData?.vendor),
      vendorLocation: VendorLocationModel.deserialize(apiData?.vendorLocation),
      name: SettingBaseModel.deserialize(apiData.documentName),
      status: StatusBaseModel.deserialize(apiData.status),
      documentUri: apiData.documentUri,
      otherName: apiData.otherName,
      startDate: apiData.startDate,
      endDate: apiData.endDate,
      comment: apiData.comment,
      lastUpdated: apiData.lastUpdated
    };
    return new DocumentUploadModel(data);
  }



  static deserializeList(apiDataList: IAPIResponseDocumentUpload[]): DocumentUploadModel[] {
    return apiDataList ? apiDataList.map((apiData) => DocumentUploadModel.deserialize(apiData)) : [];
  }
}
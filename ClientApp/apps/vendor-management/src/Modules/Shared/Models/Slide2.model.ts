import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorLocationCountryModel } from './VendorLocationCountry.model';
import { Airports } from './Airports.model';
import { VendorUserModel } from './VendorUser.model';
import { VendorManagmentModel } from './VendorManagment.model';
import { OperationTypeDocumentList } from './OperationTypeDocumentList.model';
import { StatusBaseModel } from './StatusBase.model';
import { AuthStore } from '@wings-shared/security';
import { IAPIResponseVendor } from '../Interfaces/Response/API-Response-Vendor';
import { IAPISettingBase } from '../Interfaces/API-SettingBase';

export interface IAPIResponseVendorOnBoardSlide3Document {
    id: number;
    vendor: IAPIResponseVendor;
    tempLocationId: string;
    operationTypeDocument: IAPIResponseOperationTypeDocument;
    documentUri: string;
    otherName: string;
    startDate: string;
    endDate?: string;
    documentStatus: IAPISettingBase;
  }
  
export interface IAPIResponseOperationTypeDocument {
    userId: string;
    id: number;
    operationTypeId: number;
    operationType: IAPISettingBase;
    documentNameId: number;
    documentName: IAPISettingBase;
    isRequired: boolean;
    statusId: number;
    status: IAPISettingBase;
  }

@modelProtection
export class Slide2Model extends CoreModel implements ISelectOption {
    id: number = 0;
    vendor?: VendorManagmentModel = new VendorManagmentModel();
    documentUri: string = '';
    otherName: string = '';
    startDate: Date = new Date();
    endDate?: Date = null;
    tempLocationId: string = '';
    operationTypeDocument: OperationTypeDocumentList = new OperationTypeDocumentList();
    documentStatus: SettingBaseModel = new SettingBaseModel();
    lastUpdated: string = '';
  
    constructor(data?: Partial<Slide2Model>) {
      super(data);
      Object.assign(this, data);
    }
  
    // required in auto complete
    public get label(): string {
      return this.operationTypeDocument.documentName;
    }
  
    public get value(): string | number {
      return this.id;
    }
  
    static deserialize(apiData: IAPIResponseVendorOnBoardSlide3Document): Slide2Model {
      if (!apiData) {
        return new Slide2Model();
      }
      const data: Partial<Slide2Model> = {
        ...apiData,
        vendor: VendorManagmentModel.deserialize(apiData?.vendor),
        tempLocationId: apiData.tempLocationId,
        operationTypeDocument: OperationTypeDocumentList.deserializeDocument(apiData.operationTypeDocument),
        documentUri: apiData.documentUri,
        otherName: apiData.otherName,
        startDate: apiData.startDate,
        endDate: apiData.endDate,
        documentStatus: StatusBaseModel.deserialize(apiData.documentStatus),
        lastUpdated: AuthStore.user?.name
      };
      return new Slide2Model(data);
    }
  
    static deserializeList(apiDataList: IAPIResponseVendorOnBoardSlide3Document[]): Slide2Model[] {
      return apiDataList ? apiDataList.map(apiData => Slide2Model.deserialize(apiData)) : [];
    }
}

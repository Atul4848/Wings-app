import { CoreModel, IBaseApiResponse, modelProtection } from '@wings-shared/core';
import { SettingBaseModel } from './SettingBase.model';
import { VendorManagmentModel } from './VendorManagment.model';
import React, { DetailedReactHTMLElement, HTMLAttributes } from 'react';
import { VendorLocationModel } from './VendorLocation.model';

@modelProtection
export class ApprovalDataModel extends CoreModel {
  id: number = 0;
  entityName: string = '';
  fieldName: string = '';
  oldValue: string = '';
  newValue: string = '';
  isListField: boolean = false;
  comment: string = '';
  statusId: number = 0;
  status: SettingBaseModel = new SettingBaseModel();
  entityReferenceId: number = 0;
  parentReferenceId: number = 0;
  vendorId: number = 0;
  vendor: VendorManagmentModel = new VendorManagmentModel();
  vendorLocation: VendorLocationModel = new VendorLocationModel();
  path: number[];
  entityAndFeildName: string = '';
  vendorLocationId: number = 0;
  isTopUsageAirport:boolean = false;
  vendorLevel: SettingBaseModel = new SettingBaseModel();
  airportRank:number;


  constructor(data?: Partial<ApprovalDataModel>) {
    super(data);
    Object.assign(this, data);
  }

  public serialize(data: ApprovalDataModel[], statusId: number): ApprovalDataModel {
    return {
      userId: this.userId || '',
      requestedApprovalIds: this.serializeList(data),
      statusId: statusId ? statusId : this.status?.id,
      comment: this.comment,
    };
  }

  public serializeList(data: ApprovalDataModel[]): ApprovalDataModel[] {
    return data.map(item => ({
      approvalDataId: item.id || 0,
      vendorCode: item.vendor.code,
      entityName: item.entityName,
    }));
  }

  static deserialize(apiData: ApprovalDataModel): ApprovalDataModel {
    if (!apiData) {
      return new ApprovalDataModel();
    }
    const data: Partial<ApprovalDataModel> = {
      ...apiData,
      id: apiData.id,
      fieldName: apiData.fieldName,
      entityName: apiData.entityName,
      oldValue: apiData.oldValue,
      newValue: apiData.newValue,
      isListField: apiData.isListField,
      comment: apiData.comment,
      statusId: apiData.statusId,
      status: SettingBaseModel.deserialize(apiData.status),
      entityReferenceId: apiData.entityReferenceId,
      parentReferenceId: apiData.parentReferenceId,
      vendorId: apiData.vendorId,
      vendorLocationId: apiData.vendorLocationId,
      vendor: VendorManagmentModel.deserialize(apiData.vendor),
      vendorLocation:VendorLocationModel.deserialize(apiData.vendorLocation),
      path: apiData.path,
      entityAndFeildName: apiData?.fieldName ? apiData?.fieldName : apiData?.entityName || '',
      isTopUsageAirport:apiData.isTopUsageAirport,
      airportRank:apiData.airportRank,
      vendorLevel:SettingBaseModel.deserialize(apiData.vendorLevel)
    };
    return new ApprovalDataModel(data);
  }

  static deserializeList(apiData: ApprovalDataModel[]): ApprovalDataModel[] {
    return apiData ? apiData.map((data: ApprovalDataModel) => ApprovalDataModel.deserialize(data)) : [];
  }

  static displayValueFormatter(value) {
    const type = ApprovalDataModel.getValueType(value);
    switch (type) {
      case 'ARRAY':
        const objArray = JSON.parse(value);
        const elements: DetailedReactHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>[] = [];
        objArray.forEach(obj => {
          const ele = ApprovalDataModel.parseObject(obj);
          elements.push(ele);
        });
        return React.createElement('div', { key: 1 }, elements);
      case 'Object':
        const obj = JSON.parse(value);
        return ApprovalDataModel.parseObject(obj);
      default:
        return value;
    }
  }

  static getValueType(value) {
    const jsonValue = ApprovalDataModel.getJSON(value);
    const type = Object.prototype.toString.call(jsonValue);
    switch (type) {
      case '[object Array]':
        return 'ARRAY';
      case '[object Object]':
        return 'Object';
      default:
        return 'string';
    }
  }

  static parseObject(obj) {
    const elements: DetailedReactHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>[] = [];
    Object.keys(obj).map((key, index) => {
      const spanElement = React.createElement('span', { key: index }, `${key}:${obj[key]}`);
      const pElement = React.createElement('div', { key: index }, spanElement);
      elements.push(pElement);
    });
    return React.createElement('div', { key: 1 }, elements);
  }

  static getJSON(item) {
    let value = item;
    try {
      value = JSON.parse(value);
    } catch (e) {
      return value;
    }

    return value;
  }

  static updateStatus(gridState,agGrid,flattenedData,statusId,statusName){
    const rows = agGrid._getAllTableRows();
    flattenedData.forEach(fd=>{
      const rowData = rows.find(r=>r.id==fd.id);
      rowData.statusId=statusId;
      rowData.status= SettingBaseModel.deserialize(new SettingBaseModel({ id:2,name:statusName }));
      const rowNode = gridState.gridApi.getRowNode(rowData.id);
      console.log(`rowData at index ${rowNode?.rowIndex}`,rowData)
      agGrid._updateTableItem(rowNode?.rowIndex,rowData);
    });
  }
}

import { CoreModel, modelProtection, IdNameCodeModel } from '@wings-shared/core';
import { IAPICustomerAssociatedOffice } from '../Interfaces';

@modelProtection
export class CustomerAssociatedOfficeModel extends CoreModel {
  customerAssociatedOfficeId: number;
  code: string;
  airport: IdNameCodeModel;

  constructor(data?: Partial<CustomerAssociatedOfficeModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: IAPICustomerAssociatedOffice): CustomerAssociatedOfficeModel {
    if (!apiData) {
      return new CustomerAssociatedOfficeModel();
    }
    const data: Partial<CustomerAssociatedOfficeModel> = {
      ...apiData,
      airport: IdNameCodeModel.deserialize({
        id: apiData.airport.airportId,
        name: apiData.airport.airportName,
        code: apiData.airport.airportCode,
      }),
    };
    return new CustomerAssociatedOfficeModel(data);
  }

  static deserializeList(apiDataList: IAPICustomerAssociatedOffice[]): CustomerAssociatedOfficeModel[] {
    return apiDataList
      ? apiDataList.map(apiData => CustomerAssociatedOfficeModel.deserialize(apiData))
      : [];
  }
}

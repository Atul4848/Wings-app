import { CoreModel, ISelectOption, modelProtection } from '@wings-shared/core';
import {
  IAPIAssociatedOffice,
  IAPIAssociatedOperators,
  IAPIAssociatedRegistries,
  IAPIAssociatedSites,
  IAPICustomer,
  ICustomerRequest,
} from '../Interfaces';
import { AssociatedRegistriesModel } from './AssociatedRegistries.model';
import { AssociatedOperatorsModel } from './AssociatedOperators.model';
import { AssociatedSitesModel } from './AssociatedSites.model';
import { AssociatedOfficeModel } from './AssociatedOffice.model';

@modelProtection
export class CustomerModel extends CoreModel implements ISelectOption {
  number: string;
  partyId: number;
  partyNumber: string;
  partyAltName: string;
  partyType: string;
  corporateSegment: string;
  classification: string;
  startDate: string;
  endDate: string;
  region: string;
  collectorName: string;
  collectorId: string;
  creditRating: string;
  paymentTerms: string;
  creditAnalyst: string;
  dmClient: string;
  riskCode: string;
  accountStatus: string;
  collectionType: string;
  category: string;
  creditLimit: string;
  creditLimitCurr: string;
  associatedRegistries: AssociatedRegistriesModel[];
  associatedOperators: AssociatedOperatorsModel[];
  associatedSites: AssociatedSitesModel[];
  associatedOffices: AssociatedOfficeModel[];

  constructor(data?: Partial<CustomerModel>) {
    super(data);
    Object.assign(this, data);
  }

  // required in auto complete
  public get label(): string {
    return this.name;
  }

  public get value(): number {
    return this.id;
  }

  static deserialize(apiData: IAPICustomer): CustomerModel {
    if (!apiData) {
      return new CustomerModel();
    }
    const data: Partial<CustomerModel> = {
      ...apiData,
      id: apiData.customerId || apiData.id,
      associatedRegistries: AssociatedRegistriesModel.deserializeList(
        apiData.associatedRegistries as IAPIAssociatedRegistries[]
      ),
      associatedOperators: AssociatedOperatorsModel.deserializeList(
        apiData.associatedOperators as IAPIAssociatedOperators[]
      ),
      associatedSites: AssociatedSitesModel.deserializeList(apiData.associatedSites as IAPIAssociatedSites[]),
      associatedOffices: AssociatedOfficeModel.deserializeList(apiData.associatedOffices as IAPIAssociatedOffice[]),
      ...CoreModel.deserializeAuditFields(apiData),
    };
    return new CustomerModel(data);
  }

  static deserializeList(apiDataList: IAPICustomer[]): CustomerModel[] {
    return apiDataList ? apiDataList.map(apiData => CustomerModel.deserialize(apiData)) : [];
  }

  // serialize object for create/update API
  public serialize(): ICustomerRequest {
    return {
      id: this.id,
      name: this.name,
      number: this.number,
      ...this._serialize(),
    };
  }
}

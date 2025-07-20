import { modelProtection, DATE_FORMAT, IdNameModel, ISelectOption } from '@wings-shared/core';
import { IAPICSDUserResponse } from '../Interfaces';
import { UserServicesNProductsModel } from './UserServicesNProducts.model';
import moment from 'moment';

@modelProtection
export class CSDUserModel extends IdNameModel implements ISelectOption {
  firstName: string = '';
  lastName: string = '';
  customerNumber: string = '';
  email: string = '';
  stagedEmail: string = '';
  username: string = '';
  servicesNProducts: UserServicesNProductsModel[];
  oktaImportDate: string = '';

  constructor(data?: Partial<CSDUserModel>) {
    super();
    Object.assign(this, data);
    this.servicesNProducts =
      data?.servicesNProducts?.map((record: UserServicesNProductsModel) =>
        new UserServicesNProductsModel(record)) || [];
  }

  public get fullName(): string {
    return [ this.firstName, this.lastName ].filter(p => Boolean(p)).join(' ');
  }

  static deserialize(user: IAPICSDUserResponse): CSDUserModel {
    if (!user) {
      return new CSDUserModel();
    }

    const data: Partial<CSDUserModel> = {
      id: user.UserId,
      firstName: user.FirstName,
      lastName: user.LastName,
      name: user.Username,
      customerNumber: user.CustomerNumber,
      email: user.Email,
      stagedEmail: user.StagedEmail,
      servicesNProducts: UserServicesNProductsModel.deserializeList(user.ServicesNProducts),
      oktaImportDate: user.OktaImportDate ?
        moment.utc(user.OktaImportDate).local().format(DATE_FORMAT.GRID_DISPLAY) : '',
    };

    return new CSDUserModel(data);
  }

  static deserializeList(users: IAPICSDUserResponse[]): CSDUserModel[] {
    return users ? users.map((user: IAPICSDUserResponse) => CSDUserModel.deserialize(user)) : [];
  }

  // required in auto complete
  public get label(): string {
    if (!Boolean(this.name) && !Boolean(this.email)) {
      return '';
    }
    return `${this.name} | ${this.email}`;
  }

  public get value(): string | number {
    return this.id;
  }
}

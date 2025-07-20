import { EntityMapModel, ISelectOption } from '@wings-shared/core';

export class BulletinEntityModel extends EntityMapModel implements ISelectOption {
  airportCode: string = '';

  constructor(data?: Partial<BulletinEntityModel>) {
    super(data);
    Object.assign(this, data);
  }

  static deserialize(apiData: BulletinEntityModel): BulletinEntityModel {
    if (!apiData) {
      return new BulletinEntityModel();
    }
    return new BulletinEntityModel(apiData);
  }

  // required in auto complete
  public get label(): string {
    if (this.name && this.code && this.airportCode) {
      return `${this.name} (${this.code}) - ${this.airportCode}`;
    }
    if (this.name && this.code) {
      return `${this.name}(${this.code})`;
    }
    return this.name || this.code;
  }

  public get value(): string | number {
    return this.id;
  }
}

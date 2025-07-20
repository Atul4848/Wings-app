import { ISelectOption } from '@wings-shared/core';

export class DynamicEntityModel implements ISelectOption {
  id: number = 0;
  entityId: number = 0; // id from mapped model i.e Airport, Country, etc.
  code: string = '';
  name: string | number | boolean = ''; // name usad as value in auto complete and other places
  // used to identify if the id is temporary or not help in local remove operations
  isTempId: boolean = false;

  constructor(data?: Partial<DynamicEntityModel>) {
    Object.assign(this, data);
  }

  serilize(): any {
    return {};
  }

  static deserializeList(data: any[]): DynamicEntityModel[] {
    return [];
  }

  // Use this method to map API data to DynamicEntityModel list
  // This is used in auto complete and other places where we need to map API data to DynamicEntityModel
  static mapToList(apiData: any[], key: string): DynamicEntityModel[] {
    const data = apiData.map(x => {
      const obj = new DynamicEntityModel();
      obj.entityId = x.id;
      switch (key) {
        case 'airport':
          obj.name = x.name;
          obj.code = x.displayCode;
          break;
        case 'state':
          obj.name = x.commonName;
          obj.code = x.entityCode;
          break;
        case 'country':
          obj.name = x.commonName;
          obj.code = x.isO2Code;
          break;
        case 'city':
          obj.name = x.commonName || x.officialName;
          obj.code = x.cappsCode || x.code;
          break;
        case 'fartype':
          obj.name = x.name;
          obj.code = x.cappsCode;
          break;
        case 'region':
          obj.name = x.regionName || x.name;
          obj.code = x.code;
          break;
        default:
          obj.entityId = x.id;
          obj.name = x.name;
          obj.code = x.code;
      }
      return obj;
    });
    return data;
  }

  // required in auto complete
  public get label(): string {
    if (typeof this.name === 'boolean') {
      return this.name as any;
    }
    if (this.name && this.code) {
      return `${this.name}(${this.code})`;
    }
    return (this.name as string) || this.code;
  }

  public get value(): string | number {
    return this.entityId;
  }
}

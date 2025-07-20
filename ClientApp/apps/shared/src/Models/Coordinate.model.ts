import { IAPICoordinate } from '../Interfaces';
import { ISelectOption, modelProtection } from '@wings-shared/core';

@modelProtection
export class CoordinateModel implements ISelectOption {
  direction: string = '';
  degree: string = '';
  minutes: string = '';
  seconds: string = '';

  constructor(data?: Partial<CoordinateModel>) {
    Object.assign(this, data);
  }
  value: string | number | boolean;

  static deserialize(apiData: IAPICoordinate): CoordinateModel {
    if (!apiData) {
      return new CoordinateModel();
    }
    return new CoordinateModel({
      ...apiData,
      direction: apiData.direction,
      degree: apiData.degree,
      minutes: apiData.minutes,
      seconds: apiData.seconds,
    });
  }

  public get label(): string {
    if (this.degree && this.minutes && this.seconds && this.direction) {
      return `${this.degree}° ${this.minutes}' ${this.seconds}'' ${this.direction}`;
    }
    return '';
  }
}
